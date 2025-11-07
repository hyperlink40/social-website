import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Plus, Lock, Globe, Users, Trash2, LogOut } from 'lucide-react';

interface Group {
  id: string;
  creator_id: string;
  name: string;
  description: string;
  avatar_url: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

interface GroupWithMemberCount extends Group {
  member_count: number;
  is_member: boolean;
}

interface GroupsProps {
  onBack: () => void;
  onGroupClick?: (groupId: string) => void;
}

export default function Groups({ onBack, onGroupClick }: GroupsProps) {
  const [groups, setGroups] = useState<GroupWithMemberCount[]>([]);
  const [myGroups, setMyGroups] = useState<GroupWithMemberCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tab, setTab] = useState<'discover' | 'my-groups'>('discover');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_private: false,
  });
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchGroups();
      const channel = supabase
        .channel('groups_channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'groups' },
          () => {
            fetchGroups();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const { data: publicGroups } = await supabase
        .from('groups')
        .select('*')
        .eq('is_private', false)
        .order('created_at', { ascending: false });

      const { data: userGroups } = await supabase
        .from('groups')
        .select('*')
        .or(
          `creator_id.eq.${user?.id},id.in(select group_id from group_members where user_id=${user?.id})`
        )
        .order('created_at', { ascending: false });

      const groupsWithCount: GroupWithMemberCount[] = [];
      const myGroupsWithCount: GroupWithMemberCount[] = [];

      if (publicGroups) {
        for (const group of publicGroups) {
          const { count } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          const { data: memberCheck } = await supabase
            .from('group_members')
            .select('id')
            .eq('group_id', group.id)
            .eq('user_id', user?.id)
            .maybeSingle();

          groupsWithCount.push({
            ...group,
            member_count: count || 0,
            is_member: !!memberCheck,
          });
        }
      }

      if (userGroups) {
        for (const group of userGroups) {
          const { count } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          const { data: memberCheck } = await supabase
            .from('group_members')
            .select('id')
            .eq('group_id', group.id)
            .eq('user_id', user?.id)
            .maybeSingle();

          myGroupsWithCount.push({
            ...group,
            member_count: count || 0,
            is_member: !!memberCheck,
          });
        }
      }

      setGroups(groupsWithCount);
      setMyGroups(myGroupsWithCount);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setCreating(true);
    try {
      const { data: newGroup } = await supabase
        .from('groups')
        .insert({
          creator_id: user?.id,
          name: formData.name.trim(),
          description: formData.description.trim(),
          is_private: formData.is_private,
        })
        .select()
        .single();

      if (newGroup) {
        await supabase.from('group_members').insert({
          group_id: newGroup.id,
          user_id: user?.id,
          role: 'admin',
        });

        setFormData({ name: '', description: '', is_private: false });
        setShowCreateModal(false);
        fetchGroups();
      }
    } catch (err) {
      console.error('Error creating group:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      await supabase.from('group_members').insert({
        group_id: groupId,
        user_id: user?.id,
        role: 'member',
      });
      fetchGroups();
    } catch (err) {
      console.error('Error joining group:', err);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user?.id);
      fetchGroups();
    } catch (err) {
      console.error('Error leaving group:', err);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (confirm('Delete this group? This action cannot be undone.')) {
      try {
        await supabase.from('groups').delete().eq('id', groupId);
        fetchGroups();
      } catch (err) {
        console.error('Error deleting group:', err);
      }
    }
  };

  const displayGroups = tab === 'discover' ? groups : myGroups;

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
              <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition font-medium"
            >
              <Plus size={18} />
              Create Group
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 bg-white bg-opacity-90 backdrop-blur-lg rounded-xl p-1 shadow-lg border border-white border-opacity-50">
          <button
            onClick={() => setTab('discover')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
              tab === 'discover'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-white hover:bg-opacity-50'
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => setTab('my-groups')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
              tab === 'my-groups'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-white hover:bg-opacity-50'
            }`}
          >
            My Groups
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin shadow-lg"></div>
          </div>
        ) : displayGroups.length === 0 ? (
          <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-xl shadow-lg border border-white border-opacity-50 p-12 text-center">
            <p className="text-gray-600 text-lg font-medium">
              {tab === 'discover'
                ? 'No groups available to join'
                : 'You haven\'t joined any groups yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayGroups.map((group) => (
              <div
                key={group.id}
                className="bg-white bg-opacity-95 backdrop-blur-lg rounded-xl shadow-lg border border-white border-opacity-50 overflow-hidden hover:shadow-xl transition"
              >
                <div className="h-32 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative"></div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{group.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {group.is_private ? (
                          <>
                            <Lock size={14} className="text-gray-600" />
                            <span className="text-xs text-gray-600">Private</span>
                          </>
                        ) : (
                          <>
                            <Globe size={14} className="text-gray-600" />
                            <span className="text-xs text-gray-600">Public</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {group.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {group.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Users size={16} />
                    <span>{group.member_count} member{group.member_count !== 1 ? 's' : ''}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onGroupClick?.(group.id)}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
                    >
                      View
                    </button>
                    {group.is_member ? (
                      <>
                        {group.creator_id === user?.id ? (
                          <button
                            onClick={() => handleDeleteGroup(group.id)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete group"
                          >
                            <Trash2 size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleLeaveGroup(group.id)}
                            className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            title="Leave group"
                          >
                            <LogOut size={18} />
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => handleJoinGroup(group.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                      >
                        <Plus size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Group</h2>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Enter group name"
                  disabled={creating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  placeholder="Enter group description"
                  rows={3}
                  disabled={creating}
                />
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="is_private"
                  checked={formData.is_private}
                  onChange={(e) =>
                    setFormData({ ...formData, is_private: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  disabled={creating}
                />
                <label htmlFor="is_private" className="text-sm text-gray-700 cursor-pointer">
                  Make this group private
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ name: '', description: '', is_private: false });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={creating || !formData.name.trim()}
                >
                  {creating ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
