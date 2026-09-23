import { useEffect, useRef, useState } from 'react';
import { NeonButton, CharacterAvatar } from './ui';
import { CHARACTERS, WORLDS, levelFromXP, getLevelTitle } from '@/game/data';
import { sfx } from '@/game/audio';
import type { PlayerState, Screen } from '@/game/types';

interface HomeScreenProps {
  player: PlayerState;
  onNavigate: (screen: Screen) => void;
  onPlay: () => void;
}

export function HomeScreen({ player, onNavigate, onPlay }: HomeScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showDaily, setShowDaily] = useState(false);
  const char = CHARACTERS.find(c => c.id === player.equippedCharacter)!;
  const lvl = levelFromXP(player.xp);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const buildings: { x: number; w: number; h: number; color: string; windows: boolean[] }[] = [];
    for (let i = 0; i < 25; i++) {
      buildings.push({
        x: i * 50 - 100,
        w: 35 + Math.random() * 25,
        h: 80 + Math.random() * 180,
        color: ['#1a1a3e', '#2a2a5e', '#1a2a4e', '#2a1a3e'][Math.floor(Math.random() * 4)],
        windows: Array.from({ length: 30 }, () => Math.random() > 0.4),
      });
    }

    const cars: { x: number; y: number; speed: number; color: string; dir: number }[] = [];
    for (let i = 0; i < 6; i++) {
      cars.push({
        x: Math.random() * canvas.width,
        y: 40 + Math.random() * 120,
        speed: 0.5 + Math.random() * 1.5,
        color: ['#00d4ff', '#ff006e', '#ffdd00', '#00ff88'][i % 4],
        dir: Math.random() > 0.5 ? 1 : -1,
      });
    }

    const rain: { x: number; y: number; speed: number; len: number }[] = [];
    for (let i = 0; i < 60; i++) {
      rain.push({ x: Math.random() * 400, y: Math.random() * 600, speed: 4 + Math.random() * 4, len: 8 + Math.random() * 12 });
    }

    const drones: { x: number; y: number; speed: number }[] = [];
    for (let i = 0; i < 3; i++) {
      drones.push({ x: Math.random() * 300, y: 30 + Math.random() * 60, speed: 0.3 + Math.random() * 0.5 });
    }

    const render = () => {
      time += 0.016;
      const w = canvas.width;
      const h = canvas.height;

      // Sky gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#0a0e27');
      grad.addColorStop(0.4, '#1a1a3e');
      grad.addColorStop(0.7, '#2a1a4e');
      grad.addColorStop(1, '#0a0e27');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Moon glow
      const moonX = w * 0.78;
      const moonY = h * 0.1;
      const moonGrad = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 80);
      moonGrad.addColorStop(0, 'rgba(0, 212, 255, 0.3)');
      moonGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = moonGrad;
      ctx.fillRect(moonX - 80, moonY - 80, 160, 160);
      ctx.fillStyle = 'rgba(0, 212, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(moonX, moonY, 20, 0, Math.PI * 2);
      ctx.fill();

      // Stars
      for (let i = 0; i < 30; i++) {
        const sx = (i * 37) % w;
        const sy = (i * 23) % (h * 0.4);
        const tw = Math.sin(time * 2 + i) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${tw * 0.6})`;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Buildings (back layer)
      for (const b of buildings) {
        const bx = ((b.x - time * 5) % (w + 100) + w + 100) % (w + 100) - 50;
        ctx.fillStyle = b.color;
        ctx.fillRect(bx, h * 0.35 - b.h * 0.4, b.w, b.h * 0.4);

        // Windows
        for (let wi = 0; wi < b.windows.length; wi++) {
          if (b.windows[wi]) {
            const wx = bx + 4 + (wi % 4) * 10;
            const wy = h * 0.35 - b.h * 0.4 + 4 + Math.floor(wi / 4) * 10;
            if (wy < h * 0.35 - 4) {
              ctx.fillStyle = Math.sin(time * 3 + wi) > 0.7 ? '#00ffff' : 'rgba(0, 212, 255, 0.4)';
              ctx.fillRect(wx, wy, 3, 3);
            }
          }
        }
      }

      // Flying cars
      for (const car of cars) {
        car.x += car.speed * car.dir;
        if (car.dir > 0 && car.x > w + 50) car.x = -50;
        if (car.dir < 0 && car.x < -50) car.x = w + 50;
        ctx.fillStyle = car.color;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(car.x, car.y, 12, 4);
        // Trail
        const trailGrad = ctx.createLinearGradient(
          car.dir > 0 ? car.x + 12 : car.x - 20, car.y + 2,
          car.dir > 0 ? car.x + 30 : car.x - 40, car.y + 2
        );
        trailGrad.addColorStop(0, car.color + '88');
        trailGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = trailGrad;
        ctx.fillRect(car.dir > 0 ? car.x + 12 : car.x - 20, car.y + 1, 20, 3);
        ctx.globalAlpha = 1;
      }

      // Drones
      for (const drone of drones) {
        drone.x += drone.speed;
        if (drone.x > w + 20) drone.x = -20;
        ctx.fillStyle = 'rgba(0, 212, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(drone.x, drone.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 0, 110, 0.8)';
        ctx.fillRect(drone.x - 0.5, drone.y + 2, 1.5, 1.5);
      }

      // Holographic ad
      const adX = w * 0.15;
      const adY = h * 0.2;
      ctx.save();
      ctx.translate(adX, adY);
      ctx.rotate(Math.sin(time) * 0.02);
      ctx.globalAlpha = 0.3 + Math.sin(time * 2) * 0.1;
      ctx.fillStyle = '#00d4ff';
      ctx.font = 'bold 16px Orbitron, sans-serif';
      ctx.fillText('NEON RUSH', 0, 0);
      ctx.font = '10px Rajdhani, sans-serif';
      ctx.fillStyle = '#00ff88';
      ctx.fillText('CYBER CITY', 0, 14);
      ctx.restore();
      ctx.globalAlpha = 1;

      // Rain
      for (const r of rain) {
        r.y += r.speed;
        r.x -= 1;
        if (r.y > h) { r.y = -20; r.x = Math.random() * w; }
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x - 2, r.y + r.len);
        ctx.stroke();
      }

      // Ground reflection
      const groundGrad = ctx.createLinearGradient(0, h * 0.35, 0, h);
      groundGrad.addColorStop(0, '#0a0e1a');
      groundGrad.addColorStop(1, '#111827');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, h * 0.35, w, h * 0.65);

      // Road perspective lines
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
      ctx.lineWidth = 1;
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(w / 2 + i * 30, h * 0.35);
        ctx.lineTo(w / 2 + i * 80, h);
        ctx.stroke();
      }

      // Moving road lines
      for (let i = 0; i < 5; i++) {
        const z = ((i * 0.2 + time * 0.5) % 1);
        const y = h * 0.35 + z * z * h * 0.65;
        const lineW = z * w * 0.8;
        ctx.strokeStyle = `rgba(0, 212, 255, ${z * 0.3})`;
        ctx.lineWidth = z * 2;
        ctx.beginPath();
        ctx.moveTo(w / 2 - lineW / 2, y);
        ctx.lineTo(w / 2 + lineW / 2, y);
        ctx.stroke();
      }

      raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const menuButtons: { label: string; screen: Screen; icon: string; color: string }[] = [
    { label: 'CHARACTERS', screen: 'characters', icon: '👤', color: 'text-cyan-300' },
    { label: 'SHOP', screen: 'shop', icon: '🛒', color: 'text-yellow-300' },
    { label: 'MISSIONS', screen: 'missions', icon: '🎯', color: 'text-green-300' },
    { label: 'EVENTS', screen: 'events', icon: '🎉', color: 'text-pink-300' },
    { label: 'LEADERBOARD', screen: 'leaderboard', icon: '🏆', color: 'text-yellow-300' },
    { label: 'ACHIEVEMENTS', screen: 'achievements', icon: '🎖', color: 'text-purple-300' },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 safe-top z-10">
        <div className="flex items-center justify-between px-4 pt-3">
          <button
            onClick={() => { sfx.button(); onNavigate('profile'); }}
            className="glass rounded-xl px-3 py-2 flex items-center gap-2 btn-press"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-800 flex items-center justify-center">
              <CharacterAvatar character={char} size={32} animated={false} />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-slate-400 font-display">LV {lvl.level}</div>
              <div className="text-xs font-display font-bold text-cyan-300">{getLevelTitle(lvl.level)}</div>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <div className="glass rounded-xl px-3 py-2 flex items-center gap-1.5">
              <span className="text-yellow-400 text-sm">$</span>
              <span className="font-display font-bold text-yellow-300 text-sm">{player.coins.toLocaleString()}</span>
            </div>
            <button
              onClick={() => { sfx.button(); onNavigate('settings'); }}
              className="glass rounded-xl w-10 h-10 flex items-center justify-center btn-press"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-300">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </div>

        {/* XP bar */}
        <div className="px-4 mt-2">
          <div className="glass-light rounded-full px-3 py-1.5 flex items-center gap-2">
            <span className="text-[10px] font-display text-cyan-300">XP</span>
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-green-400 rounded-full transition-all" style={{ width: `${lvl.progress * 100}%` }} />
            </div>
            <span className="text-[10px] font-display text-slate-400">{lvl.current}/{lvl.needed}</span>
          </div>
        </div>
      </div>

      {/* Center character */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-5 pointer-events-none">
        <div className="mt-20">
          <CharacterAvatar character={char} size={160} />
        </div>
      </div>

      {/* Daily reward button */}
      <button
        onClick={() => { sfx.buttonBig(); onNavigate('daily'); }}
        className="absolute top-32 right-4 z-10 glass rounded-2xl p-3 btn-press animate-pulse-glow"
      >
        <div className="flex flex-col items-center">
          <span className="text-2xl">🎁</span>
          <span className="text-[10px] font-display font-bold text-yellow-300 mt-1">DAILY</span>
        </div>
      </button>

      {/* Bottom menu */}
      <div className="absolute bottom-0 left-0 right-0 safe-bottom z-10 pb-4">
        {/* Menu grid */}
        <div className="px-4 mb-3">
          <div className="grid grid-cols-3 gap-2">
            {menuButtons.map(btn => (
              <button
                key={btn.label}
                onClick={() => { sfx.button(); onNavigate(btn.screen); }}
                className="glass rounded-xl py-3 px-2 btn-press hover:border-cyan-400/40 border border-transparent transition-all"
              >
                <div className="text-xl mb-0.5">{btn.icon}</div>
                <div className={`text-[10px] font-display font-bold ${btn.color}`}>{btn.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Play button */}
        <div className="px-4">
          <NeonButton variant="primary" size="lg" className="w-full text-xl py-5" onClick={onPlay} icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>}>
            PLAY
          </NeonButton>
        </div>
      </div>

      {/* Logo */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-5 pointer-events-none text-center">
        <h1 className="font-display font-black text-3xl gradient-text tracking-wider">NEON RUSH</h1>
        <p className="text-xs font-display text-cyan-400/60 tracking-[0.3em]">CYBER CITY</p>
      </div>
    </div>
  );
}
