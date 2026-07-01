import Peer, { DataConnection } from 'peerjs';

export type OnlinePlayer = {
  id: string;
  name: string;
  isHost: boolean;
  color: string;
  bgColor: string;
  position: number;
};

export type GameMessage =
  | { type: 'JOIN'; playerId: string; playerName: string }
  | { type: 'JOINED'; players: OnlinePlayer[] }
  | { type: 'ROLL'; playerId: string; roll: number }
  | { type: 'MOVE'; playerId: string; from: number; to: number; finalPosition: number }
  | { type: 'SNAKE'; playerId: string; from: number; to: number }
  | { type: 'LADDER'; playerId: string; from: number; to: number }
  | { type: 'WINNER'; playerId: string; playerName: string }
  | { type: 'TURN'; playerId: string }
  | { type: 'RESET'; players: OnlinePlayer[] }
  | { type: 'PLAYER_LEFT'; playerId: string }
  | { type: 'INVITE'; roomId: string; hostName: string };

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'waiting' | 'playing';

class OnlineGame {
  private peer: Peer | null = null;
  private connection: DataConnection | null = null;
  private state: ConnectionState = 'disconnected';
  private roomId: string | null = null;
  private playerId: string | null = null;
  private playerName: string = '';
  private isHost: boolean = false;
  private players: OnlinePlayer[] = [];
  private currentPlayerIndex: number = 0;
  private onMessageCallback: ((msg: GameMessage) => void) | null = null;
  private onStateChangeCallback: ((state: ConnectionState) => void) | null = null;
  private onPlayersChangeCallback: ((players: OnlinePlayer[]) => void) | null = null;

  constructor() {}

  // Initialize as host (create room)
  async createRoom(name: string): Promise<{ roomId: string; playerId: string }> {
    this.playerName = name;
    this.isHost = true;
    this.state = 'connecting';
    this.notifyStateChange();

    return new Promise((resolve, reject) => {
      this.peer = new Peer({
        debug: 2,
      });

      this.peer.on('open', (id) => {
        this.roomId = id.substring(0, 8).toUpperCase();
        this.playerId = id;
        this.players = [
          {
            id: this.playerId,
            name: this.playerName,
            isHost: true,
            color: '#ef4444',
            bgColor: '#fef2f2',
            position: 0,
          },
        ];
        this.state = 'waiting';
        this.notifyStateChange();
        this.notifyPlayersChange();
        resolve({ roomId: this.roomId!, playerId: this.playerId! });
      });

      this.peer.on('connection', (conn) => {
        this.handleConnection(conn);
      });

      this.peer.on('error', (err) => {
        console.error('Peer error:', err);
        this.state = 'disconnected';
        this.notifyStateChange();
        reject(err);
      });
    });
  }

  // Join existing room
  async joinRoom(roomId: string, name: string): Promise<{ playerId: string }> {
    this.playerName = name;
    this.roomId = roomId;
    this.isHost = false;
    this.state = 'connecting';
    this.notifyStateChange();

    return new Promise((resolve, reject) => {
      // Find a peer with the room ID - we need to use a peer server
      // For simplicity, we'll use the public PeerJS server
      this.peer = new Peer({
        debug: 2,
      });

      this.peer.on('open', (id) => {
        this.playerId = id;
        
        // Try to connect to host - use a simplified room ID format
        const hostId = roomId.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
        const conn = this.peer!.connect(hostId, {
          metadata: { name: this.playerName },
        });

        conn.on('open', () => {
          this.connection = conn;
          this.setupConnection();
          
          // Send join message
          this.send({ type: 'JOIN', playerId: this.playerId!, playerName: this.playerName });
          resolve({ playerId: this.playerId! });
        });

        conn.on('error', (err) => {
          console.error('Connection error:', err);
          this.state = 'disconnected';
          this.notifyStateChange();
          reject(new Error('Could not connect to room. Room may not exist.'));
        });
      });

      this.peer.on('error', (err) => {
        console.error('Peer error:', err);
        this.state = 'disconnected';
        this.notifyStateChange();
        reject(err);
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.state === 'connecting') {
          this.state = 'disconnected';
          this.notifyStateChange();
          reject(new Error('Connection timeout'));
        }
      }, 10000);
    });
  }

  private handleConnection(conn: DataConnection): void {
    if (this.connection) {
      // Already have a connection (for 2-player only)
      conn.close();
      return;
    }

    conn.on('open', () => {
      this.connection = conn;
      this.setupConnection();

      // Get player name from metadata
      const playerName = conn.metadata?.name || 'Player 2';
      const newPlayer: OnlinePlayer = {
        id: conn.peer,
        name: playerName,
        isHost: false,
        color: '#3b82f6',
        bgColor: '#eff6ff',
        position: 0,
      };
      this.players.push(newPlayer);
      this.state = 'playing';
      this.notifyStateChange();
      this.notifyPlayersChange();

      // Send current game state to new player
      this.send({ type: 'JOINED', players: this.players });
    });
  }

  private setupConnection(): void {
    if (!this.connection) return;

    this.connection.on('data', (data: unknown) => {
      if (data && typeof data === 'object' && 'type' in data) {
        this.handleMessage(data as GameMessage);
      }
    });

    this.connection.on('close', () => {
      this.handleDisconnect();
    });

    this.connection.on('error', (err) => {
      console.error('Connection error:', err);
      this.handleDisconnect();
    });
  }

  private handleMessage(msg: GameMessage): void {
    switch (msg.type) {
      case 'JOIN':
        // Host receives join request
        if (this.isHost && this.players.length < 2) {
          const newPlayer: OnlinePlayer = {
            id: msg.playerId,
            name: msg.playerName,
            isHost: false,
            color: '#3b82f6',
            bgColor: '#eff6ff',
            position: 0,
          };
          this.players.push(newPlayer);
          this.state = 'playing';
          this.notifyStateChange();
          this.notifyPlayersChange();
          this.send({ type: 'JOINED', players: this.players });
        }
        break;

      case 'ROLL':
      case 'MOVE':
      case 'SNAKE':
      case 'LADDER':
      case 'WINNER':
      case 'TURN':
      case 'RESET':
        // Forward game messages
        if (this.onMessageCallback) {
          this.onMessageCallback(msg);
        }
        break;

      case 'PLAYER_LEFT':
        this.handleDisconnect();
        break;
    }
  }

  private handleDisconnect(): void {
    this.connection = null;
    this.state = 'disconnected';
    this.notifyStateChange();
    
    if (this.onMessageCallback) {
      this.onMessageCallback({ type: 'PLAYER_LEFT', playerId: '' });
    }
  }

  send(msg: GameMessage): void {
    if (this.connection?.open) {
      this.connection.send(msg);
    }
  }

  // Game actions
  rollDice(roll: number): void {
    if (this.isHost) {
      this.send({ type: 'ROLL', playerId: this.currentPlayerIndex.toString(), roll });
    }
  }

  movePlayer(playerId: string, from: number, to: number, finalPosition: number): void {
    if (this.isHost) {
      this.send({ type: 'MOVE', playerId, from, to, finalPosition });
      
      // Update local player position
      const playerIndex = this.players.findIndex(p => p.id === playerId);
      if (playerIndex !== -1) {
        this.players[playerIndex].position = finalPosition;
        this.notifyPlayersChange();
      }
    }
  }

  snakeSlide(playerId: string, from: number, to: number): void {
    if (this.isHost) {
      this.send({ type: 'SNAKE', playerId, from, to });
    }
  }

  ladderClimb(playerId: string, from: number, to: number): void {
    if (this.isHost) {
      this.send({ type: 'LADDER', playerId, from, to });
    }
  }

  declareWinner(playerId: string, playerName: string): void {
    if (this.isHost) {
      this.send({ type: 'WINNER', playerId, playerName });
    }
  }

  nextTurn(playerIndex: number): void {
    this.currentPlayerIndex = playerIndex;
    if (this.isHost) {
      this.send({ type: 'TURN', playerId: playerIndex.toString() });
    }
  }

  resetGame(): void {
    this.players.forEach(p => p.position = 0);
    this.currentPlayerIndex = 0;
    this.notifyPlayersChange();
    
    if (this.isHost) {
      this.send({ type: 'RESET', players: this.players });
    }
  }

  leave(): void {
    if (this.connection) {
      this.send({ type: 'PLAYER_LEFT', playerId: this.playerId || '' });
      this.connection.close();
    }
    if (this.peer) {
      this.peer.destroy();
    }
    this.reset();
  }

  private reset(): void {
    this.peer = null;
    this.connection = null;
    this.state = 'disconnected';
    this.roomId = null;
    this.playerId = null;
    this.players = [];
    this.currentPlayerIndex = 0;
  }

  // Getters
  getState(): ConnectionState {
    return this.state;
  }

  getPlayers(): OnlinePlayer[] {
    return this.players;
  }

  getRoomId(): string | null {
    return this.roomId;
  }

  getPlayerId(): string | null {
    return this.playerId;
  }

  isHostPlayer(): boolean {
    return this.isHost;
  }

  getCurrentPlayerIndex(): number {
    return this.currentPlayerIndex;
  }

  // Callbacks
  onMessage(callback: (msg: GameMessage) => void): void {
    this.onMessageCallback = callback;
  }

  onStateChange(callback: (state: ConnectionState) => void): void {
    this.onStateChangeCallback = callback;
  }

  onPlayersChange(callback: (players: OnlinePlayer[]) => void): void {
    this.onPlayersChangeCallback = callback;
  }

  private notifyStateChange(): void {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(this.state);
    }
  }

  private notifyPlayersChange(): void {
    if (this.onPlayersChangeCallback) {
      this.onPlayersChangeCallback([...this.players]);
    }
  }
}

// Singleton instance
export const onlineGame = new OnlineGame();

// Generate shareable invite link
export function generateInviteLink(roomId: string): string {
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?room=${roomId}`;
}

// Parse invite link
export function parseInviteLink(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('room');
}

// Clear URL params after joining
export function clearUrlParams(): void {
  window.history.replaceState({}, document.title, window.location.pathname);
}
