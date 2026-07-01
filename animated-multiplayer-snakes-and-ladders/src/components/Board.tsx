import { motion, AnimatePresence } from 'framer-motion';
import type { Player } from '../game/snakesAndLadders';
import {
  BOARD_SIZE,
  SNAKES,
  LADDERS,
  getSquareCoordinates,
  isSnake,
  isLadder,
} from '../game/snakesAndLadders';
import PlayerToken from './PlayerToken';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface BoardProps {
  players: Player[];
  animatingSquare: number | null;
}

export default function Board({ players, animatingSquare }: BoardProps) {
  const squares: number[] = [];
  for (let row = BOARD_SIZE - 1; row >= 0; row--) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const actualCol = row % 2 === 0 ? col : (BOARD_SIZE - 1 - col);
      const squareNumber = row * BOARD_SIZE + actualCol + 1;
      squares.push(squareNumber);
    }
  }

  const getSquareColor = (square: number) => {
    if (isLadder(square)) return 'bg-emerald-100 border-emerald-300';
    if (isSnake(square)) return 'bg-rose-100 border-rose-300';
    if (square === 100) return 'bg-amber-100 border-amber-300';
    const row = Math.floor((square - 1) / BOARD_SIZE);
    const col = (square - 1) % BOARD_SIZE;
    return (row + col) % 2 === 0 ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200';
  };

  const getPlayersOnSquare = (square: number) => {
    return players.filter((p) => p.position === square);
  };

  return (
    <div className="relative">
      {/* Board Grid */}
      <div
        className="grid gap-0.5 rounded-xl overflow-hidden shadow-xl border-4 border-slate-800 bg-slate-800"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
        }}
      >
        {squares.map((square) => {
          const playersOnSquare = getPlayersOnSquare(square);
          const isAnimating = animatingSquare === square;

          return (
            <motion.div
              key={square}
              animate={isAnimating ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.3 }}
              className={`relative aspect-square border flex flex-col items-center justify-center text-xs font-medium ${getSquareColor(square)}`}
            >
              <span className="text-slate-500 text-[10px] absolute top-0.5 left-1">
                {square}
              </span>

              {/* Ladder indicator */}
              {isLadder(square) && (
                <div className="absolute top-1 right-1">
                  <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                </div>
              )}

              {/* Snake indicator */}
              {isSnake(square) && (
                <div className="absolute top-1 right-1">
                  <ArrowDownRight className="w-3 h-3 text-rose-600" />
                </div>
              )}

              {/* Goal star */}
              {square === 100 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-amber-500 text-lg">★</span>
                </div>
              )}

              {/* Player tokens */}
              <div className="relative w-full h-full flex items-center justify-center">
                <AnimatePresence>
                  {playersOnSquare.map((player, idx) => (
                    <PlayerToken
                      key={player.id}
                      player={player}
                      index={idx}
                      totalPlayers={playersOnSquare.length}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Snake and Ladder 3D overlay */}
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ width: '100%', height: '100%' }}
        viewBox={`0 0 ${BOARD_SIZE * 100} ${BOARD_SIZE * 100}`}
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="board-drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="3" dy="6" stdDeviation="4" floodColor="#000000" floodOpacity="0.4" />
          </filter>
          <filter id="snake-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="4" dy="8" stdDeviation="5" floodColor="#000000" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* 3D Ladders */}
        {Object.entries(LADDERS).map(([start, end]) => {
          const startCoord = getSquareCoordinates(Number(start));
          const endCoord = getSquareCoordinates(end);
          const x1 = startCoord.col * 100 + 50;
          const y1 = (BOARD_SIZE - 1 - startCoord.row) * 100 + 50;
          const x2 = endCoord.col * 100 + 50;
          const y2 = (BOARD_SIZE - 1 - endCoord.row) * 100 + 50;

          return (
            <g key={`ladder-${start}`} filter="url(#board-drop-shadow)">
              {/* Left Rail */}
              <line x1={x1 - 15} y1={y1} x2={x2 - 15} y2={y2} stroke="#065f46" strokeWidth="8" strokeLinecap="round" />
              <line x1={x1 - 15} y1={y1} x2={x2 - 15} y2={y2} stroke="#10b981" strokeWidth="6" strokeLinecap="round" />
              <line x1={x1 - 16} y1={y1 - 1} x2={x2 - 16} y2={y2 - 1} stroke="#a7f3d0" strokeWidth="2" strokeLinecap="round" opacity="0.8" />

              {/* Right Rail */}
              <line x1={x1 + 15} y1={y1} x2={x2 + 15} y2={y2} stroke="#065f46" strokeWidth="8" strokeLinecap="round" />
              <line x1={x1 + 15} y1={y1} x2={x2 + 15} y2={y2} stroke="#10b981" strokeWidth="6" strokeLinecap="round" />
              <line x1={x1 + 14} y1={y1 - 1} x2={x2 + 14} y2={y2 - 1} stroke="#a7f3d0" strokeWidth="2" strokeLinecap="round" opacity="0.8" />

              {/* 3D Rungs */}
              {Array.from({ length: 6 }).map((_, i) => {
                const t = (i + 1) / 7;
                const rx1 = (x1 - 15) + (x2 - x1) * t;
                const ry1 = y1 + (y2 - y1) * t;
                const rx2 = (x1 + 15) + (x2 - x1) * t;
                const ry2 = y1 + (y2 - y1) * t;
                return (
                  <g key={i}>
                    <line x1={rx1} y1={ry1 + 1} x2={rx2} y2={ry2 + 1} stroke="#065f46" strokeWidth="6" strokeLinecap="round" />
                    <line x1={rx1} y1={ry1} x2={rx2} y2={ry2} stroke="#34d399" strokeWidth="4" strokeLinecap="round" />
                    <line x1={rx1} y1={ry1 - 1} x2={rx2} y2={ry2 - 1} stroke="#ecfdf5" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* 3D Snakes */}
        {Object.entries(SNAKES).map(([start, end]) => {
          const startCoord = getSquareCoordinates(Number(start));
          const endCoord = getSquareCoordinates(end);
          const x1 = startCoord.col * 100 + 50;
          const y1 = (BOARD_SIZE - 1 - startCoord.row) * 100 + 50;
          const x2 = endCoord.col * 100 + 50;
          const y2 = (BOARD_SIZE - 1 - endCoord.row) * 100 + 50;

          // Distinct color palette for each snake
          const palettes: Record<number, { base: string; main: string; belly: string; highlight: string }> = {
            17: { base: '#881337', main: '#e11d48', belly: '#fb7185', highlight: '#fff1f2' },
            54: { base: '#14532d', main: '#16a34a', belly: '#4ade80', highlight: '#dcfce7' },
            62: { base: '#4c1d95', main: '#7c3aed', belly: '#a78bfa', highlight: '#ede9fe' },
            64: { base: '#78350f', main: '#d97706', belly: '#f8b400', highlight: '#fef3c7' },
            87: { base: '#0c4a6e', main: '#0284c7', belly: '#38bdf8', highlight: '#e0f2fe' },
            93: { base: '#831843', main: '#db2777', belly: '#f472b6', highlight: '#fce7f3' },
            95: { base: '#1e1b4b', main: '#4f46e5', belly: '#818cf8', highlight: '#e0e7ff' },
            98: { base: '#042f2c', main: '#0d9488', belly: '#2dd4bf', highlight: '#ccfbf1' },
          };
          const pal = palettes[Number(start)] || palettes[17];

          // S-shaped cubic bezier curve for slithering 3D body
          const dy = y2 - y1;
          const sideOffset = ((Number(start) * 23 + Number(end) * 37) % 80) - 40;
          const cp1x = x1 + sideOffset * 1.6;
          const cp1y = y1 + dy * 0.35;
          const cp2x = x2 - sideOffset * 1.6;
          const cp2y = y1 + dy * 0.65;
          const path = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;

          // Calculate Head Orientation Angle (tangent from cp1 to head)
          const headVecX = x1 - cp1x;
          const headVecY = y1 - cp1y;
          const headAngle = Math.atan2(headVecY, headVecX) * (180 / Math.PI);

          // Calculate Tail Orientation Angle (tangent from cp2 to tail)
          const tailVecX = x2 - cp2x;
          const tailVecY = y2 - cp2y;
          const tailAngle = Math.atan2(tailVecY, tailVecX) * (180 / Math.PI);

          return (
            <g key={`snake-${start}`} filter="url(#snake-shadow)">
              {/* Layer 1: Base dark 3D contour / shadow outline */}
              <path d={path} fill="none" stroke={pal.base} strokeWidth="24" strokeLinecap="round" />

              {/* Layer 2: Main tubular colored body */}
              <path d={path} fill="none" stroke={pal.main} strokeWidth="18" strokeLinecap="round" />

              {/* Layer 3: Belly scales pattern */}
              <path d={path} fill="none" stroke={pal.belly} strokeWidth="13" strokeDasharray="10 10" strokeLinecap="round" opacity="0.75" />

              {/* Layer 4: Cylindrical specular highlight (top specular tube reflex) */}
              <path d={path} fill="none" stroke={pal.highlight} strokeWidth="5" strokeLinecap="round" opacity="0.85" transform="translate(-2, -2)" />

              {/* 3D Tapered Tail */}
              <g transform={`translate(${x2}, ${y2}) rotate(${tailAngle})`}>
                <path d="M -8 -8 Q 14 0 18 0 Q 14 0 -8 8 Z" fill={pal.main} stroke={pal.base} strokeWidth="1.5" />
                <path d="M -6 -4 Q 10 0 13 0 Q 10 0 -6 4 Z" fill={pal.highlight} opacity="0.7" />
              </g>

              {/* 3D Snake Head */}
              <g transform={`translate(${x1}, ${y1}) rotate(${headAngle})`}>
                {/* Neck smooth join */}
                <path d="M -14 -10 L 0 -11 C 10 -12 20 -6 22 0 C 20 6 10 12 0 11 L -14 10 Z" fill={pal.main} />

                {/* Head base shadow layer */}
                <path d="M -10 -14 C 6 -16 18 -8 24 0 C 18 8 6 16 -10 14 C -16 10 -18 0 -18 0 C -18 0 -16 -10 -10 -14 Z" fill={pal.base} />

                {/* Main Cobra/Viper Head Shape */}
                <path d="M -10 -13 C 6 -15 18 -7 23 0 C 18 7 6 15 -10 13 C -15 9 -17 0 -17 0 C -17 0 -15 -9 -10 -13 Z" fill={pal.main} stroke={pal.base} strokeWidth="1.5" />

                {/* Specular Head Highlight */}
                <path d="M -8 -9 C 2 -11 12 -5 16 -1 C 12 -3 2 -7 -8 -6 Z" fill={pal.highlight} opacity="0.85" />

                {/* Left 3D Bulging Eye */}
                <g transform="translate(6, -6)">
                  <circle cx="0" cy="0" r="4.2" fill="#fef08a" stroke="#713f12" strokeWidth="1" />
                  <ellipse cx="0.5" cy="0" rx="1.5" ry="3.2" fill="#0f172a" />
                  <circle cx="-1" cy="-1.5" r="1.3" fill="white" />
                </g>

                {/* Right 3D Bulging Eye */}
                <g transform="translate(6, 6)">
                  <circle cx="0" cy="0" r="4.2" fill="#fef08a" stroke="#713f12" strokeWidth="1" />
                  <ellipse cx="0.5" cy="0" rx="1.5" ry="3.2" fill="#0f172a" />
                  <circle cx="-1" cy="-1.5" r="1.3" fill="white" />
                </g>

                {/* Nostrils */}
                <circle cx="18" cy="-2.5" r="0.9" fill={pal.base} />
                <circle cx="18" cy="2.5" r="0.9" fill={pal.base} />

                {/* Forked Tongue Flicking Out */}
                <path d="M 23 0 L 33 -0.5 L 39 -5 M 33 -0.5 L 39 4" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
