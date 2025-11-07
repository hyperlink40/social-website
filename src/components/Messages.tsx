import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Send, Search } from 'lucide-react';

interface Conversation {
  userId: string;
  username: string;
  full_name: string;
  avatar_url: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
}

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_profile?: {
    username: string;
    avatar_url: string;
  };
}

interface MessagesProps {
  onBack: () => void;
}

export default function Messages({ onBack }: MessagesProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchConversations();
      const channel = supabase
        .channel('messages_channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'direct_messages' },
          () => {
            if (selectedUserId) {
              fetchMessages(selectedUserId);
            } else {
              fetchConversations();
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id, selectedUserId]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const { data: sentMessages } = await supabase
        .from('direct_messages')
        .select('recipient_id')
        .eq('sender_id', user?.id)
        .order('created_at', { ascending: false });

      const { data: receivedMessages } = await supabase
        .from('direct_messages')
        .select('sender_id')
        .eq('recipient_id', user?.id)
        .order('created_at', { ascending: false });

      const userIds = new Set<string>();
      sentMessages?.forEach((m) => userIds.add(m.recipient_id));
      receivedMessages?.forEach((m) => userIds.add(m.sender_id));

      if (userIds.size === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', Array.from(userIds));

      const conversationsList: Conversation[] = [];

      for (const profile of profiles || []) {
        const { data: allMessages } = await supabase
          .from('direct_messages')
          .select('*')
          .or(
            `and(sender_id.eq.${user?.id},recipient_id.eq.${profile.id}),and(sender_id.eq.${profile.id},recipient_id.eq.${user?.id})`
          )
          .order('created_at', { ascending: false })
          .limit(1);

        const lastMessage = allMessages?.[0];
        if (lastMessage) {
          const { data: unreadCount } = await supabase
            .from('direct_messages')
            .select('*', { count: 'exact', head: true })
            .eq('sender_id', profile.id)
            .eq('recipient_id', user?.id)
            .eq('is_read', false);

          conversationsList.push({
            userId: profile.id,
            username: profile.username,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            lastMessage: lastMessage.content,
            lastMessageTime: lastMessage.created_at,
            unread: (unreadCount || 0) > 0,
          });
        }
      }

      setConversations(
        conversationsList.sort(
          (a, b) =>
            new Date(b.lastMessageTime).getTime() -
            new Date(a.lastMessageTime).getTime()
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId: string) => {
    try {
      const { data: messagesData } = await supabase
        .from('direct_messages')
        .select('*, sender_profile:profiles!sender_id(username, avatar_url)')
        .or(
          `and(sender_id.eq.${user?.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user?.id})`
        )
        .order('created_at', { ascending: true });

      setMessages(messagesData || []);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherUserId)
        .maybeSingle();

      setSelectedProfile(profileData);

      await supabase
        .from('direct_messages')
        .update({ is_read: true })
        .eq('sender_id', otherUserId)
        .eq('recipient_id', user?.id);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUserId) return;

    setSending(true);
    try {
      await supabase.from('direct_messages').insert({
        sender_id: user?.id,
        recipient_id: selectedUserId,
        content: messageText.trim(),
      });

      setMessageText('');
      fetchMessages(selectedUserId);
      fetchConversations();
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: string) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return messageDate.toLocaleDateString();
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white bg-opacity-95 backdrop-blur-lg border-b border-white border-opacity-20 sticky top-0 z-40 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft size={20} className="text-gray-700" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto h-[calc(100vh-80px)] flex">
        <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No conversations yet
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.userId}
                  onClick={() => {
                    setSelectedUserId(conv.userId);
                    fetchMessages(conv.userId);
                  }}
                  className={`w-full px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition text-left ${
                    selectedUserId === conv.userId ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 overflow-hidden">
                      {conv.avatar_url ? (
                        <img
                          src={conv.avatar_url}
                          alt={conv.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        conv.full_name.charAt(0)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900">{conv.full_name}</p>
                        <p className="text-xs text-gray-500">
                          {formatTime(conv.lastMessageTime)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conv.lastMessage}
                      </p>
                      {conv.unread && (
                        <div className="w-3 h-3 bg-blue-600 rounded-full mt-1"></div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedUserId && selectedProfile ? (
            <>
              <div className="bg-white border-b border-gray-100 p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                  {selectedProfile.avatar_url ? (
                    <img
                      src={selectedProfile.avatar_url}
                      alt={selectedProfile.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    selectedProfile.full_name.charAt(0)
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {selectedProfile.full_name}
                  </h2>
                  <p className="text-sm text-gray-500">@{selectedProfile.username}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.sender_id === user?.id
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-white text-gray-900 rounded-bl-none shadow-sm'
                        }`}
                      >
                        <p className="break-words">{msg.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.sender_id === user?.id
                              ? 'text-blue-100'
                              : 'text-gray-500'
                          }`}
                        >
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="bg-white border-t border-gray-100 p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={sending || !messageText.trim()}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
