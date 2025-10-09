import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { uploadImage, validateImageFile } from '../lib/imageUpload';
import type { Profile as ProfileType, Post as PostType } from '../lib/supabase';
import { ArrowLeft, User, UserPlus, UserMinus, Settings, Upload, Share2, Maximize2 } from 'lucide-react';
import Post from './Post';
import ImageZoom from './ImageZoom';

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
  const [showAvatarZoom, setShowAvatarZoom] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [friendRequestStatus, setFriendRequestStatus] = useState<'none' | 'pending' | 'accepted' | 'received'>('none');
  const [friendRequestId, setFriendRequestId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    fetchProfile();
    fetchPosts();
    if (!isOwnProfile) {
      checkFollowing();
      checkFriendRequest();
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

  const checkFriendRequest = async () => {
    const { data: sentRequest } = await supabase
      .from('friend_requests')
      .select('id, status')
      .eq('sender_id', user?.id)
      .eq('receiver_id', userId)
      .maybeSingle();

    if (sentRequest) {
      setFriendRequestStatus(sentRequest.status === 'accepted' ? 'accepted' : 'pending');
      setFriendRequestId(sentRequest.id);
      return;
    }

    const { data: receivedRequest } = await supabase
      .from('friend_requests')
      .select('id, status')
      .eq('sender_id', userId)
      .eq('receiver_id', user?.id)
      .maybeSingle();

    if (receivedRequest) {
      setFriendRequestStatus(receivedRequest.status === 'accepted' ? 'accepted' : 'received');
      setFriendRequestId(receivedRequest.id);
    }
  };

  const handleFriendRequest = async () => {
    if (friendRequestStatus === 'pending') {
      await supabase
        .from('friend_requests')
        .delete()
        .eq('id', friendRequestId);
      setFriendRequestStatus('none');
      setFriendRequestId(null);
    } else if (friendRequestStatus === 'received') {
      await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', friendRequestId);
      setFriendRequestStatus('accepted');
    } else if (friendRequestStatus === 'none') {
      const { data } = await supabase
        .from('friend_requests')
        .insert({ sender_id: user?.id, receiver_id: userId })
        .select()
        .single();
      if (data) {
        setFriendRequestStatus('pending');
        setFriendRequestId(data.id);
      }
    }
  };

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}?profile=${userId}`;
    const shareData = {
      title: `${profile.full_name}'s Profile`,
      text: `Check out @${profile.username} on Social`,
      url: profileUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(profileUrl);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
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
        className="flex items-center gap-2 text-white hover:text-white hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg mb-6 transition backdrop-blur-sm"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-xl shadow-lg border border-white border-opacity-50 overflow-hidden mb-6">
        <div className="h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative"></div>

        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-20 mb-4">
            <div className="w-36 h-36 bg-white rounded-full p-2 shadow-xl group relative cursor-pointer" onClick={() => profile.avatar_url && setShowAvatarZoom(true)}>
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.username}
                    className="w-full h-full rounded-full object-cover group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <User size={56} />
                )}
              </div>
              {profile.avatar_url && (
                <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-center justify-center">
                  <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition" size={24} />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {isOwnProfile ? (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition font-medium"
                >
                  <Settings size={18} />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleFollow}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition ${
                      isFollowing
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg'
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
                  <button
                    onClick={handleFriendRequest}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                      friendRequestStatus === 'accepted'
                        ? 'bg-green-100 text-green-700'
                        : friendRequestStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : friendRequestStatus === 'received'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {friendRequestStatus === 'accepted'
                      ? 'Friends'
                      : friendRequestStatus === 'pending'
                      ? 'Pending'
                      : friendRequestStatus === 'received'
                      ? 'Accept'
                      : 'Add Friend'}
                  </button>
                </>
              )}
              <div className="relative">
                <button
                  onClick={handleShare}
                  className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  aria-label="Share profile"
                >
                  <Share2 size={20} />
                </button>
                {shareSuccess && (
                  <div className="absolute top-full mt-2 right-0 bg-green-600 text-white text-sm px-3 py-1 rounded-lg shadow-lg whitespace-nowrap">
                    Link copied!
                  </div>
                )}
              </div>
            </div>
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

      {showAvatarZoom && profile.avatar_url && (
        <ImageZoom
          src={profile.avatar_url}
          alt={profile.username}
          onClose={() => setShowAvatarZoom(false)}
        />
      )}
    </div>
  );
}
