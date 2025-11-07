import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Post as PostType } from '../lib/supabase';
import CreatePost from './CreatePost';
import Post from './Post';
import { Home, User, LogOut, Users, MessageCircle, Bell, Users2 } from 'lucide-react';

interface FeedProps {
  onUserClick: (userId: string) => void;
  onNavigate?: (view: 'feed' | 'profile' | 'messages' | 'notifications' | 'groups') => void;
}

export default function Feed({ onUserClick, onNavigate }: FeedProps) {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'following'>('all');
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const { user, signOut } = useAuth();

  useEffect(() => {
    fetchCurrentProfile();
    fetchPosts();

    const channel = supabase
      .channel('posts_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab]);

  const fetchCurrentProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .maybeSingle();

    if (data) {
      setCurrentProfile(data);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      if (activeTab === 'following') {
        const { data: followingData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user?.id);

        const followingIds = followingData?.map((f) => f.following_id) || [];

        if (followingIds.length === 0) {
          setPosts([]);
          return;
        }

        const { data } = await supabase
          .from('posts')
          .select('*, profiles(*), likes(*), comments(*)')
          .in('user_id', followingIds)
          .order('created_at', { ascending: false });

        setPosts(data || []);
      } else {
        const { data } = await supabase
          .from('posts')
          .select('*, profiles(*), likes(*), comments(*)')
          .order('created_at', { ascending: false });

        setPosts(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white bg-opacity-95 backdrop-blur-lg border-b border-white border-opacity-20 sticky top-0 z-40 shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold gradient-text">
              Social
            </h1>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate?.('messages')}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                title="Messages"
              >
                <MessageCircle size={20} />
              </button>

              <button
                onClick={() => onNavigate?.('notifications')}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                title="Notifications"
              >
                <Bell size={20} />
              </button>

              <button
                onClick={() => onNavigate?.('groups')}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                title="Groups"
              >
                <Users2 size={20} />
              </button>

              <div className="w-px h-6 bg-gray-200"></div>

              <button
                onClick={() => onUserClick(user?.id || '')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {currentProfile?.avatar_url ? (
                    <img
                      src={currentProfile.avatar_url}
                      alt={currentProfile.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User size={18} />
                  )}
                </div>
                <span className="font-medium hidden sm:inline">
                  {currentProfile?.username || 'Profile'}
                </span>
              </button>

              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
              >
                <LogOut size={18} />
                <span className="font-medium hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="flex gap-2 bg-white bg-opacity-90 backdrop-blur-lg rounded-xl p-1 shadow-lg border border-white border-opacity-50">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-white hover:bg-opacity-50'
            }`}
          >
            <Home size={18} />
            All Posts
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'following'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-white hover:bg-opacity-50'
            }`}
          >
            <Users size={18} />
            Following
          </button>
        </div>

        <CreatePost onPostCreated={fetchPosts} />

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin shadow-lg"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-xl shadow-lg border border-white border-opacity-50 p-12 text-center">
            <p className="text-gray-600 text-lg font-medium">
              {activeTab === 'following'
                ? 'Follow people to see their posts here'
                : 'No posts yet. Be the first to post!'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="hover-lift">
                <Post
                  post={post}
                  onPostDeleted={fetchPosts}
                  onUserClick={onUserClick}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
