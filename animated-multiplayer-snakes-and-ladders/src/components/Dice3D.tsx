import { useState, useEffect } from 'react';
import './Dice3D.css';

interface Dice3DProps {
  value: number;
  isRolling: boolean;
  onRoll: () => void;
  disabled: boolean;
}

const faceDots: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function DiceFace({ dots, className }: { dots: number[]; className: string }) {
  return (
    <div className={`dice-face ${className}`}>
      <div className="dots-grid">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            {dots.includes(i) && <div className="dot" />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dice3D({ value, isRolling, onRoll, disabled }: Dice3DProps) {
  const [rollingClass, setRollingClass] = useState('');
  const [showClass, setShowClass] = useState('show-1');

  useEffect(() => {
    if (isRolling) {
      // Pick a random rolling animation variant
      const variant = Math.floor(Math.random() * 3) + 1;
      setRollingClass(`rolling-${variant}`);
      setShowClass('');
    } else {
      setRollingClass('');
      setShowClass(`show-${value}`);
    }
  }, [isRolling, value]);

  const faces = [
    { dots: faceDots[1], className: 'front' },
    { dots: faceDots[6], className: 'back' },
    { dots: faceDots[3], className: 'right' },
    { dots: faceDots[4], className: 'left' },
    { dots: faceDots[2], className: 'top' },
    { dots: faceDots[5], className: 'bottom' },
  ];

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="dice-scene">
        <div className={`dice ${rollingClass} ${showClass}`}>
          {faces.map((face, idx) => (
            <DiceFace key={idx} dots={face.dots} className={face.className} />
          ))}
        </div>
      </div>

      {/* Shadow */}
      <div
        className="w-16 h-3 rounded-full bg-black/10 transition-all duration-300"
        style={{
          transform: isRolling ? 'scale(0.6)' : 'scale(1)',
          opacity: isRolling ? 0.3 : 0.5,
        }}
      />

      <button
        onClick={onRoll}
        disabled={disabled || isRolling}
        className="px-7 py-3 bg-slate-800 text-white font-semibold rounded-xl shadow-lg hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-none"
      >
        {isRolling ? 'Rolling...' : 'Roll Dice'}
      </button>
    </div>
  );
}
