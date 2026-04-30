export class AudioSystem {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = true;
  private musicEnabled: boolean = true;
  private ambientNode: AudioBufferSourceNode | null = null;
  private factoryHums: Map<string, OscillatorNode> = new Map();

  init(): void {
    if (this.ctx) {
      return;
    }
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.3;
    this.masterGain.connect(this.ctx.destination);
  }

  private getCtx(): AudioContext | null {
    if (!this.ctx) {
      this.init();
    }
    return this.ctx;
  }

  playClick(): void {
    if (!this.enabled) {
      return;
    }
    const ctx = this.getCtx();
    if (!ctx || !this.masterGain) {
      return;
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 800;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  playBuild(): void {
    if (!this.enabled) {
      return;
    }
    const ctx = this.getCtx();
    if (!ctx || !this.masterGain) {
      return;
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.3);
    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }

  playResearchComplete(): void {
    if (!this.enabled) {
      return;
    }
    const ctx = this.getCtx();
    if (!ctx || !this.masterGain) {
      return;
    }
    const freqs = [523, 659, 784];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime + i * 0.15;
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  playTradeComplete(): void {
    if (!this.enabled) {
      return;
    }
    const ctx = this.getCtx();
    if (!ctx || !this.masterGain) {
      return;
    }
    const freqs = [880, 1760];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime + i * 0.08;
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + 0.12);
    });
  }

  playCargoBlip(): void {
    if (!this.enabled) {
      return;
    }
    const ctx = this.getCtx();
    if (!ctx || !this.masterGain) {
      return;
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 440;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }

  playFactoryHum(buildingId: string): void {
    if (!this.enabled) {
      return;
    }
    if (this.factoryHums.has(buildingId)) {
      return;
    }
    const ctx = this.getCtx();
    if (!ctx || !this.masterGain) {
      return;
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 80;
    osc.type = 'sine';
    gain.gain.value = 0.05;
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    this.factoryHums.set(buildingId, osc);
  }

  stopFactoryHum(buildingId: string): void {
    const osc = this.factoryHums.get(buildingId);
    if (osc) {
      osc.stop();
      this.factoryHums.delete(buildingId);
    }
  }

  playAlert(): void {
    if (!this.enabled) {
      return;
    }
    const ctx = this.getCtx();
    if (!ctx || !this.masterGain) {
      return;
    }
    const freqs = [440, 660, 440, 660];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime + i * 0.15;
      osc.frequency.value = freq;
      osc.type = 'square';
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + 0.14);
    });
  }

  startAmbient(): void {
    if (!this.musicEnabled) {
      return;
    }
    const ctx = this.getCtx();
    if (!ctx || !this.masterGain) {
      return;
    }
    if (this.ambientNode) {
      return;
    }

    // Richer ambient: drone layer + pad notes + high shimmer
    const sampleRate = ctx.sampleRate;
    const duration = 6; // 6-second loop
    const frameCount = sampleRate * duration;
    const buffer = ctx.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);

    // Pentatonic-inspired frequencies (A minor pentatonic sub-octaves)
    const droneFreqs = [55, 82.5, 110, 165]; // A1, E2, A2, E3
    // Pad notes staggered across the loop
    const padNotes = [
      { freq: 220, start: 0.0 }, // A3
      { freq: 277.18, start: 1.2 }, // C#4
      { freq: 329.63, start: 2.4 }, // E4
      { freq: 220, start: 3.6 }, // A3
      { freq: 415.30, start: 4.8 }, // G#4
    ];
    const padDuration = 1.8; // each pad note lasts 1.8 s

    for (let i = 0; i < frameCount; i++) {
      const t = i / sampleRate;
      let sample = 0;

      // Drone layer with slow LFO modulation
      for (const f of droneFreqs) {
        const lfo = 0.78 + 0.22 * Math.sin(2 * Math.PI * 0.11 * t);
        sample += (Math.sin(2 * Math.PI * f * t) * 0.07 * lfo) / droneFreqs.length;
      }

      // Pad notes with slow attack/release envelope
      for (const pad of padNotes) {
        const relT = t - pad.start;
        if (relT >= 0 && relT < padDuration) {
          const u = relT / padDuration;
          const env = u < 0.12 ? u / 0.12 : u > 0.75 ? (1 - u) / 0.25 : 1.0;
          // Main voice + slight detune for chorus depth
          sample += Math.sin(2 * Math.PI * pad.freq * t) * 0.055 * env;
          sample += Math.sin(2 * Math.PI * (pad.freq * 1.006) * t) * 0.025 * env;
        }
      }

      // Subtle high shimmer
      sample +=
        Math.sin(2 * Math.PI * 880 * t) *
        0.008 *
        (0.5 + 0.5 * Math.sin(2 * Math.PI * 0.22 * t));

      data[i] = Math.max(-0.9, Math.min(0.9, sample));
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(this.masterGain);
    source.start();
    this.ambientNode = source;
  }

  stopAmbient(): void {
    if (this.ambientNode) {
      this.ambientNode.stop();
      this.ambientNode = null;
    }
  }

  setEnabled(v: boolean): void {
    this.enabled = v;
  }
  setMusicEnabled(v: boolean): void {
    this.musicEnabled = v;
  }
  isEnabled(): boolean {
    return this.enabled;
  }
  isMusicEnabled(): boolean {
    return this.musicEnabled;
  }
}
