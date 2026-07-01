import { motion } from 'framer-motion';
import { Trophy, RotateCcw, Users, ArrowRight } from 'lucide-react';
import type { Player } from '../game/snakesAndLadders';

interface GameControlsProps {
  players: Player[];
  currentPlayer: number;
  winner: Player | null;
  onReset: () => void;
  onPlayerCountChange?: (count: number) => void;
  playerCount: number;
  lastRoll: number | null;
  message: string;
  isOnline?: boolean;
}

export default function GameControls({
  players,
  currentPlayer,
  winner,
  onReset,
  onPlayerCountChange,
  playerCount,
  lastRoll,
  message,
  isOnline = false,
}: GameControlsProps) {
  return (
    <div className="flex flex-col gap-4 w-full max-w-xs">
      {/* Player Setup - Hide in online mode */}
      {!winner && !isOnline && onPlayerCountChange && (
        <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-700">Players</span>
          </div>
          <div className="flex gap-2">
            {[2, 3, 4].map((count) => (
              <button
                key={count}
                onClick={() => onPlayerCountChange(count)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  playerCount === count
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Player Status */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Players</h3>
        <div className="flex flex-col gap-2">
          {players.map((player) => (
            <motion.div
              key={player.id}
              animate={
                player.id === currentPlayer && !winner
                  ? { scale: [1, 1.02, 1] }
                  : {}
              }
              transition={{ repeat: Infinity, duration: 1.5 }}
              className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                player.id === currentPlayer && !winner
                  ? 'bg-slate-50 ring-2 ring-slate-300'
                  : 'bg-slate-50'
              } ${winner?.id === player.id ? 'bg-amber-50 ring-2 ring-amber-300' : ''}`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
                style={{ backgroundColor: player.color }}
              >
                {player.id + 1}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-800">{player.name}</div>
                <div className="text-xs text-slate-500">Square {player.position}</div>
              </div>
              {winner?.id === player.id && (
                <Trophy className="w-5 h-5 text-amber-500" />
              )}
              {player.id === currentPlayer && !winner && (
                <ArrowRight className="w-4 h-4 text-slate-400" />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Last Roll */}
      {lastRoll !== null && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-4 border border-slate-200 text-center"
        >
          <div className="text-xs text-slate-500 mb-1">Last Roll</div>
          <div className="text-3xl font-bold text-slate-800">{lastRoll}</div>
        </motion.div>
      )}

      {/* Game Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 text-white rounded-xl shadow-md p-4 text-center text-sm font-medium"
        >
          {message}
        </motion.div>
      )}

      {/* Winner Banner */}
      {winner && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-amber-50 border-2 border-amber-300 rounded-xl shadow-md p-6 text-center"
        >
          <Trophy className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <div className="text-lg font-bold text-amber-800">
            {winner.name} Wins!
          </div>
          <div className="text-sm text-amber-600 mt-1">
            Congratulations!
          </div>
        </motion.div>
      )}

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 active:scale-95 transition-all"
      >
        <RotateCcw className="w-4 h-4" />
        New Game
      </button>
    </div>
  );
}
