import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { sounds } from '../game/sounds';

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(sounds.isEnabled());
  const [volume, setVolume] = useState(sounds.getVolume());
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    sounds.setEnabled(enabled);
  }, [enabled]);

  useEffect(() => {
    sounds.setVolume(volume);
  }, [volume]);

  const toggleEnabled = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    if (newEnabled) {
      // Play feedback sound when enabling
      setTimeout(() => sounds.click(), 50);
    }
  };

  const VolumeIcon = !enabled ? VolumeX : volume > 0.5 ? Volume2 : Volume1;

  return (
    <div className="relative">
      <button
        onClick={toggleEnabled}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowPanel(!showPanel);
        }}
        onDoubleClick={() => setShowPanel(!showPanel)}
        className={`p-2.5 rounded-xl shadow-md transition-all active:scale-95 ${
          enabled
            ? 'bg-white text-slate-700 hover:bg-slate-50'
            : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
        }`}
        title={enabled ? 'Sound on (double-click for volume)' : 'Sound off'}
      >
        <VolumeIcon className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {showPanel && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-30"
              onClick={() => setShowPanel(false)}
            />
            {/* Volume Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-40 w-56"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-700">Sound</span>
                <button
                  onClick={toggleEnabled}
                  className={`relative w-10 h-6 rounded-full transition-colors ${
                    enabled ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <motion.div
                    animate={{ x: enabled ? 18 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Volume</span>
                  <span>{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume * 100}
                  onChange={(e) => setVolume(parseInt(e.target.value) / 100)}
                  disabled={!enabled}
                  className="w-full accent-slate-700 disabled:opacity-50"
                />
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => sounds.diceRoll()}
                  disabled={!enabled}
                  className="w-full text-xs py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  🎲 Test Sound
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
