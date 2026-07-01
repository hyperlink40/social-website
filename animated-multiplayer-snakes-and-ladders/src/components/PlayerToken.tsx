import { motion } from 'framer-motion';
import type { Player } from '../game/snakesAndLadders';

interface PlayerTokenProps {
  player: Player;
  index: number;
  totalPlayers: number;
}

export default function PlayerToken({ player, index, totalPlayers }: PlayerTokenProps) {
  // Offset tokens so they don't overlap when multiple players are on same square
  const offsetMap: Record<number, { x: number; y: number }[]> = {
    2: [
      { x: -8, y: -8 },
      { x: 8, y: 8 },
    ],
    3: [
      { x: -8, y: -8 },
      { x: 8, y: -8 },
      { x: 0, y: 8 },
    ],
    4: [
      { x: -8, y: -8 },
      { x: 8, y: -8 },
      { x: -8, y: 8 },
      { x: 8, y: 8 },
    ],
  };

  const offset = offsetMap[totalPlayers]?.[index] || { x: 0, y: 0 };

  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 120, damping: 15 }}
      className="absolute z-20 flex items-center justify-center"
      style={{
        width: '28px',
        height: '28px',
        transform: `translate(${offset.x}px, ${offset.y}px)`,
      }}
    >
      <div
        className="w-7 h-7 rounded-full shadow-md border-2 border-white flex items-center justify-center"
        style={{ backgroundColor: player.color }}
      >
        <span className="text-white text-xs font-bold">{player.id + 1}</span>
      </div>
    </motion.div>
  );
}
