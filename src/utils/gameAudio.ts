/**
 * TalentXcel CareerVerse Web Audio Synthesizer
 * Generates retro arcade and victory sound effects using browser Web Audio API.
 * Zero external audio files required, zero latency, 100% reliable.
 */

class GameAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Read mute preference from localStorage
    if (typeof window !== 'undefined') {
      this.isMuted = localStorage.getItem('careerverse_sound_muted') === 'true';
    }
  }

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (typeof window === 'undefined') return null;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return null;

      if (!this.ctx || this.ctx.state === 'closed') {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('careerverse_sound_muted', this.isMuted ? 'true' : 'false');
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Play positive XP reward chime (Ascending arpeggio)
   */
  public playXpGain(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.25);
    });
  }

  /**
   * Play major Level-Up / Boss Victory Fanfare
   */
  public playLevelUp(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const chords = [
      { freqs: [261.63, 329.63, 392.0], start: 0, dur: 0.15 },       // C major
      { freqs: [293.66, 369.99, 440.0], start: 0.18, dur: 0.15 },    // D major
      { freqs: [329.63, 415.3, 493.88], start: 0.36, dur: 0.18 },    // E major
      { freqs: [523.25, 659.25, 783.99, 1046.5], start: 0.58, dur: 0.6 }, // High C major victory
    ];

    chords.forEach((chord) => {
      chord.freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + chord.start);

        gain.gain.setValueAtTime(0, now + chord.start);
        gain.gain.linearRampToValueAtTime(0.12, now + chord.start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + chord.start + chord.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + chord.start);
        osc.stop(now + chord.start + chord.dur);
      });
    });
  }

  /**
   * Play tactile click sound
   */
  public playClick(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  /**
   * Play incorrect/warning buzz
   */
  public playWrong(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.2);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }
}

export const gameAudio = new GameAudioSynthesizer();
