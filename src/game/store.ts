import { useCallback, useEffect, useState } from 'react';
import type { PlayerState, CharacterId, CosmeticType, WorldId, GameSettings, RunResult } from './types';
import { CHARACTERS, COSMETICS, HOVERBOARDS, WORLDS, DAILY_REWARDS, DAILY_MISSIONS, WEEKLY_MISSIONS, STORY_MISSIONS, ACHIEVEMENTS, levelFromXP } from './data';

const STORAGE_KEY = 'neon_rush_save_v1';

const DEFAULT_SETTINGS: GameSettings = {
  graphics: 'high',
  sound: true,
  music: true,
  musicVolume: 0.7,
  sfxVolume: 0.8,
  haptics: true,
  reducedEffects: false,
  sensitivity: 1,
  leftHanded: false,
  notifications: true,
};

function createDefaultPlayer(): PlayerState {
  return {
    coins: 1000,
    xp: 0,
    level: 1,
    energy: 5,
    maxEnergy: 5,
    lastEnergyTime: Date.now(),
    highScore: 0,
    bestDistance: 0,
    totalCoins: 0,
    totalDistance: 0,
    totalRuns: 0,
    totalScore: 0,
    maxCombo: 0,
    maxSpeed: 0,
    powerupsUsed: 0,
      jumps: 0,
      dodges: 0,
      nearMisses: 0,
    unlockedCharacters: ['kai'],
    unlockedCosmetics: [],
    unlockedHoverboards: [],
    equippedCharacter: 'kai',
    equippedCosmetics: { jacket: null, helmet: null, mask: null, shoes: null, gloves: null, back: null, trail: null, effect: null, hoverboard: null },
    equippedHoverboard: null,
    equippedTrail: null,
    activeWorld: 'neon_city',
    completedMissions: [],
    missionProgress: {},
    achievements: [],
    dailyRewardDay: 0,
    lastDailyClaim: 0,
    mysteryBoxes: { basic: 1, rare: 0, epic: 0, legendary: 0 },
    lastRun: null,
    settings: { ...DEFAULT_SETTINGS },
    onboardingComplete: false,
    storyProgress: 0,
    dailyMissionDate: '',
    weeklyMissionDate: '',
  };
}

function loadPlayer(): PlayerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultPlayer();
    const saved = JSON.parse(raw) as Partial<PlayerState>;
    const def = createDefaultPlayer();
    return {
      ...def,
      ...saved,
      settings: { ...def.settings, ...saved.settings },
      equippedCosmetics: { ...def.equippedCosmetics, ...saved.equippedCosmetics },
      mysteryBoxes: { ...def.mysteryBoxes, ...saved.mysteryBoxes },
    };
  } catch {
    return createDefaultPlayer();
  }
}

function savePlayer(player: PlayerState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
  } catch {
    // ignore
  }
}

function todayStr(): string {
  return new Date().toDateString();
}

function daysBetween(t1: number, t2: number): number {
  return Math.floor((t2 - t1) / (1000 * 60 * 60 * 24));
}

export function useGameStore() {
  const [player, setPlayer] = useState<PlayerState>(loadPlayer);

  useEffect(() => { savePlayer(player); }, [player]);

  const regenerateEnergy = useCallback(() => {
    setPlayer(prev => {
      if (prev.energy >= prev.maxEnergy) return prev;
      const elapsed = Date.now() - prev.lastEnergyTime;
      const regenInterval = 10 * 60 * 1000;
      const regenerated = Math.floor(elapsed / regenInterval);
      if (regenerated <= 0) return prev;
      return {
        ...prev,
        energy: Math.min(prev.maxEnergy, prev.energy + regenerated),
        lastEnergyTime: Date.now(),
      };
    });
  }, []);

  useEffect(() => {
    regenerateEnergy();
    const interval = setInterval(regenerateEnergy, 30000);
    return () => clearInterval(interval);
  }, [regenerateEnergy]);

  const consumeEnergy = useCallback((amount = 1): boolean => {
    let success = false;

    setPlayer(prev => {
      if (prev.energy < amount) return prev;

      const newPlayer: PlayerState = {
        ...prev,
        energy: prev.energy - amount,
        lastEnergyTime:
          prev.energy >= prev.maxEnergy ? Date.now() : prev.lastEnergyTime,
      };

      success = true;
      savePlayer(newPlayer);
      return newPlayer;
    });

    return success;
  }, []);

  const updateSettings = useCallback((partial: Partial<GameSettings>) => {
    setPlayer(prev => ({ ...prev, settings: { ...prev.settings, ...partial } }));
  }, []);

  const equipCharacter = useCallback((id: CharacterId) => {
    setPlayer(prev => {
      if (!prev.unlockedCharacters.includes(id)) return prev;
      return { ...prev, equippedCharacter: id };
    });
  }, []);

  const equipCosmetic = useCallback((type: CosmeticType, id: string | null) => {
    setPlayer(prev => {
      if (id && !prev.unlockedCosmetics.includes(id)) return prev;
      return { ...prev, equippedCosmetics: { ...prev.equippedCosmetics, [type]: id } };
    });
  }, []);

  const setActiveWorld = useCallback((id: WorldId) => {
    setPlayer(prev => {
      const world = WORLDS.find(w => w.id === id);
      if (!world) return prev;
      if (prev.totalDistance < world.unlockDistance) return prev;
      const newPlayer = { ...prev, activeWorld: id };
      savePlayer(newPlayer);
      return newPlayer;
    });
  }, []);

  const equipHoverboard = useCallback((id: string | null) => {
    setPlayer(prev => {
      if (id && !prev.unlockedHoverboards.includes(id)) return prev;
      return { ...prev, equippedHoverboard: id };
    });
  }, []);

  const equipTrail = useCallback((id: string | null) => {
    setPlayer(prev => {
      if (id && !prev.unlockedCosmetics.includes(id)) return prev;
      return { ...prev, equippedTrail: id };
    });
  }, []);

  const buyCharacter = useCallback((id: CharacterId): boolean => {
    const char = CHARACTERS.find(c => c.id === id);
    if (!char) return false;
    let success = false;
    setPlayer(prev => {
      if (prev.unlockedCharacters.includes(id)) return prev;
      if (prev.coins < char.price) return prev;
      success = true;
      return {
        ...prev,
        coins: prev.coins - char.price,
        unlockedCharacters: [...prev.unlockedCharacters, id],
        equippedCharacter: id,
      };
    });
    return success;
  }, []);

  const buyCosmetic = useCallback((id: string): boolean => {
    const cos = COSMETICS.find(c => c.id === id);
    if (!cos) return false;
    let success = false;
    setPlayer(prev => {
      if (prev.unlockedCosmetics.includes(id)) return prev;
      if (prev.coins < cos.price) return prev;
      success = true;
      return {
        ...prev,
        coins: prev.coins - cos.price,
        unlockedCosmetics: [...prev.unlockedCosmetics, id],
      };
    });
    return success;
  }, []);

  const buyHoverboard = useCallback((id: string): boolean => {
    const board = HOVERBOARDS.find(b => b.id === id);
    if (!board) return false;
    let success = false;
    setPlayer(prev => {
      if (prev.unlockedHoverboards.includes(id)) return prev;
      if (prev.coins < board.price) return prev;
      success = true;
      return {
        ...prev,
        coins: prev.coins - board.price,
        unlockedHoverboards: [...prev.unlockedHoverboards, id],
        equippedHoverboard: id,
      };
    });
    return success;
  }, []);
  const buyMysteryBox = useCallback((type: 'basic' | 'rare' | 'epic' | 'legendary', price: number): boolean => {
    let success = false;
    setPlayer(prev => {
      if (prev.coins < price) return prev;
      const newBoxes = { ...prev.mysteryBoxes };
      newBoxes[type] += 1;
      const newPlayer: PlayerState = {
        ...prev,
        coins: prev.coins - price,
        mysteryBoxes: newBoxes,
      };
      success = true;
      savePlayer(newPlayer);
      return newPlayer;
    });
    return success;
  }, []);
  const openMysteryBox = useCallback((type: 'basic' | 'rare' | 'epic' | 'legendary'): string | null => {
    let rewardId: string | null = null;
    setPlayer(prev => {
      if (prev.mysteryBoxes[type] <= 0) return prev;

      const available = COSMETICS.filter(c => !prev.unlockedCosmetics.includes(c.id));
      if (available.length === 0) return prev;

      const rarityOrder: Record<string, number> = {
        common: 1,
        rare: 2,
        epic: 3,
        legendary: 4,
        mythic: 5,
      };

      const maxRarity =
        type === 'basic' ? 2 :
        type === 'rare' ? 3 :
        type === 'epic' ? 4 : 5;

      const eligible = available.filter(c => (rarityOrder[c.rarity] || 1) <= maxRarity);
      const pool = eligible.length > 0 ? eligible : available;
      const reward = pool[Math.floor(Math.random() * pool.length)];
      rewardId = reward.id;

      const newBoxes = { ...prev.mysteryBoxes };
      newBoxes[type] -= 1;

      const newPlayer: PlayerState = {
        ...prev,
        mysteryBoxes: newBoxes,
        unlockedCosmetics: [...prev.unlockedCosmetics, reward.id],
      };

      savePlayer(newPlayer);
      return newPlayer;
    });
    return rewardId;
  }, []);

  const claimDailyReward = useCallback(
    (
      day: number,
      reward: {
        coins?: number;
        energy?: number;
        mysterybox?: boolean;
        cosmetic?: boolean;
      },
    ) => {
      setPlayer(prev => {
        if (
          prev.lastDailyClaim !== 0 &&
          daysBetween(prev.lastDailyClaim, Date.now()) < 1
        ) {
          return prev;
        }

        const newBoxes = { ...prev.mysteryBoxes };

        if (reward.mysterybox) {
          newBoxes.basic += 1;
        }

        const newPlayer: PlayerState = {
          ...prev,
          coins: prev.coins + (reward.coins || 0),
          energy: Math.min(
            prev.maxEnergy,
            prev.energy + (reward.energy || 0),
          ),
          dailyRewardDay: day,
          lastDailyClaim: Date.now(),
          mysteryBoxes: newBoxes,
        };

        savePlayer(newPlayer);

        return newPlayer;
      });
    },
    [],
  );

  const canClaimDaily = useCallback((): boolean => {
    if (player.lastDailyClaim === 0) return true;
    return daysBetween(player.lastDailyClaim, Date.now()) >= 1;
  }, [player.lastDailyClaim]);

  const completeRun = useCallback((result: RunResult) => {
    setPlayer(prev => {
      const newPlayer: PlayerState = {
        ...prev,
        coins: prev.coins + result.coins,
        xp: prev.xp + result.xp,
        totalCoins: prev.totalCoins + result.coins,
        totalDistance: prev.totalDistance + result.distance,
        totalRuns: prev.totalRuns + 1,
        totalScore: prev.totalScore + result.score,
        maxCombo: Math.max(prev.maxCombo, result.combo),
        maxSpeed: Math.max(prev.maxSpeed, result.maxSpeed),
        powerupsUsed: prev.powerupsUsed + result.powerups,
          jumps: prev.jumps + result.jumps,
          dodges: prev.dodges + result.dodges,
          nearMisses: prev.nearMisses + result.nearMisses,
        highScore: Math.max(prev.highScore, result.score),
        bestDistance: Math.max(prev.bestDistance, result.distance),
        lastRun: result,
      };

      const lvl = levelFromXP(newPlayer.xp);
      newPlayer.level = lvl.level;

      const allMissions = [...DAILY_MISSIONS, ...WEEKLY_MISSIONS, ...STORY_MISSIONS];
      const newProgress = { ...newPlayer.missionProgress };

      const metricMap: Record<string, number> = {
        coins: result.coins,
        distance: result.distance,
        jumps: result.jumps,
        dodges: result.dodges,
        score: result.score,
        runs: 1,
        combo: result.combo,
        powerups: result.powerups,
        nearmiss: result.nearMisses,
      };

      const completedThisRun: string[] = [];
      for (const mission of allMissions) {
        if (newPlayer.completedMissions.includes(mission.id)) continue;
        const currentVal = newProgress[mission.id] || 0;
        const metricVal = metricMap[mission.metric] || 0;
        const newVal = mission.metric === 'runs' || mission.metric === 'combo' || mission.metric === 'score'
          ? Math.max(currentVal, metricVal)
          : currentVal + metricVal;
        newProgress[mission.id] = newVal;
        if (newVal >= mission.target) {
          completedThisRun.push(mission.id);
          newPlayer.coins += mission.reward.coins;
          newPlayer.xp += mission.reward.xp;
        }
      }
      newPlayer.missionProgress = newProgress;
      newPlayer.completedMissions = [...newPlayer.completedMissions, ...completedThisRun];
      result.missionsCompleted = completedThisRun;

      const newAchievements: string[] = [];
      for (const ach of ACHIEVEMENTS) {
        if (newPlayer.achievements.includes(ach.id)) continue;
        const metricMap2: Record<string, number> = {
          totalScore: newPlayer.totalScore,
          totalCoins: newPlayer.totalCoins,
          totalDistance: newPlayer.totalDistance,
          runs: newPlayer.totalRuns,
          maxCombo: newPlayer.maxCombo,
          maxSpeed: newPlayer.maxSpeed,
          powerups: newPlayer.powerupsUsed,
          perfectRun: result.perfectRun ? 1 : 0,
        };
        if ((metricMap2[ach.metric] || 0) >= ach.target) {
          newAchievements.push(ach.id);
          newPlayer.coins += ach.reward.coins;
          newPlayer.xp += ach.reward.xp;
        }
      }
      newPlayer.achievements = [...newPlayer.achievements, ...newAchievements];
    result.achievementsCompleted = newAchievements;

      const lvl2 = levelFromXP(newPlayer.xp);
      newPlayer.level = lvl2.level;

      return newPlayer;
    });
  }, []);

  const resetProgress = useCallback(() => {
    setPlayer(createDefaultPlayer());
  }, []);

  const setOnboardingComplete = useCallback(() => {
    setPlayer(prev => ({ ...prev, onboardingComplete: true }));
  }, []);

  const getDailyMissions = useCallback(() => {
    return DAILY_MISSIONS;
  }, []);

  const getWeeklyMissions = useCallback(() => {
    return WEEKLY_MISSIONS;
  }, []);

  const getStoryMissions = useCallback(() => {
    return STORY_MISSIONS;
  }, []);

  return {
    player,
    updateSettings,
    consumeEnergy,
    equipCharacter,
    setActiveWorld,
    equipCosmetic,
    equipHoverboard,
    equipTrail,
    buyCharacter,
    buyCosmetic,
    buyHoverboard,
    buyMysteryBox,
    openMysteryBox,
    claimDailyReward,
    canClaimDaily,
    completeRun,
    resetProgress,
    setOnboardingComplete,
    getDailyMissions,
    getWeeklyMissions,
    getStoryMissions,
  };
}

export type GameStore = ReturnType<typeof useGameStore>;

export { loadPlayer };


