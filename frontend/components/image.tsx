import React, { useEffect, useState } from 'react';
import axios from '../src/lib/api';

interface PhotoProps {
    src:string;
    alt: string;
    className?: string;
}

const Photo: React.FC<PhotoProps> = ({ src, alt, className }) => {
  const [imageSrc, setImageSrc] = useState<string>();

  useEffect(() => {
    axios
      .get(src, {
        responseType: 'blob',
      })
      .then((res) => {
        const url = URL.createObjectURL(res.data);
        setImageSrc(url);
      })
      .catch((err) => {
        console.error('Error loading image:', err);
      });
  }, [src]);

  if (!imageSrc) return <p>Loading...</p>;

  return <img className={className} src={imageSrc} alt={alt} />;
};

export default Photo;

