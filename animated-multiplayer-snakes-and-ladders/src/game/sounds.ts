// Sound system using Web Audio API for synthesized sound effects
// No external audio files needed - all sounds are generated procedurally

class SoundSystem {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = true;
  private volume: number = 0.5;

  constructor() {
    // Load preferences from localStorage
    const savedEnabled = localStorage.getItem('snakes_ladders_sound_enabled');
    const savedVolume = localStorage.getItem('snakes_ladders_sound_volume');
    if (savedEnabled !== null) this.enabled = savedEnabled === 'true';
    if (savedVolume !== null) this.volume = parseFloat(savedVolume);
  }

  private ensureContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.audioContext) {
      try {
        const AC = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AC();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = this.volume;
        this.masterGain.connect(this.audioContext.destination);
      } catch (e) {
        console.warn('Web Audio API not supported');
        return null;
      }
    }
    // Resume context if suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    localStorage.setItem('snakes_ladders_sound_enabled', String(enabled));
    if (this.masterGain) {
      this.masterGain.gain.value = enabled ? this.volume : 0;
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('snakes_ladders_sound_volume', String(this.volume));
    if (this.masterGain && this.enabled) {
      this.masterGain.gain.value = this.volume;
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getVolume(): number {
    return this.volume;
  }

  // Helper: create an oscillator with envelope
  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 1,
    startTime: number = 0,
    attackTime: number = 0.01,
    releaseTime: number = 0.1
  ): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime + startTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.value = frequency;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + attackTime);
    gain.gain.setValueAtTime(volume, now + duration - releaseTime);
    gain.gain.linearRampToValueAtTime(0, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  // Helper: noise buffer for percussive sounds
  private playNoise(
    duration: number,
    volume: number = 1,
    startTime: number = 0,
    filterFreq: number = 1000,
    filterType: BiquadFilterType = 'lowpass'
  ): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime + startTime;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = filterFreq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + duration);
  }

  // ----- GAME SOUNDS -----

  // Dice Rolling: rapid clacking/rattling sound that lasts ~1.2s
  diceRoll(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    // Series of quick clack sounds
    const numClacks = 12;
    for (let i = 0; i < numClacks; i++) {
      const t = (i / numClacks) * 1.1;
      this.playNoise(0.05, 0.3, t, 3000 + Math.random() * 2000, 'highpass');
      // Add tonal click
      this.playTone(
        200 + Math.random() * 400,
        0.04,
        'square',
        0.15,
        t,
        0.001,
        0.03
      );
    }
  }

  // Dice Land: final thud when dice settles
  diceLand(): void {
    this.playNoise(0.15, 0.5, 0, 800, 'lowpass');
    this.playTone(80, 0.15, 'sine', 0.4, 0, 0.005, 0.1);
    this.playTone(120, 0.1, 'triangle', 0.3, 0.02, 0.005, 0.08);
  }

  // Token Step: subtle click for each step movement
  step(): void {
    this.playTone(800, 0.05, 'sine', 0.15, 0, 0.001, 0.04);
    this.playNoise(0.03, 0.1, 0, 4000, 'highpass');
  }

  // Ladder Climb: ascending happy chime
  ladderClimb(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    // Pentatonic ascending arpeggio: C-E-G-C-E
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, i) => {
      this.playTone(freq, 0.25, 'sine', 0.35, i * 0.08, 0.01, 0.15);
      this.playTone(freq * 2, 0.2, 'triangle', 0.15, i * 0.08, 0.01, 0.15);
    });
    // Sparkle effect
    setTimeout(() => {
      for (let i = 0; i < 6; i++) {
        this.playTone(2000 + Math.random() * 2000, 0.08, 'sine', 0.1, i * 0.04, 0.005, 0.06);
      }
    }, 400);
  }

  // Snake Slide: descending hiss/slide sound
  snakeSlide(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    // Hiss sound
    this.playNoise(0.8, 0.3, 0, 3000, 'bandpass');
    
    // Descending slide tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.8);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1500;
    
    osc.connect(filter);
    filter.connect(gain);
    if (this.masterGain) gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.8);

    // Add wobble/slither effect with secondary descending tone
    setTimeout(() => {
      this.playTone(400, 0.3, 'triangle', 0.15, 0, 0.01, 0.2);
      this.playTone(200, 0.4, 'sine', 0.2, 0.1, 0.01, 0.3);
    }, 100);
  }

  // Winner: triumphant fanfare
  winner(): void {
    // Victory fanfare: C-E-G-C major chord arpeggio + sustained chord
    const arpeggio = [523.25, 659.25, 783.99, 1046.50];
    arpeggio.forEach((freq, i) => {
      this.playTone(freq, 0.2, 'triangle', 0.3, i * 0.1, 0.01, 0.1);
    });
    
    // Sustained victory chord
    setTimeout(() => {
      this.playTone(523.25, 1.0, 'sine', 0.25, 0, 0.05, 0.5); // C
      this.playTone(659.25, 1.0, 'sine', 0.25, 0, 0.05, 0.5); // E
      this.playTone(783.99, 1.0, 'sine', 0.25, 0, 0.05, 0.5); // G
      this.playTone(1046.50, 1.0, 'triangle', 0.2, 0, 0.05, 0.5); // C high
    }, 500);

    // Sparkle effects
    setTimeout(() => {
      for (let i = 0; i < 12; i++) {
        const freq = 2000 + Math.random() * 3000;
        this.playTone(freq, 0.1, 'sine', 0.08, i * 0.05, 0.005, 0.08);
      }
    }, 700);
  }

  // Lose Turn / Overshoot: descending sad sound
  cannotMove(): void {
    this.playTone(400, 0.15, 'triangle', 0.25, 0, 0.01, 0.1);
    this.playTone(300, 0.2, 'triangle', 0.25, 0.1, 0.01, 0.15);
    this.playTone(200, 0.3, 'triangle', 0.3, 0.25, 0.01, 0.2);
  }

  // Turn Change: subtle notification ping
  turnChange(): void {
    this.playTone(880, 0.1, 'sine', 0.2, 0, 0.005, 0.08);
    this.playTone(1318.51, 0.15, 'sine', 0.15, 0.05, 0.005, 0.12);
  }

  // Button Click: short UI click
  click(): void {
    this.playTone(1200, 0.04, 'sine', 0.2, 0, 0.001, 0.03);
    this.playNoise(0.02, 0.08, 0, 5000, 'highpass');
  }

  // Notification: pleasant chime for events (player joins etc)
  notification(): void {
    this.playTone(880, 0.15, 'sine', 0.25, 0, 0.005, 0.1);
    this.playTone(1108.73, 0.2, 'sine', 0.2, 0.08, 0.005, 0.15);
    this.playTone(1318.51, 0.3, 'sine', 0.18, 0.16, 0.005, 0.2);
  }

  // Player Joined: ascending welcome chime
  playerJoined(): void {
    this.playTone(523.25, 0.12, 'sine', 0.25, 0, 0.01, 0.08);
    this.playTone(659.25, 0.12, 'sine', 0.25, 0.08, 0.01, 0.08);
    this.playTone(783.99, 0.2, 'sine', 0.3, 0.16, 0.01, 0.15);
  }

  // Player Left: descending farewell tone
  playerLeft(): void {
    this.playTone(783.99, 0.15, 'triangle', 0.2, 0, 0.01, 0.1);
    this.playTone(523.25, 0.25, 'triangle', 0.2, 0.1, 0.01, 0.18);
  }

  // Game Start: ready bell
  gameStart(): void {
    this.playTone(523.25, 0.1, 'triangle', 0.2, 0, 0.01, 0.08);
    this.playTone(783.99, 0.1, 'triangle', 0.2, 0.1, 0.01, 0.08);
    this.playTone(1046.50, 0.3, 'triangle', 0.25, 0.2, 0.01, 0.2);
  }
}

// Singleton instance
export const sounds = new SoundSystem();
