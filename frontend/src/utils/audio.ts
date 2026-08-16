let audioCtx: AudioContext | null = null;
let isMuted = false;

// Load mute setting from localStorage
try {
  const saved = localStorage.getItem('neu-todo-muted');
  if (saved !== null) {
    isMuted = JSON.parse(saved);
  }
} catch (e) {
  console.error('Failed to load mute setting', e);
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const audioService = {
  isMuted: () => isMuted,
  
  setMuted: (muted: boolean) => {
    isMuted = muted;
    try {
      localStorage.setItem('neu-todo-muted', JSON.stringify(muted));
    } catch (e) {
      console.error('Failed to save mute setting', e);
    }
  },

  playClick: () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Soft click: high frequency drop-off
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  },

  playToggle: (isOn: boolean) => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    const startFreq = isOn ? 350 : 500;
    const endFreq = isOn ? 500 : 350;

    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  },

  playComplete: () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const playNote = (freq: number, startDelay: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startDelay);

      gain.gain.setValueAtTime(0, ctx.currentTime + startDelay);
      gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + startDelay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startDelay + duration);

      osc.start(ctx.currentTime + startDelay);
      osc.stop(ctx.currentTime + startDelay + duration);
    };

    // A beautiful rising, glassy arpeggio: E5 (659Hz), G#5 (830Hz), B5 (987Hz), E6 (1318Hz)
    playNote(659.25, 0, 0.2);
    playNote(830.61, 0.06, 0.2);
    playNote(987.77, 0.12, 0.2);
    playNote(1318.51, 0.18, 0.35);
  },

  playAlarm: () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const playBeep = (startDelay: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime + startDelay); // D5

      gain.gain.setValueAtTime(0, ctx.currentTime + startDelay);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + startDelay + 0.02);
      gain.gain.setValueAtTime(0.08, ctx.currentTime + startDelay + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startDelay + 0.18);

      osc.start(ctx.currentTime + startDelay);
      osc.stop(ctx.currentTime + startDelay + 0.18);
    };

    // Pulsating gentle alarm chime: D5 - F#5 - A5 sequence twice
    playBeep(0);
    playBeep(0.15);
    playBeep(0.3);
    playBeep(0.6);
    playBeep(0.75);
    playBeep(0.9);
  }
};
