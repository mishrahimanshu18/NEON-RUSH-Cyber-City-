import { useState } from 'react';
import { ScreenHeader, NeonButton, RarityBadge, GlassPanel, CoinDisplay } from './ui';
import { CHARACTERS, COSMETICS, HOVERBOARDS, RARITY_COLORS, RARITY_ORDER, DAILY_REWARDS } from '@/game/data';
import type { PlayerState, CharacterId } from '@/game/types';
import { sfx } from '@/game/audio';

interface ShopScreenProps {
  player: PlayerState;
  onBack: () => void;
  onBuyCharacter: (id: CharacterId) => boolean;
  onBuyCosmetic: (id: string) => boolean;
  onBuyHoverboard: (id: string) => boolean;
  onBuyMysteryBox: (type: 'basic' | 'rare' | 'epic' | 'legendary', price: number) => boolean;
  onOpenMysteryBox: (type: 'basic' | 'rare' | 'epic' | 'legendary') => string | null;
}

const CATEGORIES = [
  { id: 'featured', label: 'Featured', icon: '⭐' },
  { id: 'characters', label: 'Characters', icon: '👤' },
  { id: 'hoverboards', label: 'Boards', icon: '🛹' },
  { id: 'cosmetics', label: 'Cosmetics', icon: '✨' },
  { id: 'boxes', label: 'Mystery', icon: '🎁' },
];

export function ShopScreen({ player, onBack, onBuyCharacter, onBuyCosmetic, onBuyHoverboard, onBuyMysteryBox }: ShopScreenProps) {
  const [category, setCategory] = useState('featured');
  const [purchaseResult, setPurchaseResult] = useState<string | null>(null);

  const showResult = (msg: string) => {
    setPurchaseResult(msg);
    setTimeout(() => setPurchaseResult(null), 2000);
  };

  const featured = [
    ...CHARACTERS.filter(c => c.rarity === 'legendary' || c.rarity === 'mythic').slice(0, 2),
    ...HOVERBOARDS.filter(b => b.rarity === 'legendary' || b.rarity === 'mythic').slice(0, 2),
    ...COSMETICS.filter(c => c.rarity === 'legendary').slice(0, 2),
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden flex flex-col">
      <ScreenHeader title="Shop" onBack={onBack} right={<CoinDisplay amount={player.coins} />} />

      {/* Category tabs */}
      <div className="px-4 pb-2 overflow-x-auto">
        <div className="flex gap-2 pb-1">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => { sfx.button(); setCategory(c.id); }}
              className={`px-3 py-2 rounded-xl text-xs font-display font-bold whitespace-nowrap btn-press transition-all ${
                category === c.id ? 'glass border-cyan-400/50 text-cyan-300' : 'glass-light text-slate-400'
              }`}
            >
              <span className="mr-1">{c.icon}</span>{c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {category === 'featured' && (
          <div className="space-y-3">
            <h3 className="font-display font-bold text-cyan-300 text-sm uppercase tracking-wider">Featured Items</h3>
            {featured.map(item => {
              const isChar = 'colors' in item;
              const isBoard = 'trail' in item;
              const unlocked = isChar
                ? player.unlockedCharacters.includes(item.id as CharacterId)
                : isBoard
                ? player.unlockedHoverboards.includes(item.id)
                : player.unlockedCosmetics.includes(item.id);
              const rc = RARITY_COLORS[item.rarity];
              return (
                <div key={item.id} className="glass rounded-2xl p-4 flex items-center gap-4" style={{ borderColor: rc.border + '44' }}>
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
                    style={{ background: (rc as any).bg, border: `1px solid ${rc.border}` }}
                  >
                    {isChar ? '👤' : isBoard ? '🛹' : '✨'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-bold text-white">{item.name}</h4>
                      <RarityBadge rarity={item.rarity} />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{(item as any).description || ''}</p>
                  </div>
                  {unlocked ? (
                    <span className="text-green-400 font-display font-bold text-sm">OWNED</span>
                  ) : (
                    <NeonButton
                      variant="secondary"
                      size="sm"
                      disabled={player.coins < item.price}
                      onClick={() => {
                        let ok = false;
                        if (isChar) ok = onBuyCharacter(item.id as CharacterId);
                        else if (isBoard) ok = onBuyHoverboard(item.id);
                        else ok = onBuyCosmetic(item.id);
                        if (ok) { sfx.reward(); showResult('Purchase successful!'); }
                        else showResult('Not enough coins');
                      }}
                    >
                      ${item.price.toLocaleString()}
                    </NeonButton>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {category === 'characters' && (
          <div className="grid grid-cols-2 gap-3">
            {CHARACTERS.map(char => {
              const unlocked = player.unlockedCharacters.includes(char.id);
              const rc = RARITY_COLORS[char.rarity];
              return (
                <div key={char.id} className="glass rounded-2xl p-3" style={{ borderColor: rc.border + '44' }}>
                  <div className="aspect-square rounded-xl flex items-center justify-center mb-2" style={{ background: rc.bg }}>
                    <span className="text-4xl">{unlocked ? '👤' : '🔒'}</span>
                  </div>
                  <h4 className="font-display font-bold text-sm text-white text-center">{char.name}</h4>
                  <div className="flex justify-center my-1"><RarityBadge rarity={char.rarity} /></div>
                  {unlocked ? (
                    <div className="text-center text-green-400 text-xs font-display font-bold">OWNED</div>
                  ) : (
                    <NeonButton
                      variant="secondary"
                      size="sm"
                      className="w-full mt-1"
                      disabled={player.coins < char.price}
                      onClick={() => {
                        const ok = onBuyCharacter(char.id);
                        if (ok) { sfx.reward(); showResult(`${char.name} unlocked!`); }
                        else showResult('Not enough coins');
                      }}
                    >
                      ${char.price.toLocaleString()}
                    </NeonButton>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {category === 'hoverboards' && (
          <div className="grid grid-cols-2 gap-3">
            {HOVERBOARDS.map(board => {
              const unlocked = player.unlockedHoverboards.includes(board.id);
              const rc = RARITY_COLORS[board.rarity];
              return (
                <div key={board.id} className="glass rounded-2xl p-3" style={{ borderColor: rc.border + '44' }}>
                  <div className="aspect-square rounded-xl flex items-center justify-center mb-2" style={{ background: board.color + '22', border: `1px solid ${board.color}` }}>
                    <span className="text-4xl">{unlocked ? '🛹' : '🔒'}</span>
                  </div>
                  <h4 className="font-display font-bold text-sm text-white text-center">{board.name}</h4>
                  <div className="flex justify-center my-1"><RarityBadge rarity={board.rarity} /></div>
                  {unlocked ? (
                    <div className="text-center text-green-400 text-xs font-display font-bold">OWNED</div>
                  ) : (
                    <NeonButton
                      variant="secondary"
                      size="sm"
                      className="w-full mt-1"
                      disabled={player.coins < board.price}
                      onClick={() => {
                        const ok = onBuyHoverboard(board.id);
                        if (ok) { sfx.reward(); showResult(`${board.name} unlocked!`); }
                        else showResult('Not enough coins');
                      }}
                    >
                      ${board.price.toLocaleString()}
                    </NeonButton>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {category === 'cosmetics' && (
          <div className="grid grid-cols-2 gap-3">
            {[...COSMETICS].sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity)).map(cos => {
              const unlocked = player.unlockedCosmetics.includes(cos.id);
              const rc = RARITY_COLORS[cos.rarity];
              const icon = cos.type === 'jacket' ? '🧥' : cos.type === 'helmet' ? '⛑' : cos.type === 'mask' ? '😷' :
                cos.type === 'shoes' ? '👟' : cos.type === 'gloves' ? '🧤' : cos.type === 'back' ? '🎒' : '✨';
              return (
                <div key={cos.id} className="glass rounded-2xl p-3" style={{ borderColor: rc.border + '44' }}>
                  <div className="aspect-square rounded-xl flex items-center justify-center mb-2" style={{ background: cos.color + '22', border: `1px solid ${cos.color}` }}>
                    <span className="text-4xl">{unlocked ? icon : '🔒'}</span>
                  </div>
                  <h4 className="font-display font-bold text-xs text-white text-center">{cos.name}</h4>
                  <div className="flex justify-center my-1"><RarityBadge rarity={cos.rarity} /></div>
                  {unlocked ? (
                    <div className="text-center text-green-400 text-xs font-display font-bold">OWNED</div>
                  ) : (
                    <NeonButton
                      variant="secondary"
                      size="sm"
                      className="w-full mt-1"
                      disabled={player.coins < cos.price}
                      onClick={() => {
                        const ok = onBuyCosmetic(cos.id);
                        if (ok) { sfx.reward(); showResult(`${cos.name} unlocked!`); }
                        else showResult('Not enough coins');
                      }}
                    >
                      ${cos.price.toLocaleString()}
                    </NeonButton>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {category === 'boxes' && (
          <div className="space-y-3">
            <h3 className="font-display font-bold text-cyan-300 text-sm uppercase tracking-wider">Mystery Boxes</h3>
            {[
              { type: 'basic', name: 'Basic Box', price: 500, icon: '📦', color: '#666666', desc: 'Common to Rare cosmetics' },
              { type: 'rare', name: 'Rare Box', price: 2000, icon: '🎁', color: '#00d4ff', desc: 'Rare to Epic cosmetics' },
              { type: 'epic', name: 'Epic Box', price: 5000, icon: '🎀', color: '#9d00ff', desc: 'Epic to Legendary cosmetics' },
              { type: 'legendary', name: 'Legendary Box', price: 15000, icon: '💎', color: '#ffaa00', desc: 'Legendary to Mythic cosmetics' },
            ].map(box => (
              <div key={box.type} className="glass rounded-2xl p-4 flex items-center gap-4" style={{ borderColor: box.color + '44' }}>
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl" style={{ background: box.color + '22', border: `1px solid ${box.color}` }}>
                  {box.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-display font-bold text-white">{box.name}</h4>
                  <p className="text-xs text-slate-400">{box.desc}</p>
                  <p className="text-xs text-slate-500 mt-1">Owned: {(player.mysteryBoxes as any)[box.type]}</p>
                </div>
                <NeonButton
                  variant="secondary"
                  size="sm"
                  disabled={player.coins < box.price}
                  onClick={() => { const ok = onBuyMysteryBox(box.type as 'basic' | 'rare' | 'epic' | 'legendary', box.price); if (ok) { sfx.reward(); showResult(box.name + ' purchased!'); } else { showResult('Not enough coins'); } }}
                >
                  ${box.price.toLocaleString()}
                </NeonButton>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Purchase notification */}
      {purchaseResult && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 glass rounded-xl px-6 py-3 animate-scale-in">
          <p className="font-display font-bold text-cyan-300">{purchaseResult}</p>
        </div>
      )}
    </div>
  );
}




