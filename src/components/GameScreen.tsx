import { useCallback, useEffect, useRef, useState } from 'react';
import type { CharacterDef, RunResult, WorldDef } from '@/game/types';
import { sfx, haptic, startMusic, stopMusic, setMusicIntensity } from '@/game/audio';
import { NeonButton } from './ui';
import { NeonRush3D } from '@/game/three/NeonRush3D';

interface GameScreenProps {
  world: WorldDef;
  character: CharacterDef;
  trailColor: string;
  settings: {
    graphics: 'low' | 'medium' | 'high';
    reducedEffects: boolean;
    sensitivity: number;
    haptics: boolean;
    sound: boolean;
    music: boolean;
  };
  onGameOver: (result: RunResult) => void;
  onExit: () => void;
  worldId: string;
}

export function GameScreen({
  world,
  character,
  trailColor,
  settings,
  onGameOver,
  onExit,
  worldId,
}: GameScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<NeonRush3D | null>(null);

  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [distance, setDistance] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboLabel, setComboLabel] = useState('');
  const [speed, setSpeed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const comboTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (settings.music) {
      startMusic();
    }

    return () => {
      stopMusic();
    };
  }, [settings.music]);

  useEffect(() => {
    let count = 3;

    setCountdown(3);
    sfx.countdown();

    const interval = window.setInterval(() => {
      count -= 1;
      setCountdown(count);

      if (count > 0) {
        sfx.countdown();
        return;
      }

      window.clearInterval(interval);
      sfx.countdownGo();
      setStarted(true);

      if (!canvasRef.current) return;

      const engine = new NeonRush3D(
        canvasRef.current,
        {
          onScore: setScore,
          onCoins: setCoins,
          onCombo: (value, label) => {
            setCombo(value);
            setComboLabel(label);

            sfx.combo(value);

            if (settings.haptics) {
              haptic(30);
            }

            if (comboTimeoutRef.current) {
              window.clearTimeout(comboTimeoutRef.current);
            }

            comboTimeoutRef.current = window.setTimeout(() => {
              setComboLabel('');
            }, 1100);
          },
          onGameOver: result => {
            sfx.gameOver();

            if (settings.haptics) {
              haptic([100, 50, 100, 50, 200]);
            }

            stopMusic();
            setGameOver(true);

            const finalResult = {
              score: result.score,
              coins: result.coins,
              distance: result.distance,
              worldId,
              missionsCompleted: [],
            } as unknown as RunResult;

            onGameOver(finalResult);
          },
          onSpeedChange: value => {
            setSpeed(value);
            setMusicIntensity(value);
          },
          onDistanceChange: setDistance,
        },
        {
          accentColor: trailColor || '#00d9ff',
          worldId,
          graphics: settings.graphics,
          reducedEffects: settings.reducedEffects,
          sensitivity: settings.sensitivity,
        },
      );

      engineRef.current = engine;
      engine.start();
    }, 800);

    return () => {
      window.clearInterval(interval);

      if (comboTimeoutRef.current) {
        window.clearTimeout(comboTimeoutRef.current);
      }

      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []);

  const handlePause = useCallback(() => {
    sfx.button();
    setPaused(true);
    engineRef.current?.pause();
  }, []);

  const handleResume = useCallback(() => {
    sfx.button();
    setPaused(false);
    engineRef.current?.resume();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && started && !paused && !gameOver) {
        setPaused(true);
        engineRef.current?.pause();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [started, paused, gameOver]);

  const handleQuit = useCallback(() => {
    sfx.button();
    engineRef.current?.destroy();
    engineRef.current = null;
    onExit();
  }, [onExit]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ touchAction: 'none' }}
      />

      <div className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 text-center">
        <div className="font-display text-xs font-bold tracking-[0.45em] text-cyan-300/80">
          {String(world?.name ?? 'NEON CITY').toUpperCase()}
        </div>
        <div className="mt-1 text-[9px] tracking-[0.35em] text-white/40">
          {String(character?.name ?? 'KAI').toUpperCase()} • 3D RUN
        </div>
      </div>

      {started && !paused && !gameOver && (
        <>
          <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 px-3 pt-14">
            <div className="mx-auto flex max-w-2xl items-start justify-between gap-2">
              <div className="glass rounded-xl px-3 py-2">
                <div className="text-[9px] uppercase tracking-widest text-slate-400">
                  Score
                </div>
                <div className="font-display text-xl font-black text-cyan-300">
                  {score.toLocaleString()}
                </div>
              </div>

              <button
                type="button"
                onClick={handlePause}
                className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/20 bg-black/50 text-cyan-300 backdrop-blur-md"
                aria-label="Pause game"
              >
                ❚❚
              </button>

              <div className="glass rounded-xl px-3 py-2 text-right">
                <div className="text-[9px] uppercase tracking-widest text-slate-400">
                  Coins
                </div>
                <div className="font-display text-xl font-black text-yellow-300">
                  {coins}
                </div>
              </div>
            </div>

            <div className="mx-auto mt-2 flex max-w-2xl items-center gap-3 rounded-xl border border-cyan-300/10 bg-black/40 px-4 py-2 backdrop-blur-md">
              <div>
                <div className="text-[9px] uppercase tracking-widest text-slate-500">
                  Distance
                </div>
                <div className="font-display text-sm font-bold text-cyan-200">
                  {distance}m
                </div>
              </div>

              <div className="flex-1">
                <div className="mb-1 flex justify-between text-[9px] uppercase tracking-widest text-slate-500">
                  <span>Speed</span>
                  <span>{Math.round(speed * 100)}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-900">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-pink-500 transition-all"
                    style={{ width: `${Math.max(4, speed * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {comboLabel && (
            <div className="pointer-events-none absolute left-1/2 top-1/3 z-10 -translate-x-1/2">
              <div className="font-display text-4xl font-black text-yellow-300 drop-shadow-[0_0_20px_rgba(250,204,21,.7)]">
                {comboLabel}
              </div>
            </div>
          )}

          {combo > 1 && !comboLabel && (
            <div className="pointer-events-none absolute left-1/2 top-1/3 z-10 -translate-x-1/2">
              <div className="font-display text-2xl font-bold text-cyan-300/80">
                x{combo}
              </div>
            </div>
          )}

          {distance < 80 && (
            <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
              <div className="rounded-xl border border-white/10 bg-black/45 px-4 py-2 text-center text-[10px] text-slate-300 backdrop-blur-md">
                ← → MOVE &nbsp; • &nbsp; ↑ JUMP &nbsp; • &nbsp; ↓ SLIDE
              </div>
            </div>
          )}
        </>
      )}

      {!started && !gameOver && countdown > 0 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div
            key={countdown}
            className="font-display text-9xl font-black text-cyan-300 drop-shadow-[0_0_35px_rgba(34,211,238,.8)]"
          >
            {countdown}
          </div>
        </div>
      )}

      {paused && !gameOver && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 p-5 backdrop-blur-md">
          <div className="glass w-full max-w-sm rounded-3xl p-7">
            <h2 className="gradient-text mb-6 text-center font-display text-3xl font-black">
              PAUSED
            </h2>

            <div className="space-y-3">
              <NeonButton
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleResume}
              >
                RESUME
              </NeonButton>

              <NeonButton
                variant="danger"
                size="lg"
                className="w-full"
                onClick={handleQuit}
              >
                QUIT RUN
              </NeonButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

