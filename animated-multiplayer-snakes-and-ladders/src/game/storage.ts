import type { Player } from './snakesAndLadders';

export interface UserStats {
  userId: string;
  username: string;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  winRate: number;
  totalMoves: number;
  averageMoves: number;
  ladderClimbs: number;
  snakeSlides: number;
  createdAt: number;
  lastPlayed: number;
}

export interface GameRecord {
  id: string;
  date: number;
  players: { userId: string; username: string; position: number; isWinner: boolean }[];
  totalMoves: number;
  duration: number;
  isOnline: boolean;
}

const STORAGE_KEYS = {
  USER_STATS: 'snakes_ladders_user_stats',
  GAME_HISTORY: 'snakes_ladders_game_history',
  CURRENT_USER: 'snakes_ladders_current_user',
  LEADERBOARD: 'snakes_ladders_leaderboard',
};

// Generate a simple unique ID
function generateId(): string {
  return 'user_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// User Stats Management
export function getCurrentUser(): UserStats | null {
  const userId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!userId) return null;
  
  const allStats = getAllUserStats();
  return allStats.find(u => u.userId === userId) || null;
}

export function setCurrentUser(userId: string): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
}

export function getAllUserStats(): UserStats[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_STATS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getOrCreateUser(username?: string): UserStats {
  const currentUser = getCurrentUser();
  if (currentUser) return currentUser;

  const allStats = getAllUserStats();
  const existingUser = username ? allStats.find(u => u.username === username) : null;
  if (existingUser) {
    setCurrentUser(existingUser.userId);
    return existingUser;
  }

  const newUser: UserStats = {
    userId: generateId(),
    username: username || `Player_${Math.floor(Math.random() * 1000)}`,
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    winRate: 0,
    totalMoves: 0,
    averageMoves: 0,
    ladderClimbs: 0,
    snakeSlides: 0,
    createdAt: Date.now(),
    lastPlayed: Date.now(),
  };

  allStats.push(newUser);
  saveAllUserStats(allStats);
  setCurrentUser(newUser.userId);
  return newUser;
}

export function updateUserStats(stats: Partial<UserStats> & { userId: string }): void {
  const allStats = getAllUserStats();
  const index = allStats.findIndex(u => u.userId === stats.userId);
  
  if (index !== -1) {
    allStats[index] = { ...allStats[index], ...stats };
    // Recalculate derived stats
    const user = allStats[index];
    user.winRate = user.gamesPlayed > 0 
      ? Math.round((user.gamesWon / user.gamesPlayed) * 100) 
      : 0;
    user.averageMoves = user.gamesPlayed > 0 
      ? Math.round(user.totalMoves / user.gamesPlayed) 
      : 0;
    saveAllUserStats(allStats);
  }
}

export function saveAllUserStats(stats: UserStats[]): void {
  localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
}

// Game History Management
export function getGameHistory(): GameRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveGameRecord(record: GameRecord): void {
  const history = getGameHistory();
  history.unshift(record); // Add to beginning
  // Keep only last 100 games
  if (history.length > 100) history.splice(100);
  localStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(history));
}

export function recordGameResult(
  players: Player[],
  winner: Player,
  isOnline: boolean,
  duration: number
): void {
  const allUserStats = getAllUserStats();
  const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  
  // Update stats for each player
  players.forEach((player) => {
    let userStats = allUserStats.find(u => u.userId === currentUserId);
    
    if (!userStats) {
      userStats = {
        userId: currentUserId || generateId(),
        username: player.name,
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        winRate: 0,
        totalMoves: 0,
        averageMoves: 0,
        ladderClimbs: 0,
        snakeSlides: 0,
        createdAt: Date.now(),
        lastPlayed: Date.now(),
      };
      allUserStats.push(userStats);
    }

    userStats.gamesPlayed += 1;
    userStats.lastPlayed = Date.now();
    
    if (player.id === winner.id) {
      userStats.gamesWon += 1;
    } else {
      userStats.gamesLost += 1;
    }
  });

  saveAllUserStats(allUserStats);

  // Save game record
  const record: GameRecord = {
    id: generateId(),
    date: Date.now(),
    players: players.map(p => ({
      userId: currentUserId || 'unknown',
      username: p.name,
      position: p.position,
      isWinner: p.id === winner.id,
    })),
    totalMoves: players.reduce((sum, p) => sum + p.position, 0),
    duration,
    isOnline,
  };

  saveGameRecord(record);
}

// Leaderboard
export function getLeaderboard(): UserStats[] {
  const allStats = getAllUserStats();
  return allStats
    .filter(u => u.gamesPlayed > 0)
    .sort((a, b) => {
      // Sort by win rate first, then by games won
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      return b.gamesWon - a.gamesWon;
    });
}

// Username management
export function updateUsername(newUsername: string): UserStats | null {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  const allStats = getAllUserStats();
  const index = allStats.findIndex(u => u.userId === currentUser.userId);
  
  if (index !== -1) {
    allStats[index].username = newUsername;
    saveAllUserStats(allStats);
    return allStats[index];
  }
  return null;
}

// Clear all data (for testing/reset)
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.USER_STATS);
  localStorage.removeItem(STORAGE_KEYS.GAME_HISTORY);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  localStorage.removeItem(STORAGE_KEYS.LEADERBOARD);
}
