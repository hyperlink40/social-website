export const BOARD_SIZE = 10;
export const TOTAL_SQUARES = BOARD_SIZE * BOARD_SIZE;

// Standard snakes and ladders positions
export const SNAKES: Record<number, number> = {
  17: 7,
  54: 34,
  62: 19,
  64: 60,
  87: 36,
  93: 73,
  95: 75,
  98: 79,
};

export const LADDERS: Record<number, number> = {
  4: 14,
  9: 31,
  20: 38,
  28: 84,
  40: 59,
  51: 67,
  63: 81,
  71: 91,
};

export interface Player {
  id: number;
  name: string;
  color: string;
  bgColor: string;
  position: number;
  isActive: boolean;
}

export const PLAYER_COLORS = [
  { color: '#ef4444', bgColor: '#fef2f2', name: 'Red' },
  { color: '#3b82f6', bgColor: '#eff6ff', name: 'Blue' },
  { color: '#22c55e', bgColor: '#f0fdf4', name: 'Green' },
  { color: '#f59e0b', bgColor: '#fffbeb', name: 'Yellow' },
];

export function getSquareCoordinates(squareNumber: number): { row: number; col: number } {
  const zeroBased = squareNumber - 1;
  const row = Math.floor(zeroBased / BOARD_SIZE);
  const col = zeroBased % BOARD_SIZE;
  
  // Snake pattern: odd rows go right-to-left
  const actualCol = row % 2 === 0 ? col : (BOARD_SIZE - 1 - col);
  
  return { row, col: actualCol };
}

export function isSnake(square: number): boolean {
  return square in SNAKES;
}

export function isLadder(square: number): boolean {
  return square in LADDERS;
}

export function getSnakeTail(square: number): number {
  return SNAKES[square] || square;
}

export function getLadderTop(square: number): number {
  return LADDERS[square] || square;
}

export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function createPlayers(count: number): Player[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: PLAYER_COLORS[i].name,
    color: PLAYER_COLORS[i].color,
    bgColor: PLAYER_COLORS[i].bgColor,
    position: 0,
    isActive: i === 0,
  }));
}
