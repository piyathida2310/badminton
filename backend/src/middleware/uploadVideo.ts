import multer, { FileFilterCallback } from 'multer';
import { Request, Express } from 'express';

// ไฟล์วิดีโอที่อนุญาต
const videoMimeTypes = [
  'video/mp4',
  'video/mpeg',
  'video/quicktime',
  'video/x-msvideo', // .avi
  'video/x-ms-wmv',  // .wmv
  'video/webm'
];

export const uploadVideo = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB for videos
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (videoMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only video files are allowed'));
    }
  },
});