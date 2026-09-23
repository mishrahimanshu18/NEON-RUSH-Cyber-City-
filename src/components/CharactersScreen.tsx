import { useState } from 'react';
import { ScreenHeader, NeonButton, GlassPanel, RarityBadge, CharacterAvatar, CoinDisplay } from './ui';
import { CHARACTERS, COSMETICS, HOVERBOARDS, RARITY_COLORS, RARITY_ORDER } from '@/game/data';
import type { PlayerState, CharacterId, CosmeticType } from '@/game/types';
import { sfx } from '@/game/audio';

interface CharactersScreenProps {
  player: PlayerState;
  onBack: () => void;
  onEquip: (id: CharacterId) => void;
  onBuy: (id: CharacterId) => void;
}

const TABS: { id: CosmeticType | 'character' | 'hoverboard'; label: string; icon: string }[] = [
  { id: 'character', label: 'Characters', icon: '👤' },
  { id: 'hoverboard', label: 'Boards', icon: '🛹' },
  { id: 'jacket', label: 'Jackets', icon: '🧥' },
  { id: 'helmet', label: 'Helmets', icon: '⛑' },
  { id: 'mask', label: 'Masks', icon: '😷' },
  { id: 'shoes', label: 'Shoes', icon: '👟' },
  { id: 'gloves', label: 'Gloves', icon: '🧤' },
  { id: 'back', label: 'Back', icon: '🎒' },
  { id: 'trail', label: 'Trails', icon: '✨' },
  { id: 'effect', label: 'Effects', icon: '🌟' },
];

export function CharactersScreen({ player, onBack, onEquip, onBuy }: CharactersScreenProps) {
  const [tab, setTab] = useState<CosmeticType | 'character' | 'hoverboard'>('character');
  const [selected, setSelected] = useState(0);
  const [rotation, setRotation] = useState(0);

  const items = tab === 'character'
    ? CHARACTERS
    : tab === 'hoverboard'
    ? HOVERBOARDS
    : COSMETICS.filter(c => c.type === tab);

  const sorted = [...items].sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity));
  const current = sorted[selected];

  const isUnlocked = (id: string) => {
    if (tab === 'character') return player.unlockedCharacters.includes(id as CharacterId);
    if (tab === 'hoverboard') return player.unlockedHoverboards.includes(id);
    return player.unlockedCosmetics.includes(id);
  };

  const isEquipped = (id: string) => {
    if (tab === 'character') return player.equippedCharacter === id;
    if (tab === 'hoverboard') return player.equippedHoverboard === id;
    const cos = COSMETICS.find(c => c.id === id);
    return cos ? player.equippedCosmetics[cos.type] === id : false;
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden flex flex-col">
      <ScreenHeader title="Customize" onBack={onBack} />

      {/* Tabs */}
      <div className="px-4 pb-2 overflow-x-auto">
        <div className="flex gap-2 pb-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { sfx.button(); setTab(t.id); setSelected(0); }}
              className={`px-3 py-2 rounded-xl text-xs font-display font-bold whitespace-nowrap btn-press transition-all ${
                tab === t.id
                  ? 'glass border-cyan-400/50 text-cyan-300'
                  : 'glass-light text-slate-400'
              }`}
            >
              <span className="mr-1">{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0">
        {tab === 'character' && current && (
          <div className="flex flex-col items-center">
            {/* 360 preview */}
            <div
              className="relative"
              style={{ perspective: '600px' }}
              onTouchStart={(e) => {
                const x = e.touches[0].clientX;
                const startRot = rotation;
                const onMove = (ev: TouchEvent) => setRotation(startRot + (ev.touches[0].clientX - x) * 0.5);
                const onEnd = () => { window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd); };
                window.addEventListener('touchmove', onMove);
                window.addEventListener('touchend', onEnd);
              }}
            >
              <div style={{ transform: `rotateY(${rotation}deg)`, transformStyle: 'preserve-3d' }}>
                <CharacterAvatar character={current as any} size={180} />
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-500 font-display">Swipe to rotate</div>
          </div>
        )}

        {tab === 'hoverboard' && current && (
          <div className="relative animate-float">
            <div className="absolute inset-0 blur-2xl opacity-40 rounded-full" style={{ background: (current as any).glow }} />
            <svg viewBox="0 0 120 60" className="relative w-48">
              <defs>
                <linearGradient id={`board-${current.id}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={(current as any).color} />
                  <stop offset="100%" stopColor={(current as any).glow} />
                </linearGradient>
              </defs>
              <ellipse cx="60" cy="35" rx="50" ry="10" fill={`url(#board-${current.id})`} style={{ filter: `drop-shadow(0 0 10px ${(current as any).glow})` }} />
              <ellipse cx="60" cy="33" rx="48" ry="8" fill="none" stroke={(current as any).glow} strokeWidth="0.5" opacity="0.6" />
              <ellipse cx="60" cy="40" rx="45" ry="3" fill={(current as any).trail} opacity="0.4" />
            </svg>
          </div>
        )}

        {tab !== 'character' && tab !== 'hoverboard' && current && (
          <div className="relative animate-float">
            <div className="absolute inset-0 blur-3xl opacity-30 rounded-full" style={{ background: (current as any).glow }} />
            <div
              className="relative w-32 h-32 rounded-2xl flex items-center justify-center text-5xl"
              style={{ background: (current as any).color + '33', border: `2px solid ${(current as any).color}`, boxShadow: `0 0 20px ${(current as any).glow}66` }}
            >
              {(current as any).type === 'jacket' ? '🧥' :
               (current as any).type === 'helmet' ? '⛑' :
               (current as any).type === 'mask' ? '😷' :
               (current as any).type === 'shoes' ? '👟' :
               (current as any).type === 'gloves' ? '🧤' :
               (current as any).type === 'back' ? '🎒' :
               (current as any).type === 'trail' ? '✨' : '🌟'}
            </div>
          </div>
        )}

        {/* Info */}
        {current && (
          <div className="mt-4 text-center">
            <h2 className="font-display font-black text-xl text-white">{current.name}</h2>
            <div className="mt-1 flex justify-center"><RarityBadge rarity={current.rarity} /></div>
            <p className="mt-2 text-sm text-slate-400 max-w-xs">{(current as any).description || ''}</p>
          </div>
        )}
      </div>

      {/* Action button */}
      <div className="px-4 pb-4 safe-bottom">
        {current && (
          <>
            {isUnlocked(current.id) ? (
              isEquipped(current.id) ? (
                <NeonButton variant="success" size="lg" className="w-full" disabled icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>}>
                  EQUIPPED
                </NeonButton>
              ) : (
                <NeonButton variant="primary" size="lg" className="w-full" onClick={() => {
                  sfx.buttonBig();
                  if (tab === 'character') onEquip(current.id as CharacterId);
                  else if (tab === 'hoverboard') {/* handled by parent */}
                  else {/* handled by parent */}
                }}>
                  EQUIP
                </NeonButton>
              )
            ) : (
              <NeonButton
                variant="secondary"
                size="lg"
                className="w-full"
                disabled={player.coins < current.price}
                onClick={() => { sfx.reward(); onBuy(current.id as CharacterId); }}
                icon={<span className="text-yellow-400">$</span>}
              >
                BUY {current.price.toLocaleString()}
              </NeonButton>
            )}
          </>
        )}
      </div>

      {/* Item grid */}
      <div className="px-4 pb-2">
        <div className="grid grid-cols-5 gap-2">
          {sorted.map((item, i) => {
            const unlocked = isUnlocked(item.id);
            const equipped = isEquipped(item.id);
            const rc = RARITY_COLORS[item.rarity];
            return (
              <button
                key={item.id}
                onClick={() => { sfx.button(); setSelected(i); }}
                className={`relative aspect-square rounded-xl btn-press transition-all ${
                  i === selected ? 'scale-110' : ''
                }`}
                style={{
                  background: unlocked ? rc.bg : 'rgba(30,30,40,0.5)',
                  border: `2px solid ${i === selected ? rc.border : 'transparent'}`,
                  boxShadow: i === selected ? `0 0 10px ${rc.glow}66` : 'none',
                }}
              >
                {tab === 'character' ? (
                  <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-lg">
                    <CharacterAvatar character={item as any} size={36} animated={false} />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg">
                    {unlocked ? (tab === 'hoverboard' ? '🛹' : '✨') : '🔒'}
                  </div>
                )}
                {equipped && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
