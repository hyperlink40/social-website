import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Users, LogIn, LogOut } from 'lucide-react';

interface SportsGroup {
  id: string;
  name: string;
  description: string;
  icon: string;
  created_at: string;
}

interface GroupMember {
  group_id: string;
  user_id: string;
}

export default function SportsGroups() {
  const [groups, setGroups] = useState<SportsGroup[]>([]);
  const [memberGroups, setMemberGroups] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchMemberGroups();
    }
  }, [user?.id]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('sports_groups')
        .select('*')
        .order('name');

      if (err) throw err;
      setGroups(data || []);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError('Failed to load sports groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberGroups = async () => {
    if (!user?.id) return;
    try {
      const { data, error: err } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (err) throw err;
      setMemberGroups(new Set(data?.map((m: GroupMember) => m.group_id) || []));
    } catch (err) {
      console.error('Error fetching member groups:', err);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!user?.id) return;
    try {
      const { error: err } = await supabase.from('group_members').insert({
        group_id: groupId,
        user_id: user.id,
      });

      if (err) throw err;
      setMemberGroups((prev) => new Set([...prev, groupId]));
    } catch (err) {
      console.error('Error joining group:', err);
      setError('Failed to join group');
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!user?.id) return;
    try {
      const { error: err } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (err) throw err;
      setMemberGroups((prev) => {
        const updated = new Set(prev);
        updated.delete(groupId);
        return updated;
      });
    } catch (err) {
      console.error('Error leaving group:', err);
      setError('Failed to leave group');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sports Groups</h1>
        <p className="text-gray-600">Join sports communities and discuss your favorite teams and events</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => {
          const isMember = memberGroups.has(group.id);
          return (
            <div
              key={group.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{group.icon}</div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Users size={14} />
                  <span>Community</span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-1">{group.name}</h3>
              {group.description && (
                <p className="text-gray-600 text-sm mb-4">{group.description}</p>
              )}

              {user ? (
                <button
                  onClick={() => (isMember ? handleLeaveGroup(group.id) : handleJoinGroup(group.id))}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                    isMember
                      ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isMember ? (
                    <>
                      <LogOut size={16} />
                      Leave
                    </>
                  ) : (
                    <>
                      <LogIn size={16} />
                      Join
                    </>
                  )}
                </button>
              ) : (
                <div className="w-full py-2 px-4 rounded-lg bg-gray-100 text-gray-600 text-center text-sm font-medium">
                  Sign in to join
                </div>
              )}
            </div>
          );
        })}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No sports groups available yet</p>
        </div>
      )}
    </div>
  );
}
