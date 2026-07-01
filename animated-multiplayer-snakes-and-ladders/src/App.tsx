import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import Board from './components/Board';
import Dice3D from './components/Dice3D';
import GameControls from './components/GameControls';
import UserProfile from './components/UserProfile';
import OnlinePlay from './components/OnlinePlay';
import Leaderboard from './components/Leaderboard';
import {
  createPlayers,
  rollDice,
  isSnake,
  isLadder,
  getSnakeTail,
  getLadderTop,
  TOTAL_SQUARES,
  PLAYER_COLORS,
  type Player,
} from './game/snakesAndLadders';
import { recordGameResult } from './game/storage';
import { onlineGame, type GameMessage } from './game/online';
import { sounds } from './game/sounds';
import SoundToggle from './components/SoundToggle';

export default function App() {
  const [isOnline, setIsOnline] = useState(false);
  const [playerCount, setPlayerCount] = useState(2);
  const [players, setPlayers] = useState<Player[]>(() => createPlayers(2));
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [animatingSquare, setAnimatingSquare] = useState<number | null>(null);
  const [gameStartTime, setGameStartTime] = useState<number>(0);

  // Modal states
  const [showOnlinePlay, setShowOnlinePlay] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const moveQueueRef = useRef<number[]>([]);
  const isProcessingRef = useRef(false);
  const gameMovesRef = useRef(0);

  // Initialize online game message handler
  useEffect(() => {
    const handleMessage = (msg: GameMessage) => {
      switch (msg.type) {
        case 'ROLL':
          // Host received roll from client - should not happen in this simple implementation
          break;
        case 'MOVE':
          setPlayers((prev) =>
            prev.map((p, idx) =>
              idx === parseInt(msg.playerId) ? { ...p, position: msg.finalPosition } : p
            )
          );
          break;
        case 'SNAKE':
          setMessage(`Snake! Slide to ${msg.to}!`);
          setTimeout(() => setMessage(''), 2000);
          break;
        case 'LADDER':
          setMessage(`Ladder! Climb to ${msg.to}!`);
          setTimeout(() => setMessage(''), 2000);
          break;
        case 'WINNER':
          setWinner(players[parseInt(msg.playerId)]);
          setMessage(`${msg.playerName} wins the game!`);
          break;
        case 'TURN':
          setCurrentPlayer(parseInt(msg.playerId));
          break;
        case 'RESET':
          handleReset();
          break;
        case 'PLAYER_LEFT':
          setMessage('Player left the game');
          setIsOnline(false);
          setTimeout(() => {
            setMessage('');
            setIsOnline(false);
          }, 2000);
          break;
      }
    };

    onlineGame.onMessage(handleMessage);

    return () => {
      onlineGame.onMessage(() => {});
    };
  }, [players]);

  // Sync online players with local players
  useEffect(() => {
    if (isOnline) {
      const onlinePlayers = onlineGame.getPlayers();
      if (onlinePlayers.length > 0) {
        setPlayers((prev) =>
          prev.map((p, idx) => {
            const onlinePlayer = onlinePlayers[idx];
            if (onlinePlayer) {
              return {
                ...p,
                name: onlinePlayer.name,
                color: onlinePlayer.color,
                bgColor: onlinePlayer.bgColor,
                position: onlinePlayer.position,
              };
            }
            return p;
          })
        );
        setPlayerCount(onlinePlayers.length);
      }
    }
  }, [isOnline]);

  const resetGame = useCallback((count: number = playerCount) => {
    setPlayers(createPlayers(count));
    setCurrentPlayer(0);
    setDiceValue(1);
    setIsRolling(false);
    setIsMoving(false);
    setWinner(null);
    setLastRoll(null);
    setMessage('');
    setAnimatingSquare(null);
    moveQueueRef.current = [];
    isProcessingRef.current = false;
    gameMovesRef.current = 0;
    setGameStartTime(Date.now());
  }, [playerCount]);

  const handleReset = useCallback(() => {
    if (isOnline) {
      onlineGame.resetGame();
    }
    resetGame();
  }, [isOnline, resetGame]);

  const handlePlayerCountChange = useCallback((count: number) => {
    setPlayerCount(count);
    resetGame(count);
  }, [resetGame]);

  const animateMove = useCallback((playerId: number, from: number, to: number, silent: boolean = false): Promise<void> => {
    return new Promise((resolve) => {
      const steps: number[] = [];
      const step = from < to ? 1 : -1;
      for (let i = from + step; step > 0 ? i <= to : i >= to; i += step) {
        steps.push(i);
      }

      let stepIndex = 0;
      const interval = setInterval(() => {
        if (stepIndex >= steps.length) {
          clearInterval(interval);
          setAnimatingSquare(null);
          resolve();
          return;
        }

        const currentStep = steps[stepIndex];
        setAnimatingSquare(currentStep);
        // Play step sound for normal moves (not snake/ladder)
        if (!silent) {
          sounds.step();
        }
        setPlayers((prev) =>
          prev.map((p) =>
            p.id === playerId ? { ...p, position: currentStep } : p
          )
        );
        stepIndex++;
      }, 250);
    });
  }, []);

  const processMoveQueue = useCallback(async () => {
    if (isProcessingRef.current || moveQueueRef.current.length === 0) return;
    isProcessingRef.current = true;
    setIsMoving(true);
    gameMovesRef.current += 1;

    const targetPosition = moveQueueRef.current[moveQueueRef.current.length - 1];
    const player = players[currentPlayer];
    const fromPosition = player.position;

    // Animate the dice roll movement
    await animateMove(player.id, fromPosition, targetPosition);

    // Check for snake or ladder
    let finalPosition = targetPosition;
    let moveMessage = '';

    if (isLadder(targetPosition)) {
      finalPosition = getLadderTop(targetPosition);
      moveMessage = `Ladder! Climb to ${finalPosition}!`;
      setMessage(moveMessage);
      sounds.ladderClimb();
      if (isOnline) {
        onlineGame.ladderClimb(currentPlayer.toString(), targetPosition, finalPosition);
      }
      await new Promise((r) => setTimeout(r, 500));
      await animateMove(player.id, targetPosition, finalPosition, true);
    } else if (isSnake(targetPosition)) {
      finalPosition = getSnakeTail(targetPosition);
      moveMessage = `Snake! Slide to ${finalPosition}!`;
      setMessage(moveMessage);
      sounds.snakeSlide();
      if (isOnline) {
        onlineGame.snakeSlide(currentPlayer.toString(), targetPosition, finalPosition);
      }
      await new Promise((r) => setTimeout(r, 500));
      await animateMove(player.id, targetPosition, finalPosition, true);
    }

    // Update position
    const displayPosition = Math.min(finalPosition, TOTAL_SQUARES);
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === player.id ? { ...p, position: displayPosition } : p
      )
    );

    if (isOnline) {
      onlineGame.movePlayer(currentPlayer.toString(), fromPosition, targetPosition, displayPosition);
    }

    // Check for winner
    if (finalPosition >= TOTAL_SQUARES) {
      setWinner(player);
      setMessage(`${player.name} wins the game!`);
      sounds.winner();
      
      if (isOnline) {
        onlineGame.declareWinner(currentPlayer.toString(), player.name);
      }

      // Record game result
      const duration = Math.floor((Date.now() - gameStartTime) / 1000);
      recordGameResult(players, player, isOnline, duration);

      setIsMoving(false);
      isProcessingRef.current = false;
      moveQueueRef.current = [];
      return;
    }

    // Move to next player
    const nextPlayer = (currentPlayer + 1) % playerCount;
    setTimeout(() => {
      setCurrentPlayer(nextPlayer);
      setMessage('');
      setIsMoving(false);
      isProcessingRef.current = false;
      moveQueueRef.current = [];
      sounds.turnChange();

      if (isOnline) {
        onlineGame.nextTurn(nextPlayer);
      }
    }, 800);
  }, [players, currentPlayer, playerCount, isOnline, isMoving, gameStartTime, animateMove]);

  const handleRoll = useCallback(() => {
    if (isRolling || isMoving || winner) return;

    // In online mode, only current player can roll
    if (isOnline && !onlineGame.isHostPlayer() && currentPlayer !== 0) {
      // For simplicity, let both players roll in turn
    }

    setIsRolling(true);
    setMessage('');
    sounds.diceRoll();

    // Roll animation
    const rollInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
    }, 80);

    setTimeout(() => {
      clearInterval(rollInterval);
      const roll = rollDice();
      setDiceValue(roll);
      setLastRoll(roll);
      setIsRolling(false);
      sounds.diceLand();

      if (isOnline) {
        onlineGame.rollDice(roll);
      }

      const player = players[currentPlayer];
      const newPosition = player.position + roll;

      if (newPosition > TOTAL_SQUARES) {
        setMessage(`Need ${TOTAL_SQUARES - player.position} to win!`);
        sounds.cannotMove();
        setTimeout(() => {
          const nextPlayer = (currentPlayer + 1) % playerCount;
          setCurrentPlayer(nextPlayer);
          setMessage('');
          sounds.turnChange();
          if (isOnline) {
            onlineGame.nextTurn(nextPlayer);
          }
        }, 1500);
        return;
      }

      moveQueueRef.current = [newPosition];
      processMoveQueue();
    }, 1200);
  }, [isRolling, isMoving, winner, players, currentPlayer, playerCount, isOnline, processMoveQueue]);

  const handleOnlineGameStart = () => {
    setIsOnline(true);
    // Initialize 2 players for online mode
    const onlinePlayers = onlineGame.getPlayers();
    const newPlayers: Player[] = onlinePlayers.map((op, idx) => ({
      id: idx,
      name: op.name,
      color: op.color,
      bgColor: op.bgColor,
      position: 0,
      isActive: idx === 0,
    }));
    
    if (newPlayers.length === 1) {
      // Add placeholder for second player
      newPlayers.push({
        id: 1,
        name: 'Waiting...',
        color: PLAYER_COLORS[1].color,
        bgColor: PLAYER_COLORS[1].bgColor,
        position: 0,
        isActive: false,
      });
    }
    
    setPlayers(newPlayers);
    setPlayerCount(newPlayers.length);
    resetGame(newPlayers.length);
    setGameStartTime(Date.now());
  };

  const handleOnlineGameEnd = () => {
    setIsOnline(false);
    setMessage('');
    resetGame(2);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-6 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-7xl flex items-center justify-between mb-6 px-2"
      >
        <div className="w-10" />
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-1">Snakes & Ladders</h1>
          <p className="text-slate-500 text-sm">Roll the dice and reach square 100!</p>
        </div>
        <SoundToggle />
      </motion.div>

      {/* Main Game Area */}
      <div className="flex flex-col xl:flex-row items-start gap-6 w-full max-w-7xl">
        {/* Left Sidebar - User Profile */}
        <div className="w-full xl:w-64 flex-shrink-0 order-2 xl:order-1">
          <UserProfile
            onOpenLeaderboard={() => setShowLeaderboard(true)}
            onOpenHistory={() => setShowHistory(true)}
          />
        </div>

        {/* Board */}
        <div className="flex-1 w-full max-w-xl mx-auto order-1 xl:order-2">
          <Board players={players} animatingSquare={animatingSquare} />
        </div>

        {/* Controls */}
        <div className="w-full xl:w-auto flex flex-col items-center gap-4 order-3">
          {/* Online Play Button */}
          <button
            onClick={() => setShowOnlinePlay(true)}
            disabled={isOnline}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all shadow-md ${
              isOnline
                ? 'bg-emerald-500 text-white cursor-default'
                : 'bg-slate-800 text-white hover:bg-slate-700 active:scale-95'
            }`}
          >
            <Globe className="w-5 h-5" />
            {isOnline ? '🟢 Online' : 'Play Online'}
          </button>

          <Dice3D
            value={diceValue}
            isRolling={isRolling}
            onRoll={handleRoll}
            disabled={isMoving || !!winner || (isOnline && !onlineGame.isHostPlayer() && currentPlayer !== 0)}
          />

          <GameControls
            players={players}
            currentPlayer={currentPlayer}
            winner={winner}
            onReset={handleReset}
            onPlayerCountChange={isOnline ? undefined : handlePlayerCountChange}
            playerCount={playerCount}
            lastRoll={lastRoll}
            message={message}
            isOnline={isOnline}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-emerald-100 border border-emerald-300 rounded" />
          <span>Ladder Start</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-rose-100 border border-rose-300 rounded" />
          <span>Snake Head</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-amber-100 border border-amber-300 rounded" />
          <span>Goal</span>
        </div>
      </div>

      {/* Modals */}
      <OnlinePlay
        isOpen={showOnlinePlay}
        onClose={() => !isOnline && setShowOnlinePlay(false)}
        onGameStart={handleOnlineGameStart}
        onGameEnd={handleOnlineGameEnd}
      />

      <Leaderboard
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        showHistory={false}
      />

      <Leaderboard
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        showHistory={true}
      />
    </div>
  );
}
