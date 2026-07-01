import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Award, X, Crown } from 'lucide-react';
import { getLeaderboard, UserStats, getGameHistory, GameRecord } from '../game/storage';

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  showHistory?: boolean;
}

export default function Leaderboard({ isOpen, onClose, showHistory = false }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<UserStats[]>([]);
  const [history, setHistory] = useState<GameRecord[]>([]);

  useEffect(() => {
    if (isOpen) {
      setLeaderboard(getLeaderboard());
      setHistory(getGameHistory());
    }
  }, [isOpen]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-5 h-5 text-amber-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-slate-400" />;
      case 2:
        return <Award className="w-5 h-5 text-amber-700" />;
      default:
        return <span className="w-5 h-5 text-center text-sm font-bold text-slate-500">{index + 1}</span>;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-white" />
              <h2 className="text-lg font-bold text-white">
                {showHistory ? '📜 Game History' : '🏆 Leaderboard'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {showHistory ? (
              /* Game History */
              history.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500">No games played yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((game) => (
                    <motion.div
                      key={game.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border border-slate-200 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500">
                          {new Date(game.date).toLocaleString()}
                        </span>
                        <span className="text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-600">
                          {game.isOnline ? '🌐 Online' : '👤 Local'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {game.players.map((player, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between text-sm ${
                              player.isWinner ? 'text-amber-600 font-semibold' : 'text-slate-600'
                            }`}
                          >
                            <span>{player.isWinner ? '👑 ' : ''}{player.username}</span>
                            <span>Square {player.position}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )
            ) : (
              /* Leaderboard */
              leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500">No stats yet. Play some games!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((user, index) => (
                    <motion.div
                      key={user.userId}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center gap-3 p-3 rounded-xl border ${
                        index === 0
                          ? 'bg-amber-50 border-amber-200'
                          : index === 1
                          ? 'bg-slate-50 border-slate-200'
                          : index === 2
                          ? 'bg-orange-50 border-orange-200'
                          : 'bg-white border-slate-100'
                      }`}
                    >
                      <div className="w-8 flex-shrink-0">{getRankIcon(index)}</div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-800">{user.username}</div>
                        <div className="text-xs text-slate-500">
                          {user.gamesPlayed} games • {user.gamesWon} wins
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-amber-600">{user.winRate}%</div>
                        <div className="text-xs text-slate-500">win rate</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
