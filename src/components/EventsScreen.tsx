import { ScreenHeader, GlassPanel, NeonButton } from './ui';
import { EVENTS, RARITY_COLORS } from '@/game/data';
import type { PlayerState } from '@/game/types';
import { sfx } from '@/game/audio';

interface EventsScreenProps {
  player: PlayerState;
  onBack: () => void;
}

export function EventsScreen({ player, onBack }: EventsScreenProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden flex flex-col">
      <ScreenHeader title="Events" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        <p className="text-sm text-slate-400 text-center py-2">Limited-time events with exclusive rewards!</p>

        {EVENTS.map(event => {
          const rc = RARITY_COLORS.legendary;
          return (
            <div
              key={event.id}
              className="glass rounded-2xl p-4 relative overflow-hidden"
              style={{ borderColor: event.color + '44' }}
            >
              {/* Background glow */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20" style={{ background: event.color }} />

              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: event.active ? event.color : '#444' }} />
                    <h3 className="font-display font-black text-lg" style={{ color: event.color }}>{event.name}</h3>
                  </div>
                  <span className={`text-xs font-display font-bold px-2 py-1 rounded-md ${event.active ? 'text-green-400 bg-green-500/10' : 'text-slate-500 bg-slate-500/10'}`}>
                    {event.active ? 'LIVE' : 'SOON'}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mb-3">{event.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-display">Reward:</span>
                    <span className="text-xs font-display font-bold" style={{ color: event.glow }}>{event.reward}</span>
                  </div>
                  {event.active && (
                    <NeonButton
                      variant="primary"
                      size="sm"
                      onClick={() => { sfx.buttonBig(); onBack(); }}
                    >
                      JOIN
                    </NeonButton>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
