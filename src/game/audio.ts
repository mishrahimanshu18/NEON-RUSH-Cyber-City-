import bgmUrl from '../the_mountain-cyberpunk-132336.mp3';
let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let musicInterval: number | null = null;
let musicEnabled = false;
let musicVol = 0.7;
let sfxVol = 0.8;
let sfxEnabled = true;
let currentIntensity = 0;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.8;
    masterGain.connect(ctx.destination);

    musicGain = ctx.createGain();
    musicGain.gain.value = musicVol;
    musicGain.connect(masterGain);

    sfxGain = ctx.createGain();
    sfxGain.gain.value = sfxVol;
    sfxGain.connect(masterGain);
  }
  return ctx;
}

export function initAudio() {
  getCtx();
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

export function setSoundEnabled(enabled: boolean) {
  sfxEnabled = enabled;
}

export function setMusicEnabled(enabled: boolean) {
  musicEnabled = enabled;
  if (!enabled) stopMusic();
}

export function setMusicVolume(v: number) {
  musicVol = v;
  if (musicGain) musicGain.gain.value = v;
}

export function setSfxVolume(v: number) {
  sfxVol = v;
  if (sfxGain) sfxGain.gain.value = v;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', vol = 0.3, attack = 0.005, release = 0.1) {
  if (!sfxEnabled) return;
  const c = getCtx();
  if (!c || !sfxGain) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(sfxGain);
  const now = c.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(vol, now + attack);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.start(now);
  osc.stop(now + duration + 0.05);
}

function playNoise(duration: number, vol = 0.2, filterFreq = 1000) {
  if (!sfxEnabled) return;
  const c = getCtx();
  if (!c || !sfxGain) return;
  const bufferSize = c.sampleRate * duration;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = c.createBufferSource();
  noise.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = filterFreq;
  const gain = c.createGain();
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGain);
  const now = c.currentTime;
  gain.gain.setValueAtTime(vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  noise.start(now);
  noise.stop(now + duration);
}

function playSweep(startFreq: number, endFreq: number, duration: number, type: OscillatorType = 'sawtooth', vol = 0.2) {
  if (!sfxEnabled) return;
  const c = getCtx();
  if (!c || !sfxGain) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.connect(gain);
  gain.connect(sfxGain);
  const now = c.currentTime;
  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
  gain.gain.setValueAtTime(vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.start(now);
  osc.stop(now + duration + 0.05);
}

export const sfx = {
  coin: () => playTone(880, 0.08, 'sine', 0.15),
  coinHigh: () => { playTone(880, 0.06, 'sine', 0.12); setTimeout(() => playTone(1320, 0.08, 'sine', 0.12), 40); },
  jump: () => playSweep(200, 600, 0.15, 'sine', 0.2),
  doubleJump: () => playSweep(400, 900, 0.12, 'sine', 0.18),
  slide: () => playNoise(0.2, 0.15, 800),
  land: () => playTone(100, 0.1, 'sine', 0.2),
  laneSwitch: () => playTone(500, 0.05, 'triangle', 0.1),
  hit: () => { playNoise(0.3, 0.4, 200); playTone(80, 0.3, 'sawtooth', 0.3); },
  powerup: () => { playSweep(300, 1200, 0.3, 'sine', 0.2); setTimeout(() => playTone(1200, 0.1, 'sine', 0.15), 200); },
  nearMiss: () => playSweep(1000, 200, 0.15, 'sine', 0.15),
  combo: (level: number) => { const f = 440 + level * 80; playTone(f, 0.1, 'square', 0.15); setTimeout(() => playTone(f * 1.5, 0.08, 'square', 0.12), 60); },
  shield: () => playTone(600, 0.2, 'sine', 0.2),
  button: () => playTone(600, 0.04, 'sine', 0.1),
  buttonBig: () => { playTone(440, 0.05, 'sine', 0.15); setTimeout(() => playTone(660, 0.08, 'sine', 0.15), 40); },
  reward: () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.15, 'sine', 0.2), i * 80)); },
  achievement: () => { [659, 784, 988, 1319].forEach((f, i) => setTimeout(() => playTone(f, 0.2, 'triangle', 0.2), i * 100)); },
  gameOver: () => { playSweep(400, 100, 0.5, 'sawtooth', 0.3); setTimeout(() => playTone(100, 0.5, 'sine', 0.2), 300); },
  countdown: () => playTone(440, 0.1, 'sine', 0.2),
  countdownGo: () => playTone(880, 0.2, 'sine', 0.25),
  hoverboard: () => playSweep(200, 800, 0.4, 'sawtooth', 0.2),
  blast: () => { playNoise(0.3, 0.4, 500); playSweep(100, 30, 0.3, 'sawtooth', 0.3); },
  whoosh: () => playSweep(800, 200, 0.2, 'sine', 0.1),
};

let musicAudio: HTMLAudioElement | null = null;
let musicSource: MediaElementAudioSourceNode | null = null;

export function startMusic() {
  musicEnabled = true;

  const c = getCtx();
  if (!c || !musicGain) return;

  if (!musicAudio) {
    musicAudio = new Audio(bgmUrl);
    musicAudio.loop = true;
    musicAudio.preload = 'auto';
    musicAudio.volume = 1;

    musicSource = c.createMediaElementSource(musicAudio);
    musicSource.connect(musicGain);
  }

  musicGain.gain.setTargetAtTime(musicVol, c.currentTime, 0.03);

  const playNow = () => {
    if (!musicEnabled || !musicAudio) return;

    void c.resume()
      .then(() => musicAudio?.play())
      .catch(() => {
        // Wait for a real user interaction.
      });
  };

  playNow();

  const unlock = () => {
    playNow();

    if (musicAudio && !musicAudio.paused) {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    }
  };

  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('keydown', unlock);
  window.addEventListener('touchstart', unlock, { passive: true });
}

export function stopMusic() {
  musicEnabled = false;

  if (musicAudio) {
    musicAudio.pause();
    musicAudio.currentTime = 0;
  }
}

export function setMusicIntensity(intensity: number) {
  currentIntensity = Math.max(0, Math.min(1, intensity));

  if (musicGain && ctx) {
    const targetVolume = musicVol * (0.85 + currentIntensity * 0.15);

    musicGain.gain.setTargetAtTime(
      targetVolume,
      ctx.currentTime,
      0.08,
    );
  }
}
export function haptic(pattern: number | number[] = 50) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}


