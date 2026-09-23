import { useState } from 'react';
import { ScreenHeader, GlassPanel, ProgressBar, NeonButton } from './ui';
import { DAILY_MISSIONS, WEEKLY_MISSIONS, STORY_MISSIONS, WORLDS } from '@/game/data';
import type { PlayerState } from '@/game/types';
import { sfx } from '@/game/audio';

interface MissionsScreenProps {
  player: PlayerState;
  onBack: () => void;
}

export function MissionsScreen({ player, onBack }: MissionsScreenProps) {
  const [tab, setTab] = useState<'daily' | 'weekly' | 'story'>('daily');

  const missions = tab === 'daily' ? DAILY_MISSIONS : tab === 'weekly' ? WEEKLY_MISSIONS : STORY_MISSIONS;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden flex flex-col">
      <ScreenHeader title="Missions" onBack={onBack} />

      <div className="px-4 pb-2">
        <div className="flex gap-2">
          {(['daily', 'weekly', 'story'] as const).map(t => (
            <button
              key={t}
              onClick={() => { sfx.button(); setTab(t); }}
              className={`flex-1 px-3 py-2 rounded-xl text-xs font-display font-bold uppercase btn-press transition-all ${
                tab === t ? 'glass border-cyan-400/50 text-cyan-300' : 'glass-light text-slate-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {tab === 'story' && (
          <div className="glass rounded-2xl p-4 mb-3">
            <p className="text-sm text-slate-300">
              The city is controlled by a rogue AI called <span className="neon-text-pink font-bold">NEXUS</span>. Kai must travel through different districts to collect encrypted energy cores and stop NEXUS.
            </p>
          </div>
        )}
        {missions.map(mission => {
          const progress = player.missionProgress[mission.id] || 0;
          const completed = player.completedMissions.includes(mission.id);
          const pct = Math.min(100, (progress / mission.target) * 100);
          const world = mission.worldId ? WORLDS.find(w => w.id === mission.worldId) : null;

          return (
            <div key={mission.id} className={`glass rounded-2xl p-4 ${completed ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-display font-bold text-white text-sm">{mission.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{mission.description}</p>
                  {world && (
                    <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-display text-cyan-400">
                      <span className="w-2 h-2 rounded-full" style={{ background: world.accentColor }} />
                      {world.name}
                    </div>
                  )}
                </div>
                {completed ? (
                  <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                  </div>
                ) : (
                  <div className="text-right">
                    <div className="text-xs font-display font-bold text-cyan-300">{progress.toLocaleString()}/{mission.target.toLocaleString()}</div>
                  </div>
                )}
              </div>
              <ProgressBar value={progress} max={mission.target} color={completed ? 'green' : 'cyan'} className="mt-2" />
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-yellow-300 font-display font-bold">${mission.reward.coins}</span>
                <span className="text-xs text-cyan-300 font-display font-bold">{mission.reward.xp} XP</span>
                {completed && <span className="text-xs text-green-400 font-display font-bold ml-auto">CLAIMED</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
