import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Copy, Link, Wifi, WifiOff, Loader2, Check, X, LogOut } from 'lucide-react';
import { onlineGame, ConnectionState, generateInviteLink, parseInviteLink, clearUrlParams } from '../game/online';
import { getOrCreateUser } from '../game/storage';
import { sounds } from '../game/sounds';

interface OnlinePlayProps {
  isOpen: boolean;
  onClose: () => void;
  onGameStart: (isHost: boolean) => void;
  onGameEnd: () => void;
}

export default function OnlinePlay({ isOpen, onClose, onGameStart, onGameEnd }: OnlinePlayProps) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinRoomCode, setJoinRoomCode] = useState('');

  useEffect(() => {
    // Check for invite link in URL
    const invitedRoom = parseInviteLink();
    if (invitedRoom) {
      setJoinRoomCode(invitedRoom);
      clearUrlParams();
    }
  }, []);

  useEffect(() => {
    let prevPlayerCount = 0;
    const handleStateChange = (state: ConnectionState) => {
      setConnectionState(state);
      if (state === 'playing') {
        sounds.gameStart();
        onGameStart(onlineGame.isHostPlayer());
      }
      if (state === 'waiting') {
        sounds.notification();
      }
      if (state === 'disconnected' && connectionState !== 'disconnected') {
        sounds.playerLeft();
        onGameEnd();
      }
    };

    const handlePlayersChange = () => {
      const hostRoomId = onlineGame.getRoomId();
      if (hostRoomId) {
        setRoomId(hostRoomId);
        setInviteLink(generateInviteLink(hostRoomId));
      }
      // Detect player joined
      const currentCount = onlineGame.getPlayers().length;
      if (currentCount > prevPlayerCount && prevPlayerCount > 0) {
        sounds.playerJoined();
      }
      prevPlayerCount = currentCount;
    };

    onlineGame.onStateChange(handleStateChange);
    onlineGame.onPlayersChange(handlePlayersChange);

    return () => {
      onlineGame.onStateChange(() => {});
      onlineGame.onPlayersChange(() => {});
    };
  }, [onGameStart, onGameEnd, connectionState]);

  const handleCreateRoom = async () => {
    sounds.click();
    setError(null);
    const user = getOrCreateUser();
    try {
      await onlineGame.createRoom(user.username);
    } catch (err: any) {
      setError(err.message || 'Failed to create room');
    }
  };

  const handleJoinRoom = async () => {
    if (!joinRoomCode.trim()) return;
    sounds.click();
    setError(null);
    const user = getOrCreateUser();
    try {
      await onlineGame.joinRoom(joinRoomCode.trim(), user.username);
    } catch (err: any) {
      setError(err.message || 'Failed to join room');
    }
  };

  const handleCopyLink = async () => {
    sounds.notification();
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      setCopySuccess(false);
    }
  };

  const handleLeave = () => {
    onlineGame.leave();
    setRoomId(null);
    setInviteLink('');
    setError(null);
    onClose();
  };

  const getStatusColor = () => {
    switch (connectionState) {
      case 'connected':
      case 'playing':
        return 'text-emerald-500';
      case 'connecting':
      case 'waiting':
        return 'text-amber-500';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusText = () => {
    switch (connectionState) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'waiting':
        return 'Waiting for player...';
      case 'playing':
        return 'Playing';
      default:
        return 'Disconnected';
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
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${connectionState === 'playing' ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                {connectionState === 'disconnected' ? (
                  <WifiOff className="w-5 h-5 text-white" />
                ) : (
                  <Wifi className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Online Play</h2>
                <div className={`text-xs ${getStatusColor()}`}>{getStatusText()}</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm"
              >
                {error}
              </motion.div>
            )}

            {connectionState === 'disconnected' ? (
              <div className="space-y-4">
                {/* Create Room */}
                <div className="border border-slate-200 rounded-xl p-4">
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Create New Room
                  </h3>
                  <p className="text-sm text-slate-500 mb-3">
                    Start a new game and invite a friend to join.
                  </p>
                  <button
                    onClick={handleCreateRoom}
                    className="w-full py-3 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Create Room
                  </button>
                </div>

                {/* Join Room */}
                <div className="border border-slate-200 rounded-xl p-4">
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    Join Existing Room
                  </h3>
                  <p className="text-sm text-slate-500 mb-3">
                    Enter a room code to join a friend's game.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={joinRoomCode}
                      onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                      placeholder="ROOM CODE"
                      maxLength={8}
                      className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-center font-mono font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-slate-400 uppercase"
                    />
                    <button
                      onClick={handleJoinRoom}
                      disabled={!joinRoomCode.trim()}
                      className="px-6 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Join
                    </button>
                  </div>
                </div>
              </div>
            ) : connectionState === 'waiting' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Waiting for Player</h3>
                <p className="text-sm text-slate-500 mb-4">Share this code or link with a friend:</p>
                
                {roomId && (
                  <div className="bg-slate-100 rounded-xl p-4 mb-4">
                    <div className="text-2xl font-mono font-bold text-slate-800 tracking-wider mb-2">
                      {roomId}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={inviteLink}
                        readOnly
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 truncate"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="p-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                      >
                        {copySuccess ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleLeave}
                  className="text-slate-500 hover:text-slate-700 text-sm underline"
                >
                  Cancel
                </button>
              </div>
            ) : connectionState === 'playing' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Game Ready!</h3>
                <p className="text-sm text-slate-500 mb-4">
                  {onlineGame.isHostPlayer() ? 'You are the host. Game will start when both players are ready.' : 'You have joined the game. Waiting for host to start.'}
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={handleLeave}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 font-medium rounded-lg hover:bg-rose-200 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Leave Game
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 text-slate-300 animate-spin mx-auto mb-4" />
                <p className="text-slate-500">Connecting...</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
