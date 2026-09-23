import { ScreenHeader, GlassPanel, ProgressBar } from './ui';
import { ACHIEVEMENTS } from '@/game/data';
import type { PlayerState } from '@/game/types';

interface AchievementsScreenProps {
  player: PlayerState;
  onBack: () => void;
}

export function AchievementsScreen({
  player,
  onBack,
}: AchievementsScreenProps) {
  const metricMap: Record<string, number> = {
    totalScore: player.totalScore,
    totalCoins: player.totalCoins,
    totalDistance: player.totalDistance,
    runs: player.totalRuns,
    maxCombo: player.maxCombo,
    maxSpeed: player.maxSpeed,
    powerups: player.powerupsUsed,
    perfectRun: player.lastRun?.perfectRun ? 1 : 0,
  };

  const unlockedCount = player.achievements.length;
  const total = ACHIEVEMENTS.length;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden flex flex-col">
      <ScreenHeader
        title="Achievements"
        onBack={onBack}
      />

      <div className="px-4 pb-3">
        <GlassPanel className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-display font-bold text-cyan-300 text-sm">
              Progress
            </span>

            <span className="font-display font-bold text-white">
              {unlockedCount}/{total}
            </span>
          </div>

          <ProgressBar
            value={unlockedCount}
            max={total}
            color="yellow"
          />
        </GlassPanel>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {ACHIEVEMENTS.map((ach) => {
          const isUnlocked =
            player.achievements.includes(ach.id);

          const current =
            metricMap[ach.metric] || 0;

          const pct = Math.min(
            100,
            (current / ach.target) * 100
          );

          return (
            <div
              key={ach.id}
              className={`glass rounded-2xl p-4 ${
                isUnlocked
                  ? 'border-yellow-400/30'
                  : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                    isUnlocked
                      ? 'bg-yellow-500/20 border border-yellow-500/50'
                      : 'bg-slate-800/50 border border-slate-700'
                  }`}
                >
                  {isUnlocked ? ach.icon : '🔒'}
                </div>

                <div className="flex-1">
                  <h3
                    className={`font-display font-bold text-sm ${
                      isUnlocked
                        ? 'text-yellow-300'
                        : 'text-white'
                    }`}
                  >
                    {ach.name}
                  </h3>

                  <p className="text-xs text-slate-400 mt-0.5">
                    {ach.description}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-yellow-300 font-display">
                      {ach.reward.coins} coins
                    </span>

                    <span className="text-xs text-cyan-300 font-display">
                      {ach.reward.xp} XP
                    </span>
                  </div>
                </div>

                {isUnlocked ? (
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ffdd00"
                      strokeWidth="3"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                ) : (
                  <div className="text-right">
                    <div className="text-xs font-display text-slate-400">
                      {current.toLocaleString()}/
                      {ach.target.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {!isUnlocked && (
                <ProgressBar
                  value={current}
                  max={ach.target}
                  color="yellow"
                  className="mt-3"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
