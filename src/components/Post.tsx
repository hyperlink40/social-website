import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Post as PostType, Comment } from '../lib/supabase';
import { Heart, MessageCircle, Trash2, User, Share2, Maximize2 } from 'lucide-react';
import ImageZoom from './ImageZoom';
import EmojiPicker from './EmojiPicker';
import EmojiReactions from './EmojiReactions';

interface PostProps {
  post: PostType;
  onPostDeleted: () => void;
  onUserClick: (userId: string) => void;
}

export default function Post({ post, onPostDeleted, onUserClick }: PostProps) {
  const [likes, setLikes] = useState<string[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const { user } = useAuth();

  const isLiked = likes.includes(user?.id || '');
  const isOwner = user?.id === post.user_id;

  useEffect(() => {
    fetchLikes();
    fetchComments();

    const likesChannel = supabase
      .channel(`likes:${post.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'likes', filter: `post_id=eq.${post.id}` },
        () => {
          fetchLikes();
        }
      )
      .subscribe();

    const commentsChannel = supabase
      .channel(`comments:${post.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${post.id}` },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [post.id]);

  const fetchLikes = async () => {
    const { data } = await supabase
      .from('likes')
      .select('user_id')
      .eq('post_id', post.id);

    if (data) {
      setLikes(data.map((like) => like.user_id));
    }
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(username, avatar_url)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });

    if (data) {
      setComments(data);
    }
  };

  const handleLike = async () => {
    if (isLiked) {
      await supabase
        .from('likes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', user?.id);
    } else {
      await supabase.from('likes').insert({
        post_id: post.id,
        user_id: user?.id,
      });
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setLoading(true);
    try {
      await supabase.from('comments').insert({
        post_id: post.id,
        user_id: user?.id,
        content: commentText.trim(),
      });

      setCommentText('');
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Delete this post?')) {
      const { error } = await supabase.from('posts').delete().eq('id', post.id);
      if (!error) {
        onPostDeleted();
      }
    }
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}?post=${post.id}`;
    const shareData = {
      title: `Post by @${post.profiles?.username}`,
      text: post.content,
      url: postUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(postUrl);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return postDate.toLocaleDateString();
  };

  return (
    <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-xl shadow-lg border border-white border-opacity-50 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <button
            onClick={() => onUserClick(post.user_id)}
            className="flex items-center gap-3 group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
              {post.profiles?.avatar_url ? (
                <img
                  src={post.profiles.avatar_url}
                  alt={post.profiles.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User size={24} />
              )}
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                {post.profiles?.full_name || 'User'}
              </p>
              <p className="text-sm text-gray-500">
                @{post.profiles?.username || 'user'} · {formatDate(post.created_at)}
              </p>
            </div>
          </button>

          {isOwner && (
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>

        <p className="text-gray-800 text-lg leading-relaxed mb-4">{post.content}</p>

        <EmojiReactions postId={post.id} />

        {post.image_url && (
          <div className="relative rounded-lg overflow-hidden mb-4 group">
            <img
              src={post.image_url}
              alt="Post"
              className="w-full max-h-96 object-cover cursor-pointer transition-transform hover:scale-105"
              onClick={() => setShowImageZoom(true)}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <button
              onClick={() => setShowImageZoom(true)}
              className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition backdrop-blur-sm hover:bg-opacity-70"
              aria-label="Zoom image"
            >
              <Maximize2 size={20} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              isLiked
                ? 'text-red-600 bg-red-50 hover:bg-red-100'
                : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
            <span className="font-medium">{likes.length}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            <MessageCircle size={20} />
            <span className="font-medium">{comments.length}</span>
          </button>

          <div className="relative ml-auto">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
            >
              <Share2 size={20} />
              <span className="font-medium">Share</span>
            </button>
            {shareSuccess && (
              <div className="absolute top-full mt-2 right-0 bg-green-600 text-white text-sm px-3 py-1 rounded-lg shadow-lg whitespace-nowrap">
                Link copied!
              </div>
            )}
          </div>
        </div>
      </div>

      {showComments && (
        <div className="border-t border-gray-100 p-6 bg-gray-50">
          <form onSubmit={handleComment} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                disabled={loading}
              />
              <EmojiPicker onEmojiSelect={(emoji) => setCommentText((prev) => prev + emoji)} />
              <button
                type="submit"
                disabled={loading || !commentText.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post
              </button>
            </div>
          </form>

          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {comment.profiles?.avatar_url ? (
                    <img
                      src={comment.profiles.avatar_url}
                      alt={comment.profiles.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User size={16} />
                  )}
                </div>
                <div className="flex-1 bg-white rounded-lg px-4 py-3">
                  <button
                    onClick={() => onUserClick(comment.user_id)}
                    className="font-semibold text-sm text-gray-900 hover:text-blue-600 transition"
                  >
                    @{comment.profiles?.username || 'user'}
                  </button>
                  <p className="text-gray-700 mt-1">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showImageZoom && post.image_url && (
        <ImageZoom
          src={post.image_url}
          alt="Post image"
          onClose={() => setShowImageZoom(false)}
        />
      )}
    </div>
  );
}
