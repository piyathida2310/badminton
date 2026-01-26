import React, { useEffect, useState } from "react";
import axios from "../src/lib/api";

interface PhotoProps {
  src: string; // อาจเป็น /api/... หรือเป็น presigned url
  alt: string;
  className?: string;
}

const isAbsoluteUrl = (u: string) => /^https?:\/\//i.test(u);
const isPresigned = (u: string) =>
  /[?&]X-Amz-Algorithm=|[?&]X-Amz-Signature=|[?&]X-Amz-Credential=/i.test(u);

const Photo: React.FC<PhotoProps> = ({ src, alt, className }) => {
  const [imageSrc, setImageSrc] = useState<string>();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        // ✅ ถ้าเป็น presigned/absolute url -> ใช้เป็น src ได้เลย (ห้าม axios เพราะมี Authorization header)
        if (isAbsoluteUrl(src) && isPresigned(src)) {
          if (!cancelled) setImageSrc(src);
          return;
        }

        // 1) ลองยิง endpoint แบบ JSON ก่อน เผื่อได้ { url }
        const jsonTry = await axios.get(src);
        const url = jsonTry?.data?.url;
        if (typeof url === "string" && url.length > 0) {
          if (!cancelled) setImageSrc(url);
          return;
        }

        // 2) ถ้าไม่ใช่ json url ให้ fallback เป็น src เดิม (ให้ browser โหลดเอง)
        if (!cancelled) setImageSrc(src);
      } catch (err) {
        console.error("Error loading image:", err);
        // fallback ให้ browser โหลดเอง
        if (!cancelled) setImageSrc(src);
      }
    };

    setImageSrc(undefined);
    run();

    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!imageSrc) return <p>Loading...</p>;
  return <img className={className} src={imageSrc} alt={alt} />;
};

export default Photo;
