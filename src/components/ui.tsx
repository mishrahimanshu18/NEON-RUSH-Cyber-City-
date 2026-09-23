import { type ReactNode, useEffect } from 'react';
import { sfx } from '@/game/audio';

export function NeonButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  icon,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  icon?: ReactNode;
}) {
  const variants: Record<string, string> = {
    primary: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400/50 text-cyan-300 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,212,255,0.4)]',
    secondary: 'bg-gradient-to-r from-slate-700/40 to-slate-800/40 border-slate-500/50 text-slate-200 hover:border-slate-400',
    danger: 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-400/50 text-red-300 hover:border-red-400 hover:shadow-[0_0_20px_rgba(255,0,110,0.4)]',
    success: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/50 text-green-300 hover:border-green-400 hover:shadow-[0_0_20px_rgba(0,255,136,0.4)]',
    ghost: 'bg-transparent border-transparent text-slate-300 hover:text-cyan-300',
  };
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-5 py-2.5 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl',
  };
  return (
    <button
      disabled={disabled}
      onClick={() => { if (!disabled) { sfx.button(); onClick?.(); } }}
      className={`neon-btn btn-press font-display font-bold border-2 ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} transition-all duration-200 ${className}`}
    >
      <span className="flex items-center justify-center gap-2">{icon}{children}</span>
    </button>
  );
}

export function GlassPanel({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`glass rounded-2xl ${className}`}>
      {children}
    </div>
  );
}

export function ProgressBar({ value, max, className = '', color = 'cyan' }: { value: number; max: number; className?: string; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  const colors: Record<string, string> = {
    cyan: 'from-cyan-400 to-blue-500',
    green: 'from-green-400 to-emerald-500',
    pink: 'from-pink-400 to-purple-500',
    yellow: 'from-yellow-400 to-orange-500',
  };
  return (
    <div className={`w-full h-2 bg-slate-800/60 rounded-full overflow-hidden ${className}`}>
      <div className={`h-full bg-gradient-to-r ${colors[color] || colors.cyan} rounded-full transition-all duration-300`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function RarityBadge({ rarity }: { rarity: string }) {
  const colors: Record<string, string> = {
    common: 'text-gray-400 border-gray-500/50 bg-gray-500/10',
    rare: 'text-cyan-400 border-cyan-500/50 bg-cyan-500/10',
    epic: 'text-purple-400 border-purple-500/50 bg-purple-500/10',
    legendary: 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10',
    mythic: 'text-pink-400 border-pink-500/50 bg-pink-500/10',
  };
  return (
    <span className={`text-xs font-display font-bold uppercase px-2 py-0.5 rounded-md border ${colors[rarity] || colors.common}`}>
      {rarity}
    </span>
  );
}

export function CoinDisplay({ amount, className = '' }: { amount: number; className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center text-[10px] font-bold text-yellow-900 shadow-[0_0_8px_rgba(255,221,0,0.4)]">
        $
      </div>
      <span className="font-display font-bold text-yellow-300">{amount.toLocaleString()}</span>
    </div>
  );
}

export function ScreenHeader({ title, onBack, right }: { title: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 safe-top">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={() => { sfx.button(); onBack(); }}
            className="w-10 h-10 rounded-xl glass-light flex items-center justify-center btn-press hover:border-cyan-400/50 border border-transparent transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-300">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        <h1 className="font-display font-black text-xl gradient-text uppercase tracking-wider">{title}</h1>
      </div>
      {right}
    </div>
  );
}

export function Modal({ children, onClose, className = '' }: { children: ReactNode; onClose?: () => void; className?: string }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className={`relative glass rounded-3xl p-6 max-w-sm w-full animate-scale-in ${className}`} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function StatChip({ icon, label, value, color = 'cyan' }: { icon: ReactNode; label: string; value: string | number; color?: string }) {
  const colors: Record<string, string> = {
    cyan: 'text-cyan-300 border-cyan-500/30',
    green: 'text-green-300 border-green-500/30',
    pink: 'text-pink-300 border-pink-500/30',
    yellow: 'text-yellow-300 border-yellow-500/30',
    purple: 'text-purple-300 border-purple-500/30',
  };
  return (
    <div className={`glass-light rounded-xl px-3 py-2 border ${colors[color] || colors.cyan} flex items-center gap-2`}>
      <div className="opacity-80">{icon}</div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-display">{label}</div>
        <div className="font-display font-bold text-sm">{value}</div>
      </div>
    </div>
  );
}

export function CharacterAvatar({ character, size = 80, animated = true }: { character: { colors: { primary: string; secondary: string; accent: string; skin: string; hair: string } }; size?: number; animated?: boolean }) {
  const c = character.colors;
  const s = size;
  return (
    <div
      className={`relative ${animated ? 'animate-float' : ''}`}
      style={{ width: s, height: s }}
    >
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-full blur-xl opacity-40"
        style={{ background: c.accent }}
      />
      {/* Character */}
      <svg viewBox="0 0 100 100" className="relative w-full h-full">
        {/* Shadow */}
        <ellipse cx="50" cy="92" rx="20" ry="4" fill="rgba(0,0,0,0.3)" />
        {/* Legs */}
        <rect x="38" y="60" width="10" height="28" rx="3" fill={c.secondary} />
        <rect x="52" y="60" width="10" height="28" rx="3" fill={c.secondary} />
        {/* Shoes */}
        <rect x="36" y="84" width="14" height="6" rx="2" fill={c.accent} style={{ filter: `drop-shadow(0 0 4px ${c.accent})` }} />
        <rect x="50" y="84" width="14" height="6" rx="2" fill={c.accent} style={{ filter: `drop-shadow(0 0 4px ${c.accent})` }} />
        {/* Body */}
        <rect x="32" y="35" width="36" height="30" rx="6" fill={c.primary} style={{ filter: `drop-shadow(0 0 6px ${c.accent}88)` }} />
        {/* Accent line */}
        <rect x="49" y="35" width="2" height="30" fill={c.accent} />
        {/* Arms */}
        <rect x="22" y="38" width="10" height="22" rx="4" fill={c.primary} />
        <rect x="68" y="38" width="10" height="22" rx="4" fill={c.primary} />
        {/* Wrist device */}
        <rect x="70" y="56" width="6" height="4" rx="1" fill={c.accent} style={{ filter: `drop-shadow(0 0 3px ${c.accent})` }} />
        {/* Head */}
        <circle cx="50" cy="25" r="14" fill={c.skin} />
        {/* Hair */}
        <path d="M 36 25 Q 36 10 50 10 Q 64 10 64 25 L 64 18 Q 50 14 36 18 Z" fill={c.hair} />
        {/* Eyes */}
        <circle cx="45" cy="25" r="1.5" fill="#001" />
        <circle cx="55" cy="25" r="1.5" fill="#001" />
        {/* Smile */}
        <path d="M 46 30 Q 50 33 54 30" stroke="#001" strokeWidth="1" fill="none" strokeLinecap="round" />
        {/* Holographic ring */}
        <ellipse cx="50" cy="45" rx="28" ry="4" fill="none" stroke={c.accent} strokeWidth="0.5" opacity="0.4" />
      </svg>
    </div>
  );
}

export function useCountUp(target: number, duration = 1000): { value: number; done: boolean } {
  const value = useStateValue(target, duration);
  return { value, done: value >= target };
}

import { useState, useRef } from 'react';

function useStateValue(target: number, duration: number) {
  const [value, setValue] = useState(0);
  const ref = useRef<number>(0);
  useEffect(() => {
    const start = ref.current;
    const diff = target - start;
    if (diff === 0) return;
    const startTime = performance.now();
    let raf: number;
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.floor(start + diff * eased);
      setValue(current);
      ref.current = current;
      if (t < 1) raf = requestAnimationFrame(animate);
      else { setValue(target); ref.current = target; }
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

