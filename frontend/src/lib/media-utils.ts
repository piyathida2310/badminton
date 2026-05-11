/**
 * Media compression utilities using native Browser APIs (Canvas & MediaRecorder)
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: string;
}

/**
 * Compresses an image file using Canvas API
 */
export const compressImage = (
  file: File,
  options: CompressionOptions = {}
): Promise<File> => {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    mimeType = "image/jpeg",
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Failed to get canvas context"));
        }

        // Draw image to canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Export as Blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error("Canvas toBlob failed"));
            }
            const compressedFile = new File([blob], file.name, {
              type: mimeType,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          mimeType,
          quality
        );
      };
      img.onerror = () => reject(new Error("Failed to load image"));
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
  });
};

/**
 * Compresses a video file using MediaRecorder API
 * Note: This works by "re-recording" the video onto a canvas.
 * It's not as efficient as FFmpeg but uses only native browser APIs.
 */
export const compressVideo = async (
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    bitrate?: number; // in bits per second, e.g., 1,500,000 for 1.5 Mbps
  } = {}
): Promise<File> => {
  const {
    maxWidth = 720,
    maxHeight = 720,
    bitrate = 1500000,
  } = options;

  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const url = URL.createObjectURL(file);

    video.src = url;
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      let width = video.videoWidth;
      let height = video.videoHeight;

      // Scale down if necessary
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      
      const stream = canvas.captureStream(30); // 30 FPS
      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9", // Using webm as it's better supported for browser recording
        videoBitsPerSecond: bitrate,
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webm", {
          type: "video/webm",
        });
        URL.revokeObjectURL(url);
        resolve(compressedFile);
      };

      // Start processing
      video.play();
      recorder.start();

      const drawFrame = () => {
        if (video.paused || video.ended) {
          recorder.stop();
          return;
        }
        ctx?.drawImage(video, 0, 0, width, height);
        requestAnimationFrame(drawFrame);
      };

      drawFrame();
    };

    video.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error("Video load error"));
    };
  });
};
