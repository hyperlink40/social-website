import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { uploadImage, validateImageFile } from '../lib/imageUpload';
import { ImagePlus, Send, X, Upload } from 'lucide-react';
import EmojiPicker from './EmojiPicker';

interface CreatePostProps {
  onPostCreated: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [showImageInput, setShowImageInput] = useState(false);
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('file');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validationErrors: string[] = [];
    const newFiles: File[] = [];

    files.forEach((file) => {
      const err = validateImageFile(file);
      if (err) {
        validationErrors.push(err);
      } else {
        newFiles.push(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      }
    });

    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
    } else {
      setError('');
    }

    setImageFiles((prev) => [...prev, ...newFiles]);
  };

  const removeImageFile = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeImageUrl = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const addImageUrl = () => {
    if (urlInput.trim()) {
      setImageUrls((prev) => [...prev, urlInput.trim()]);
      setUrlInput('');
    }
  };

  const handleClearImages = () => {
    setImageFiles([]);
    setImageUrls([]);
    setImagePreviews([]);
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setContent((prev) => prev + emoji);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError('');
    try {
      let allImageUrls: string[] = [];

      if (uploadMode === 'file' && imageFiles.length > 0 && user?.id) {
        const uploadedUrls = await Promise.all(
          imageFiles.map((file) => uploadImage(file, user.id))
        );
        const validUrls = uploadedUrls.filter((url) => url !== null) as string[];
        if (validUrls.length !== imageFiles.length) {
          setError('Some images failed to upload');
          setLoading(false);
          return;
        }
        allImageUrls = validUrls;
      } else if (uploadMode === 'url' && imageUrls.length > 0) {
        allImageUrls = imageUrls;
      }

      const firstImage = allImageUrls.length > 0 ? allImageUrls[0] : '';

      const { error: postError } = await supabase.from('posts').insert({
        user_id: user?.id,
        content: content.trim(),
        image_url: firstImage,
        image_urls: allImageUrls,
      });

      if (postError) throw postError;

      setContent('');
      handleClearImages();
      setShowImageInput(false);
      setError('');
      onPostCreated();
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-xl shadow-lg border border-white border-opacity-50 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            rows={3}
            disabled={loading}
          />
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {showImageInput && (
          <div className="space-y-3">
            <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => {
                  setUploadMode('file');
                  setImageUrls([]);
                }}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition ${
                  uploadMode === 'file'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Upload Files
              </button>
              <button
                type="button"
                onClick={() => {
                  setUploadMode('url');
                  setImageFiles([]);
                  setImagePreviews([]);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition ${
                  uploadMode === 'url'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Image URLs
              </button>
            </div>

            {uploadMode === 'file' ? (
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-gray-600 hover:text-blue-600"
                  disabled={loading}
                >
                  <Upload size={24} />
                  <span className="font-medium">Click to upload images (multiple allowed)</span>
                </button>
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden border border-gray-200 group">
                        <img
                          src={preview}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-20 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImageFile(index)}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Enter image URL (e.g., from Pexels)"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    disabled={loading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addImageUrl();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                  >
                    Add
                  </button>
                </div>
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative rounded-lg overflow-hidden border border-gray-200 group">
                    <img
                      src={url}
                      alt={`URL ${index + 1}`}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImageUrl(index)}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {(imagePreviews.length > 0 || imageUrls.length > 0) && (
              <button
                type="button"
                onClick={handleClearImages}
                className="text-sm text-red-600 hover:text-red-900 transition"
              >
                Clear all images
              </button>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          {!showImageInput && (
            <button
              type="button"
              onClick={() => setShowImageInput(true)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              disabled={loading}
            >
              <ImagePlus size={20} />
              Add Images
            </button>
          )}
          {(imagePreviews.length > 0 || imageUrls.length > 0) && (
            <div className="text-xs text-gray-500">
              {imagePreviews.length + imageUrls.length} image{(imagePreviews.length + imageUrls.length) !== 1 ? 's' : ''} added
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
          >
            <Send size={18} />
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
