import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Trash2, Heart, MessageCircle, UserPlus, Users } from 'lucide-react';

interface Notification {
  id: string;
  user_id: string;
  actor_id: string;
  type: 'like' | 'comment' | 'follow' | 'friend_request' | 'message';
  related_post_id: string | null;
  is_read: boolean;
  created_at: string;
  actor_profile?: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
  post?: {
    content: string;
  };
}

interface NotificationsProps {
  onBack: () => void;
  onUserClick?: (userId: string) => void;
}

export default function Notifications({ onBack, onUserClick }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      const channel = supabase
        .channel('notifications_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*, actor_profile:profiles!actor_id(username, full_name, avatar_url), post:posts(content)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      setNotifications(data || []);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    fetchNotifications();
  };

  const deleteNotification = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user?.id)
      .eq('is_read', false);
    fetchNotifications();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart size={16} className="text-red-600" fill="currentColor" />;
      case 'comment':
        return <MessageCircle size={16} className="text-blue-600" />;
      case 'follow':
        return <UserPlus size={16} className="text-green-600" />;
      case 'friend_request':
        return <Users size={16} className="text-purple-600" />;
      case 'message':
        return <MessageCircle size={16} className="text-cyan-600" />;
      default:
        return null;
    }
  };

  const getNotificationText = (notification: Notification) => {
    const actor = notification.actor_profile?.full_name || 'Someone';
    switch (notification.type) {
      case 'like':
        return `${actor} liked your post`;
      case 'comment':
        return `${actor} commented on your post`;
      case 'follow':
        return `${actor} started following you`;
      case 'friend_request':
        return `${actor} sent you a friend request`;
      case 'message':
        return `${actor} sent you a message`;
      default:
        return 'New notification';
    }
  };

  const filteredNotifications = notifications.filter((notif) =>
    filter === 'unread' ? !notif.is_read : true
  );

  const formatDate = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white bg-opacity-95 backdrop-blur-lg border-b border-white border-opacity-20 sticky top-0 z-40 shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft size={20} className="text-gray-700" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            </div>
            {notifications.some((n) => !n.is_read) && (
              <button
                onClick={markAllAsRead}
                className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 bg-white bg-opacity-90 backdrop-blur-lg rounded-xl p-1 shadow-lg border border-white border-opacity-50">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-white hover:bg-opacity-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
              filter === 'unread'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-white hover:bg-opacity-50'
            }`}
          >
            Unread
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin shadow-lg"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-xl shadow-lg border border-white border-opacity-50 p-12 text-center">
            <p className="text-gray-600 text-lg font-medium">
              {filter === 'unread'
                ? 'All caught up! No unread notifications.'
                : 'No notifications yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`bg-white bg-opacity-95 backdrop-blur-lg rounded-xl shadow-lg border border-white border-opacity-50 p-4 transition hover:shadow-md ${
                  !notif.is_read ? 'border-l-4 border-l-blue-600 bg-blue-50 bg-opacity-50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 overflow-hidden">
                    {notif.actor_profile?.avatar_url ? (
                      <img
                        src={notif.actor_profile.avatar_url}
                        alt={notif.actor_profile.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      notif.actor_profile?.full_name.charAt(0) || 'U'
                    )}
                  </div>

                  <div className="flex-1">
                    <button
                      onClick={() => onUserClick?.(notif.actor_id)}
                      className="text-sm text-gray-900 hover:text-blue-600 transition font-medium"
                    >
                      {getNotificationText(notif)}
                    </button>

                    {notif.post?.content && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        "{notif.post.content}"
                      </p>
                    )}

                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(notif.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {getNotificationIcon(notif.type)}
                    {!notif.is_read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                        title="Mark as read"
                      >
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                      title="Delete notification"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
