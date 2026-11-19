class SoundController {
  private ctx: AudioContext | null = null;
  private muted = false;

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.06, delay = 0) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playClick() {
    this.playTone(540, 0.07, 'triangle', 0.04);
  }

  playStart() {
    this.playTone(440, 0.12, 'sine', 0.05, 0);
    this.playTone(660, 0.16, 'sine', 0.05, 0.08);
  }

  playSuspense() {
    this.playTone(330, 0.22, 'sine', 0.045, 0);
    this.playTone(392, 0.22, 'sine', 0.045, 0.14);
    this.playTone(494, 0.28, 'sine', 0.05, 0.28);
  }

  playSuccess() {
    this.playTone(523.25, 0.14, 'triangle', 0.06, 0);
    this.playTone(659.25, 0.14, 'triangle', 0.06, 0.09);
    this.playTone(783.99, 0.24, 'triangle', 0.07, 0.18);
    this.playTone(1046.5, 0.3, 'sine', 0.05, 0.28);
  }

  playMiss() {
    this.playTone(280, 0.16, 'sine', 0.05, 0);
    this.playTone(220, 0.24, 'sine', 0.05, 0.12);
  }

  playTick() {
    this.playTone(880, 0.04, 'sine', 0.025);
  }
}

export const soundFx = new SoundController();
