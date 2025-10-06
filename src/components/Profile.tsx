import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { uploadImage, validateImageFile } from '../lib/imageUpload';
import type { Profile as ProfileType, Post as PostType } from '../lib/supabase';
import { ArrowLeft, User, UserPlus, UserMinus, Settings, Upload } from 'lucide-react';
import Post from './Post';

interface ProfileProps {
  userId: string;
  onBack: () => void;
  onUserClick: (userId: string) => void;
}

export default function Profile({ userId, onBack, onUserClick }: ProfileProps) {
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', bio: '', avatar_url: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    fetchProfile();
    fetchPosts();
    if (!isOwnProfile) {
      checkFollowing();
    }
    fetchFollowCounts();
  }, [userId]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (data) {
      setProfile(data);
      setEditForm({
        full_name: data.full_name,
        bio: data.bio,
        avatar_url: data.avatar_url,
      });
    }
  };

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*, profiles(*), likes(*), comments(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data) {
      setPosts(data);
    }
  };

  const checkFollowing = async () => {
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user?.id)
      .eq('following_id', userId)
      .maybeSingle();

    setIsFollowing(!!data);
  };

  const fetchFollowCounts = async () => {
    const { count: followers } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    const { count: following } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

    setFollowerCount(followers || 0);
    setFollowingCount(following || 0);
  };

  const handleFollow = async () => {
    if (isFollowing) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user?.id)
        .eq('following_id', userId);
    } else {
      await supabase.from('follows').insert({
        follower_id: user?.id,
        following_id: userId,
      });
    }
    setIsFollowing(!isFollowing);
    fetchFollowCounts();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setAvatarFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError('');

    try {
      let finalAvatarUrl = editForm.avatar_url;

      if (avatarFile && user?.id) {
        const uploadedUrl = await uploadImage(avatarFile, user.id);
        if (uploadedUrl) {
          finalAvatarUrl = uploadedUrl;
        } else {
          setError('Failed to upload avatar');
          setUploading(false);
          return;
        }
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          bio: editForm.bio,
          avatar_url: finalAvatarUrl,
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      setShowEditModal(false);
      setAvatarFile(null);
      setAvatarPreview('');
      fetchProfile();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setUploading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500"></div>

        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-16 mb-4">
            <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg">
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={48} />
                )}
              </div>
            </div>

            {isOwnProfile ? (
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                <Settings size={18} />
                Edit Profile
              </button>
            ) : (
              <button
                onClick={handleFollow}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition ${
                  isFollowing
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserMinus size={18} />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Follow
                  </>
                )}
              </button>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
              <p className="text-gray-600">@{profile.username}</p>
            </div>

            {profile.bio && (
              <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
            )}

            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="font-bold text-gray-900">{followerCount}</span>
                <span className="text-gray-600 ml-1">Followers</span>
              </div>
              <div>
                <span className="font-bold text-gray-900">{followingCount}</span>
                <span className="text-gray-600 ml-1">Following</span>
              </div>
              <div>
                <span className="font-bold text-gray-900">{posts.length}</span>
                <span className="text-gray-600 ml-1">Posts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <Post
            key={post.id}
            post={post}
            onPostDeleted={fetchPosts}
            onUserClick={onUserClick}
          />
        ))}

        {posts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No posts yet
          </div>
        )}
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden flex-shrink-0">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : editForm.avatar_url ? (
                      <img
                        src={editForm.avatar_url}
                        alt="Current avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={40} />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                    disabled={uploading}
                  >
                    <Upload size={18} />
                    Upload Photo
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  JPEG, PNG, GIF or WebP. Max size 5MB.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, full_name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  rows={3}
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avatar URL (optional)
                </label>
                <input
                  type="url"
                  value={editForm.avatar_url}
                  onChange={(e) =>
                    setEditForm({ ...editForm, avatar_url: e.target.value })
                  }
                  placeholder="Or paste an image URL"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={uploading}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setAvatarFile(null);
                    setAvatarPreview('');
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={uploading}
                >
                  {uploading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
