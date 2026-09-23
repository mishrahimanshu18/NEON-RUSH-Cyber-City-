import { useState, useEffect } from 'react';
import { ScreenHeader, GlassPanel, NeonButton, CharacterAvatar } from './ui';
import { CHARACTERS, COUNTRY_FLAGS, levelFromXP } from '@/game/data';
import type { PlayerState, LeaderboardEntry, CharacterId } from '@/game/types';
import { sfx } from '@/game/audio';

interface LeaderboardScreenProps {
  player: PlayerState;
  onBack: () => void;
  entries: LeaderboardEntry[];
}

const TABS = [
  { id: 'global', label: 'Global' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'friends', label: 'Friends' },
];

export function LeaderboardScreen({ player, onBack, entries }: LeaderboardScreenProps) {
  const [tab, setTab] = useState('global');
  const char = CHARACTERS.find(c => c.id === player.equippedCharacter)!;
  const lvl = levelFromXP(player.xp);

  const displayEntries = entries.length > 0 ? entries : generateMockEntries();

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden flex flex-col">
      <ScreenHeader title="Leaderboard" onBack={onBack} />

      <div className="px-4 pb-2">
        <div className="flex gap-2">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { sfx.button(); setTab(t.id); }}
              className={`flex-1 px-3 py-2 rounded-xl text-xs font-display font-bold uppercase btn-press transition-all ${
                tab === t.id ? 'glass border-cyan-400/50 text-cyan-300' : 'glass-light text-slate-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Your rank */}
        <div className="glass rounded-2xl p-3 mb-3 border-cyan-400/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center font-display font-black text-cyan-300">
              ?
            </div>
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              <CharacterAvatar character={char} size={40} animated={false} />
            </div>
            <div className="flex-1">
              <div className="font-display font-bold text-cyan-300 text-sm">YOU</div>
              <div className="text-xs text-slate-400">LV {lvl.level} • {player.highScore.toLocaleString()} pts</div>
            </div>
            <div className="text-right">
              <div className="font-display font-black text-lg neon-text-yellow">{player.highScore.toLocaleString()}</div>
              <div className="text-[10px] text-slate-500">{player.bestDistance}m</div>
            </div>
          </div>
        </div>

        {/* Top 3 */}
        <div className="flex items-end justify-center gap-2 mb-4">
          {displayEntries.slice(0, 3).map((entry, i) => {
            const char = CHARACTERS.find(c => c.id === entry.character) || CHARACTERS[0];
            const heights = ['h-20', 'h-24', 'h-16'];
            const colors = ['text-yellow-400', 'text-cyan-300', 'text-orange-400'];
            const bgColors = ['from-yellow-500/20 to-yellow-600/10', 'from-cyan-500/20 to-cyan-600/10', 'from-orange-500/20 to-orange-600/10'];
            return (
              <div key={entry.id} className={`flex flex-col items-center ${i === 0 ? 'order-2' : i === 1 ? 'order-1' : 'order-3'}`}>
                <div className="text-2xl mb-1">{['👑', '🥈', '🥉'][i]}</div>
                <div className={`glass rounded-2xl p-2 w-20 ${heights[i]} flex flex-col items-center justify-center bg-gradient-to-b ${bgColors[i]}`}>
                  <div className="w-10 h-10 rounded-lg overflow-hidden mb-1">
                    <CharacterAvatar character={char} size={40} animated={false} />
                  </div>
                  <div className={`font-display font-black ${colors[i]} text-sm`}>{entry.score.toLocaleString()}</div>
                </div>
                <div className="text-xs font-display text-slate-300 mt-1 truncate max-w-[80px]">{entry.username}</div>
              </div>
            );
          })}
        </div>

        {/* Rest of leaderboard */}
        <div className="space-y-2">
          {displayEntries.slice(3).map((entry, i) => {
            const char = CHARACTERS.find(c => c.id === entry.character) || CHARACTERS[0];
            const rank = i + 4;
            const flag = COUNTRY_FLAGS[entry.country] || '🏳';
            return (
              <div key={entry.id} className="glass-light rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 text-center font-display font-bold text-slate-400">{rank}</div>
                <div className="w-8 h-8 rounded-lg overflow-hidden">
                  <CharacterAvatar character={char} size={32} animated={false} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm">{flag}</span>
                    <span className="font-display font-bold text-white text-sm truncate">{entry.username}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">LV {entry.level} • {entry.distance}m</div>
                </div>
                <div className="font-display font-bold text-cyan-300 text-sm">{entry.score.toLocaleString()}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function generateMockEntries(): LeaderboardEntry[] {
  const names = ['CyberRunner', 'NeonGhost', 'VoidWalker', 'PixelDash', 'SynthWave', 'ChromeKid', 'GlitchMaster', 'BinaryBoss', 'HoloRunner', 'DataStream', 'NightCity', 'FutureFreak', 'ElectroPulse', 'QuantumLeap', 'CyberPunk'];
  const countries = ['JP', 'US', 'DE', 'BR', 'KR', 'UK', 'FR', 'CA', 'AU', 'IN'];
  const chars: CharacterId[] = ['kai', 'nova', 'blaze', 'shadow', 'cyber_ninja'];
  return names.map((name, i) => ({
    id: `bot_${i}`,
    username: name,
    score: Math.floor(500000 - i * 25000 + Math.random() * 10000),
    distance: Math.floor(15000 - i * 600 + Math.random() * 500),
    country: countries[Math.floor(Math.random() * countries.length)],
    character: chars[Math.floor(Math.random() * chars.length)],
    level: 10 + Math.floor(Math.random() * 40),
    createdAt: new Date().toISOString(),
  })).sort((a, b) => b.score - a.score);
}
