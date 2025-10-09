import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';

interface ImageZoomProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export default function ImageZoom({ src, alt, onClose }: ImageZoomProps) {
  const [scale, setScale] = useState(1);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full transition backdrop-blur-sm"
        aria-label="Close"
      >
        <X size={24} />
      </button>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-6 py-3">
        <button
          onClick={handleZoomOut}
          className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition"
          aria-label="Zoom out"
        >
          <ZoomOut size={24} />
        </button>
        <span className="text-white font-medium min-w-16 text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition"
          aria-label="Zoom in"
        >
          <ZoomIn size={24} />
        </button>
      </div>

      <div className="overflow-auto max-h-full max-w-full">
        <img
          src={src}
          alt={alt}
          className="transition-transform duration-200"
          style={{ transform: `scale(${scale})` }}
        />
      </div>
    </div>
  );
}
