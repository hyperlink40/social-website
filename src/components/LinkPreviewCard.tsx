import { ExternalLink, X } from 'lucide-react';
import type { LinkPreview } from '../lib/linkPreview';

interface LinkPreviewCardProps {
  preview: LinkPreview;
  onRemove?: (previewId: string) => void;
  isRemovable?: boolean;
}

export default function LinkPreviewCard({
  preview,
  onRemove,
  isRemovable = false,
}: LinkPreviewCardProps) {
  const handleClick = () => {
    window.open(preview.url, '_blank');
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition bg-white">
      <div className="flex gap-3 p-3">
        {/* Favicon and domain */}
        <div className="flex-shrink-0">
          {preview.favicon_url ? (
            <img
              src={preview.favicon_url}
              alt={preview.domain}
              className="w-8 h-8 rounded"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
              <ExternalLink size={16} className="text-gray-500" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <button
            onClick={handleClick}
            className="text-left hover:opacity-75 transition w-full"
          >
            {preview.title && (
              <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                {preview.title}
              </h3>
            )}
            {preview.description && (
              <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                {preview.description}
              </p>
            )}
            <p className="text-xs text-blue-600 truncate">
              {preview.domain}
            </p>
          </button>
        </div>

        {/* Remove button */}
        {isRemovable && onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(preview.id);
            }}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
            title="Remove link"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Preview image */}
      {preview.image_url && (
        <div className="relative w-full bg-gray-100">
          <img
            src={preview.image_url}
            alt={preview.title}
            className="w-full h-40 object-cover cursor-pointer hover:opacity-90 transition"
            onClick={handleClick}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
}
