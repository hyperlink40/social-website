import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { uploadImage, validateImageFile } from '../lib/imageUpload';
import { ImagePlus, Send, X, Upload } from 'lucide-react';

interface CreatePostProps {
  onPostCreated: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('file');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError('');
    try {
      let finalImageUrl = '';

      if (uploadMode === 'file' && imageFile && user?.id) {
        const uploadedUrl = await uploadImage(imageFile, user.id);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        } else {
          setError('Failed to upload image');
          setLoading(false);
          return;
        }
      } else if (uploadMode === 'url' && imageUrl.trim()) {
        finalImageUrl = imageUrl.trim();
      }

      const { error: postError } = await supabase.from('posts').insert({
        user_id: user?.id,
        content: content.trim(),
        image_url: finalImageUrl,
      });

      if (postError) throw postError;

      setContent('');
      setImageUrl('');
      setImageFile(null);
      setImagePreview('');
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

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-xl shadow-lg border border-white border-opacity-50 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
          rows={3}
          disabled={loading}
        />

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
                  setImageUrl('');
                }}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition ${
                  uploadMode === 'file'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => {
                  setUploadMode('url');
                  handleRemoveImage();
                }}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition ${
                  uploadMode === 'url'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Image URL
              </button>
            </div>

            {uploadMode === 'file' ? (
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={loading}
                />
                {!imagePreview ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-gray-600 hover:text-blue-600"
                    disabled={loading}
                  >
                    <Upload size={24} />
                    <span className="font-medium">Click to upload image</span>
                  </button>
                ) : (
                  <div className="relative rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enter image URL (e.g., from Pexels)"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={loading}
                />
                {imageUrl && (
                  <div className="relative rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setShowImageInput(false);
                handleRemoveImage();
              }}
              className="text-sm text-gray-600 hover:text-gray-900 transition"
            >
              Remove image
            </button>
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
              Add Image
            </button>
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
