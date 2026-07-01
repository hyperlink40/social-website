import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Edit2, Save, X, Trophy, Gamepad2, TrendingUp } from 'lucide-react';
import { getOrCreateUser, updateUsername, UserStats } from '../game/storage';

interface UserProfileProps {
  onOpenLeaderboard: () => void;
  onOpenHistory: () => void;
}

export default function UserProfile({ onOpenLeaderboard, onOpenHistory }: UserProfileProps) {
  const [user, setUser] = useState<UserStats | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const currentUser = getOrCreateUser();
    setUser(currentUser);
    setEditName(currentUser.username);
  }, []);

  const handleSave = () => {
    if (editName.trim() && user) {
      const updated = updateUsername(editName.trim());
      if (updated) {
        setUser(updated);
      }
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setEditName(user.username);
    }
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md p-4 border border-slate-200"
    >
      {/* User Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
        
        {isEditing ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
            />
            <button
              onClick={handleSave}
              className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-2 bg-slate-400 text-white rounded-lg hover:bg-slate-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex-1">
            <div className="font-semibold text-slate-800">{user.username}</div>
            <div className="text-xs text-slate-500">Member since {new Date(user.createdAt).toLocaleDateString()}</div>
          </div>
        )}

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <Gamepad2 className="w-5 h-5 text-slate-500 mx-auto mb-1" />
          <div className="text-lg font-bold text-slate-800">{user.gamesPlayed}</div>
          <div className="text-xs text-slate-500">Games</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-3 text-center">
          <Trophy className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <div className="text-lg font-bold text-amber-700">{user.gamesWon}</div>
          <div className="text-xs text-amber-600">Wins</div>
        </div>
        <div className="bg-emerald-50 rounded-lg p-3 text-center">
          <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <div className="text-lg font-bold text-emerald-700">{user.winRate}%</div>
          <div className="text-xs text-emerald-600">Win Rate</div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex justify-between py-1.5 px-2 bg-slate-50 rounded">
          <span className="text-slate-500">Losses</span>
          <span className="font-medium text-slate-700">{user.gamesLost}</span>
        </div>
        <div className="flex justify-between py-1.5 px-2 bg-slate-50 rounded">
          <span className="text-slate-500">Avg Moves</span>
          <span className="font-medium text-slate-700">{user.averageMoves}</span>
        </div>
        <div className="flex justify-between py-1.5 px-2 bg-slate-50 rounded">
          <span className="text-slate-500">Ladder Climbs</span>
          <span className="font-medium text-emerald-600">{user.ladderClimbs}</span>
        </div>
        <div className="flex justify-between py-1.5 px-2 bg-slate-50 rounded">
          <span className="text-slate-500">Snake Slides</span>
          <span className="font-medium text-rose-600">{user.snakeSlides}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={onOpenLeaderboard}
          className="flex-1 py-2 bg-amber-100 text-amber-700 font-medium rounded-lg hover:bg-amber-200 transition-colors text-sm"
        >
          🏆 Leaderboard
        </button>
        <button
          onClick={onOpenHistory}
          className="flex-1 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors text-sm"
        >
          📜 History
        </button>
      </div>
    </motion.div>
  );
}
