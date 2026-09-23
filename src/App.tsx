import { useCallback, useEffect, useRef, useState } from 'react';
import { NeonRush3D } from './game/three/NeonRush3D';
import HomeScreen from './components/home/HomeScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { useGameStore, loadPlayer } from './game/store';
import { DAILY_REWARDS, DAILY_MISSIONS, WEEKLY_MISSIONS, STORY_MISSIONS, ACHIEVEMENTS, levelFromXP, getLevelTitle } from './game/data';
import { startMusic, stopMusic } from './game/audio';

type Result = {
  score: number;
  coins: number;
  distance: number;
  combo: number;
  xp: number;
  jumps: number;
  dodges: number;
  powerups: number;
  nearMisses: number;
  maxSpeed: number;
  missionsCompleted: string[];
};

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<NeonRush3D | null>(null);
  const { player, completeRun, claimDailyReward, canClaimDaily, consumeEnergy } = useGameStore();
  const [showProfile, setShowProfile] = useState(false);

  const [gameOver, setGameOver] = useState(false);
  const [showHome, setShowHome] = useState(true);

  const [result, setResult] = useState<Result>({
    score: 0,
    coins: 0,
    distance: 0,
    combo: 0,
    xp: 0,
    jumps: 0,
    dodges: 0,
    powerups: 0,
    nearMisses: 0,
    maxSpeed: 0,
    missionsCompleted: [],
  });

  const [speed, setSpeed] = useState(18);
  const [level, setLevel] = useState(1);
  const [levelUp, setLevelUp] = useState(false);
  const [notification, setNotification] = useState<{
    title: string;
    message: string;
    icon: string;
    accent: string;
  } | null>(null);
  const [notificationQueue, setNotificationQueue] = useState<Array<{ title: string; message: string; icon: string; accent: string }>>([]);

  const showNotification = useCallback(
    (title: string, message: string, icon = '◈', accent = '#00d4ff') => {
      setNotificationQueue((queue) => [
        ...queue,
        { title, message, icon, accent },
      ]);
    },
    [],
  );

  useEffect(() => {
    if (notification || notificationQueue.length === 0) return;

    const [next, ...remaining] = notificationQueue;
    setNotification(next);
    setNotificationQueue(remaining);

    const timer = window.setTimeout(() => {
      setNotification(null);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [notification, notificationQueue]);
  const [combo, setCombo] = useState(0);
  const [powerUp, setPowerUp] = useState<string | null>(null);
  const [powerUpTime, setPowerUpTime] = useState(0);
  const [achievement, setAchievement] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());

  const unlockAchievement = useCallback(
    (id: string, title: string) => {
      setUnlocked((previous) => {
        if (previous.has(id)) return previous;

        const next = new Set(previous);
        next.add(id);
        return next;
      });

      setAchievement(title);

      window.setTimeout(() => {
        setAchievement((current) =>
          current === title ? null : current,
        );
      }, 3000);
    },
    [],
  );

  const startGame = useCallback(() => {
  const currentPlayer = loadPlayer();
    setShowHome(false);

    if (currentPlayer.settings.music) {
      startMusic();
    }
    if (!canvasRef.current) return;

    setGameOver(false);

    setResult({
      score: 0,
      coins: 0,
      distance: 0,
      combo: 0,
      xp: 0,
      jumps: 0,
      dodges: 0,
      powerups: 0,
      nearMisses: 0,
      maxSpeed: 0,
      missionsCompleted: [],
    });

    setSpeed(18);
    setLevel(1);
    setCombo(0);
    setPowerUp(null);
    setPowerUpTime(0);
    setAchievement(null);

    gameRef.current?.destroy();

    const game = new NeonRush3D(
      canvasRef.current,
      {
        onScore: (score) => {
          setResult((previous) => ({
            ...previous,
            score,
          }));

          if (score >= 1000) {
            unlockAchievement(
              'score-1000',
              'SCORE HUNTER',
            );
          }
        },

        onCoins: (coins) => {
          setResult((previous) => ({
            ...previous,
            coins,
          }));

          if (coins >= 100) {
            unlockAchievement(
              'coins-100',
              'COIN COLLECTOR',
            );
          }
        },

        onCombo: (value) => {
          setCombo(value);

          if (value >= 5) {
            unlockAchievement(
              'combo-5',
              'COMBO MASTER',
            );
          }

          if (value >= 10) {
            unlockAchievement(
              'combo-10',
              'NEON LEGEND',
            );
          }
        },

        onDistanceChange: (distance) => {
          setResult((previous) => ({
            ...previous,
            distance,
          }));
        },

        onSpeedChange: (value) => {
          setSpeed(value);
        },

        onPowerUpStatus: (type, time) => {
          setPowerUp(type);
          setPowerUpTime(time);
        },

        onGameOver: (data) => {
          
          const previousLevel = player.level;
          const projectedXP = player.xp + data.xp;
          const projectedLevel = levelFromXP(projectedXP).level;

          stopMusic();
completeRun(data);
          setResult({
            score: data.score,
            coins: data.coins,
            distance: data.distance,
            combo: data.combo,
            xp: data.xp,
            jumps: data.jumps,
            dodges: data.dodges,
            powerups: data.powerups,
            nearMisses: data.nearMisses,
            maxSpeed: data.maxSpeed,
            missionsCompleted: data.missionsCompleted || [],
          });

          if (projectedLevel > previousLevel) {


            setLevel(projectedLevel);


            setLevelUp(true);
            showNotification('LEVEL UP!', 'Level ' + projectedLevel + ' — ' + getLevelTitle(projectedLevel), '⚡', '#00d4ff');


          } else {


            setLevelUp(false);


          }

          if (data.missionsCompleted?.length) {
            showNotification(
              'MISSION COMPLETE',
              'Mission completed: ' + data.missionsCompleted.length,
              '🎯',
              '#22c55e',
            );
          }

          if (data.achievementsCompleted?.length) {
            showNotification(
              'ACHIEVEMENT UNLOCKED',
              'Achievement unlocked: ' + data.achievementsCompleted.length,
              '🏆',
              '#facc15',
            );
          }

          setGameOver(true);
        },
      },
      {
        accentColor: '#00d4ff',
        worldId: currentPlayer.activeWorld,
        graphics: currentPlayer.settings.graphics,
        reducedEffects: currentPlayer.settings.reducedEffects,
        sensitivity: currentPlayer.settings.sensitivity,
        haptics: currentPlayer.settings.haptics,
      },
    );

    gameRef.current = game;
    game.start();
  }, [unlockAchievement, completeRun, consumeEnergy]);

  useEffect(() => {
    return () => {
      
      stopMusic();
gameRef.current?.destroy();
      gameRef.current = null;
    };
  }, []);

  return (
    <main
      style={{
        inset: 0,
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        background: '#020617',
      }}
    >
        {showProfile && (
          <ProfileScreen
            player={player}
            onBack={() => { setShowProfile(false); setShowHome(true); }}
          />
        )}

      {showHome && !showProfile && (
        <HomeScreen
          player={player}
          coins={player.coins}
          level={player.level}
          score={player.highScore}
          onPlay={startGame}
          canClaimReward={canClaimDaily()}
    onDailyReward={() => {
  if (!canClaimDaily()) return;

  const nextDay = player.dailyRewardDay >= 7
    ? 1
    : player.dailyRewardDay + 1;

  const reward = DAILY_REWARDS.find(item => item.day === nextDay);
  if (!reward) return;

  claimDailyReward(nextDay, {
    coins: reward.type === 'coins' ? reward.amount : 0,
    energy: reward.type === 'energy' ? reward.amount : 0,
    mysterybox: reward.type === 'mysterybox',
  });
}}
          onProfile={() => setShowProfile(true)}
        />
      )}

      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />

      {/* GAME TITLE */}
      <div
        style={{
          position: 'absolute',
          top: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          textAlign: 'center',
          pointerEvents: 'none',
          color: '#67e8f9',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 26,
            fontWeight: 900,
            letterSpacing: '0.35em',
            textShadow:
              '0 0 18px rgba(0, 220, 255, 0.8)',
          }}
        >
          NEON RUSH
        </div>

        <div
          style={{
            marginTop: 5,
            fontSize: 11,
            letterSpacing: '0.3em',
            color: 'rgba(255,255,255,0.55)',
          }}
        >
          CYBER CITY
        </div>
      </div>

      {notification && !showProfile && (
        <div
          style={{
            position: 'absolute',
            top: 76,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            minWidth: 'min(340px, 82vw)',
            maxWidth: 'min(420px, 90vw)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderRadius: 16,
            border: '1px solid ' + notification.accent + '88',
            background: 'rgba(3, 10, 25, 0.92)',
            backdropFilter: 'blur(18px)',
            boxShadow:
              '0 0 28px ' +
              notification.accent +
              '35, inset 0 0 18px ' +
              notification.accent +
              '08',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              background: notification.accent + '18',
              border: '1px solid ' + notification.accent + '55',
              color: notification.accent,
              fontSize: 20,
              fontWeight: 900,
              boxShadow: '0 0 16px ' + notification.accent + '25',
            }}
          >
            {notification.icon}
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 900,
                color: notification.accent,
                letterSpacing: '0.18em',
              }}
            >
              {notification.title.toUpperCase()}
            </div>

            <div
              style={{
                marginTop: 3,
                fontSize: 12,
                color: 'rgba(255,255,255,0.78)',
                letterSpacing: '0.04em',
              }}
            >
              {notification.message}
            </div>
          </div>
        </div>
      )}
      {/* HUD */}
      {!gameOver && !showProfile && (
        <div
          style={{
            position: 'absolute',
            top: 82,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            justifyContent: 'center',
            width: 'min(95vw, 720px)',
            fontFamily: 'Arial, sans-serif',
            pointerEvents: 'none',
          }}
        >
          <HudStat
            label="SCORE"
            value={result.score}
          />

          <HudStat
            label="COINS"
            value={result.coins}
            highlight
          />

          <HudStat
            label="DISTANCE"
            value={`${Math.floor(result.distance)}m`}
          />

          <HudStat
            label="SPEED"
            value={`${Math.round(speed)} KM/H`}
          />

          <HudStat
            label="COMBO"
            value={`x${combo}`}
            highlight={combo >= 2}
          />
        </div>
      )}

      {/* POWER UP */}
      {powerUp && !gameOver && !showProfile && (
        <div
          style={{
            position: 'absolute',
            top: 225,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 11,
            padding: '10px 18px',
            borderRadius: 20,
            border:
              '1px solid rgba(250,204,21,0.7)',
            background:
              'rgba(3,15,35,0.82)',
            color: '#facc15',
            fontFamily: 'Arial, sans-serif',
            fontSize: 13,
            fontWeight: 900,
            letterSpacing: '0.08em',
            boxShadow:
              '0 0 22px rgba(250,204,21,0.2)',
            pointerEvents: 'none',
          }}
        >
          POWER-UP: {powerUp} {powerUpTime > 0
            ? `${powerUpTime.toFixed(1)}s`
            : ''}
        </div>
      )}

      {/* ACHIEVEMENT */}
      {achievement && !gameOver && !showProfile && (
        <div
          style={{
            position: 'absolute',
            top: 275,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 12,
            padding: '10px 18px',
            borderRadius: 16,
            border:
              '1px solid rgba(250,204,21,0.65)',
            background:
              'rgba(20,15,3,0.88)',
            color: '#fde68a',
            fontFamily: 'Arial, sans-serif',
            fontSize: 13,
            fontWeight: 900,
            letterSpacing: '0.08em',
            boxShadow:
              '0 0 25px rgba(250,204,21,0.2)',
            pointerEvents: 'none',
          }}
        >
          🏆 {achievement}
        </div>
      )}

      {/* GAME OVER */}
      {gameOver && !showProfile && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background:
              'linear-gradient(180deg, rgba(2,6,23,0.45), rgba(2,6,23,0.92))',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <div
            style={{
              width: 'min(420px, 88vw)',
              padding: '32px 24px',
              border:
                '1px solid rgba(34,211,238,0.55)',
              borderRadius: 24,
              background: 'rgba(5,15,35,0.88)',
              backdropFilter: 'blur(18px)',
              boxShadow:
                '0 0 45px rgba(0,212,255,0.18), inset 0 0 30px rgba(0,212,255,0.05)',
              textAlign: 'center',
              color: 'white',
            }}
          >
            <div
              style={{
                fontSize: 38,
                fontWeight: 900,
                color: '#67e8f9',
                letterSpacing: '0.12em',
                textShadow:
                  '0 0 25px rgba(0,212,255,0.8)',
              }}
            >
              GAME OVER
            </div>

            <div
              style={{
                marginTop: 8,
                color: 'rgba(255,255,255,0.55)',
                fontSize: 12,
                letterSpacing: '0.22em',
              }}
            >
              RUN TERMINATED
            </div>

            {levelUp && (
              <div
                style={{
                  marginTop: 20,
                  padding: '16px',
                  borderRadius: 18,
                  border: '1px solid rgba(34,211,238,0.75)',
                  background:
                    'linear-gradient(135deg, rgba(0,212,255,0.16), rgba(37,99,235,0.08))',
                  boxShadow:
                    '0 0 35px rgba(0,212,255,0.28), inset 0 0 22px rgba(0,212,255,0.06)',
                  animation: 'levelUpPulse 1.2s ease-in-out infinite alternate',
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 900,
                    color: '#67e8f9',
                    letterSpacing: '0.3em',
                    textShadow:
                      '0 0 18px rgba(0,212,255,0.9)',
                  }}
                >
                  ⚡ LEVEL UP!
                </div>

                <div
                  style={{
                    marginTop: 5,
                    fontSize: 34,
                    fontWeight: 900,
                    color: '#ffffff',
                    letterSpacing: '0.08em',
                    textShadow:
                      '0 0 22px rgba(0,212,255,0.8)',
                  }}
                >
                  LEVEL {level}
                </div>

                <div
                  style={{
                    marginTop: 3,
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#a5f3fc',
                    letterSpacing: '0.2em',
                  }}
                >
                  {getLevelTitle(level).toUpperCase()}
                </div>
              </div>
            )}
            {levelFromXP(player.xp).level > 1 && (
              <div style={{
                marginTop: 20,
                padding: '14px 16px',
                borderRadius: 16,
                border: '1px solid rgba(250,204,21,0.55)',
                background: 'linear-gradient(135deg, rgba(250,204,21,0.12), rgba(245,158,11,0.04))',
                boxShadow: '0 0 28px rgba(250,204,21,0.18)',
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: 11,
                  fontWeight: 900,
                  color: '#facc15',
                  letterSpacing: '0.24em',
                }}>
                  ⚡ LEVEL STATUS
                </div>

                <div style={{
                  marginTop: 5,
                  fontSize: 28,
                  fontWeight: 900,
                  color: '#fef08a',
                  letterSpacing: '0.08em',
                }}>
                  LEVEL {player.level}
                </div>

                <div style={{
                  marginTop: 2,
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.6)',
                  letterSpacing: '0.18em',
                }}>
                  {getLevelTitle(player.level).toUpperCase()}
                </div>
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(3, 1fr)',
                gap: 10,
                marginTop: 28,
              }}
            >
              <Stat
                label="SCORE"
                value={result.score}
              />

              <Stat
                label="COINS"
                value={result.coins}
              />

              <Stat
                label="DISTANCE"
                value={`${Math.floor(
                  result.distance,
                )}m`}
              />
            </div>

            <button
              onClick={startGame}
              style={{
                width: '100%',
                marginTop: 28,
                padding: '15px 20px',
                border: 'none',
                borderRadius: 14,
                background:
                  'linear-gradient(90deg, #06b6d4, #2563eb)',
                color: 'white',
                fontSize: 16,
                fontWeight: 900,
                letterSpacing: '0.12em',
                cursor: 'pointer',
                boxShadow:
                  '0 0 25px rgba(0,212,255,0.35)',
              }}
            >
              ↻ RESTART RUN
            </button>

            <button
              onClick={() =>
                window.location.reload()
              }
              style={{
                width: '100%',
                marginTop: 10,
                padding: '13px 20px',
                border:
                  '1px solid rgba(255,255,255,0.18)',
                borderRadius: 14,
                background:
                  'rgba(255,255,255,0.05)',
                color:
                  'rgba(255,255,255,0.75)',
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: '0.1em',
                cursor: 'pointer',
              }}
            >
              ⌂ QUIT
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function HudStat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        minWidth: 72,
        padding: '8px 12px',
        borderRadius: 12,
        background: 'rgba(3, 15, 35, 0.78)',
        border: `1px solid ${
          highlight
            ? 'rgba(250,204,21,0.7)'
            : 'rgba(34,211,238,0.35)'
        }`,
        boxShadow: highlight
          ? '0 0 18px rgba(250,204,21,0.25)'
          : '0 0 14px rgba(0,212,255,0.12)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: 8,
          color: 'rgba(255,255,255,0.5)',
          letterSpacing: '0.12em',
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 3,
          fontSize: 17,
          fontWeight: 900,
          color: highlight
            ? '#facc15'
            : '#e0f2fe',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div
      style={{
        padding: '14px 6px',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.045)',
        border:
          '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: 'rgba(255,255,255,0.45)',
          letterSpacing: '0.12em',
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 6,
          fontSize: 20,
          fontWeight: 900,
          color: '#e0f2fe',
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default App;











































