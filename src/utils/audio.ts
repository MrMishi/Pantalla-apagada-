// Web Audio API synthesizer for realistic ambient sound and haptic click effects

class AudioController {
  private ctx: AudioContext | null = null;
  private isMusicPlaying: boolean = false;
  private musicOscillators: (OscillatorNode | GainNode)[] = [];
  private intervalId: number | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play subtle haptic feedback sound
  playClickSound(frequency = 280, duration = 0.04) {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  // Double click / wake sound
  playWakeSound() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(580, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {
      // Ignore
    }
  }

  // Gentle lofi chord ambient simulator to verify continuous audio while blacked out
  toggleSimulatedAudio(play: boolean) {
    if (play && !this.isMusicPlaying) {
      this.startAmbientMusic();
    } else if (!play && this.isMusicPlaying) {
      this.stopAmbientMusic();
    }
  }

  isAudioActive(): boolean {
    return this.isMusicPlaying;
  }

  private startAmbientMusic() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      this.isMusicPlaying = true;

      // Gentle chord notes in Hz (Lo-Fi Cmaj9 / Am7 progression)
      const chords = [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [196.00, 246.94, 293.66, 349.23], // G7
      ];
      let chordIndex = 0;

      const playChord = () => {
        if (!this.isMusicPlaying || !this.ctx) return;
        const currentChord = chords[chordIndex];
        chordIndex = (chordIndex + 1) % chords.length;

        currentChord.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          // Soft attack and slow decay
          gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.025 - idx * 0.003, this.ctx.currentTime + 0.6);
          gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.8);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start();
          osc.stop(this.ctx.currentTime + 2.9);
        });
      };

      playChord();
      this.intervalId = window.setInterval(playChord, 3000);
    } catch {
      this.isMusicPlaying = false;
    }
  }

  private stopAmbientMusic() {
    this.isMusicPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  triggerHaptic(duration = 40) {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch {
        // Not supported or permission denied
      }
    }
  }
}

export const audioController = new AudioController();
