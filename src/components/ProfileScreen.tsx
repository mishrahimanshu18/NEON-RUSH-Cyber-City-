import { ScreenHeader, GlassPanel, StatChip, CharacterAvatar, ProgressBar } from './ui';
import { CHARACTERS, HOVERBOARDS, COSMETICS, levelFromXP, getLevelTitle } from '@/game/data';
import type { PlayerState } from '@/game/types';

interface ProfileScreenProps {
  player: PlayerState;
  onBack: () => void;
}

export function ProfileScreen({ player, onBack }: ProfileScreenProps) {
  const char = CHARACTERS.find(c => c.id === player.equippedCharacter)!;
  const board = HOVERBOARDS.find(b => b.id === player.equippedHoverboard);
  const trail = COSMETICS.find(c => c.id === player.equippedTrail);
  const lvl = levelFromXP(player.xp);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 99999, pointerEvents: "auto" }} className="bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden flex flex-col">
      <ScreenHeader title="Profile" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Profile header */}
        <GlassPanel className="p-5 mb-3 text-center">
          <div className="flex justify-center mb-3">
            <div className="relative">
              <div className="absolute inset-0 blur-2xl opacity-30 rounded-full" style={{ background: char.colors.accent }} />
              <CharacterAvatar character={char} size={100} />
            </div>
          </div>
          <h2 className="font-display font-black text-2xl text-white">Runner</h2>
          <div className="mt-1 inline-flex items-center gap-2 glass-light rounded-full px-4 py-1">
            <span className="text-xs font-display font-bold text-cyan-300">LV {lvl.level}</span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs font-display text-green-300">{getLevelTitle(lvl.level)}</span>
          </div>
          <div className="mt-3">
            <ProgressBar value={lvl.current} max={lvl.needed} color="cyan" />
            <div className="text-[10px] text-slate-400 mt-1 font-display">{lvl.current} / {lvl.needed} XP</div>
          </div>
        </GlassPanel>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <StatChip icon={<span className="text-lg">🏆</span>} label="High Score" value={player.highScore.toLocaleString()} color="yellow" />
          <StatChip icon={<span className="text-lg">📏</span>} label="Best Distance" value={`${player.bestDistance}m`} color="cyan" />
          <StatChip icon={<span className="text-lg">💰</span>} label="Total Coins" value={player.totalCoins.toLocaleString()} color="yellow" />
          <StatChip icon={<span className="text-lg">🏃</span>} label="Total Runs" value={player.totalRuns} color="green" />
          <StatChip icon={<span className="text-lg">📊</span>} label="Total Distance" value={`${player.totalDistance}m`} color="cyan" />
          <StatChip icon={<span className="text-lg">🔥</span>} label="Max Combo" value={`x${player.maxCombo}`} color="pink" />
          <StatChip icon={<span className="text-lg">⚡</span>} label="Max Speed" value={player.maxSpeed} color="yellow" />
          <StatChip icon={<span className="text-lg">💎</span>} label="Power-ups" value={player.powerupsUsed} color="purple" />
          <StatChip icon={<span className="text-lg">🦘</span>} label="Jumps" value={player.jumps} color="cyan" />
          <StatChip icon={<span className="text-lg">↔️</span>} label="Dodges" value={player.dodges} color="green" />
          <StatChip icon={<span className="text-lg">🎯</span>} label="Near Misses" value={player.nearMisses} color="pink" />
        </div>

        {/* Loadout */}
        <GlassPanel className="p-4 mb-3">
          <h3 className="font-display font-bold text-cyan-300 text-sm uppercase tracking-wider mb-3">Loadout</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Character</span>
              <span className="text-sm font-display font-bold text-white">{char.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Hoverboard</span>
              <span className="text-sm font-display font-bold text-white">{board?.name || 'None'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Trail</span>
              <span className="text-sm font-display font-bold text-white">{trail?.name || 'None'}</span>
            </div>
          </div>
        </GlassPanel>

        {/* Collection */}
        <GlassPanel className="p-4">
          <h3 className="font-display font-bold text-cyan-300 text-sm uppercase tracking-wider mb-3">Collection</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="font-display font-black text-2xl neon-text-cyan">{player.unlockedCharacters.length}</div>
              <div className="text-[10px] text-slate-400 font-display uppercase">Characters</div>
            </div>
            <div className="text-center">
              <div className="font-display font-black text-2xl neon-text-yellow">{player.unlockedCosmetics.length}</div>
              <div className="text-[10px] text-slate-400 font-display uppercase">Cosmetics</div>
            </div>
            <div className="text-center">
              <div className="font-display font-black text-2xl neon-text-pink">{player.unlockedHoverboards.length}</div>
              <div className="text-[10px] text-slate-400 font-display uppercase">Boards</div>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
