export type Screen =
  | 'loading'
  | 'onboarding'
  | 'home'
  | 'game'
  | 'gameover'
  | 'characters'
  | 'shop'
  | 'missions'
  | 'events'
  | 'leaderboard'
  | 'achievements'
  | 'profile'
  | 'settings'
  | 'daily'
  | 'story';

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type PowerUpType =
  | 'magnet'
  | 'shield'
  | 'turbo'
  | 'multiplier'
  | 'slowmo'
  | 'phase'
  | 'blast'
  | 'timefreeze';

export type WorldId = 'neon_city' | 'cyber_tunnels' | 'sky_city' | 'robot_district' | 'neon_wasteland';

export type CharacterId = 'kai' | 'nova' | 'blaze' | 'shadow' | 'cyber_ninja';

export type CosmeticType = 'jacket' | 'helmet' | 'mask' | 'shoes' | 'gloves' | 'back' | 'trail' | 'hoverboard' | 'effect';

export interface CharacterDef {
  id: CharacterId;
  name: string;
  rarity: Rarity;
  price: number;
  colors: { primary: string; secondary: string; accent: string; skin: string; hair: string };
  description: string;
}

export interface CosmeticDef {
  id: string;
  name: string;
  type: CosmeticType;
  rarity: Rarity;
  price: number;
  color: string;
  glow: string;
}

export interface HoverboardDef {
  id: string;
  name: string;
  rarity: Rarity;
  price: number;
  color: string;
  glow: string;
  trail: string;
}

export interface WorldDef {
  id: WorldId;
  name: string;
  description: string;
  skyGradient: [string, string, string];
  groundColor: string;
  roadColor: string;
  buildingColors: string[];
  accentColor: string;
  fogColor: string;
  ambientSpeed: number;
  unlockDistance: number;
}

export interface PowerUpDef {
  type: PowerUpType;
  name: string;
  icon: string;
  color: string;
  glow: string;
  duration: number;
  description: string;
}

export interface MissionDef {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'story';
  target: number;
  metric: 'coins' | 'distance' | 'jumps' | 'dodges' | 'score' | 'runs' | 'combo' | 'powerups' | 'nearmiss';
  reward: { coins: number; xp: number };
  worldId?: WorldId;
  chapter?: number;
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  target: number;
  metric: 'totalScore' | 'totalCoins' | 'totalDistance' | 'runs' | 'maxCombo' | 'maxSpeed' | 'powerups' | 'perfectRun';
  reward: { coins: number; xp: number };
}

export interface EventDef {
  id: string;
  name: string;
  description: string;
  color: string;
  glow: string;
  type: 'festival' | 'race' | 'invasion' | 'halloween' | 'winter';
  active: boolean;
  reward: string;
}

export interface PlayerState {
  coins: number;
  xp: number;
  level: number;
  energy: number;
  maxEnergy: number;
  lastEnergyTime: number;
  highScore: number;
  bestDistance: number;
  totalCoins: number;
  totalDistance: number;
  totalRuns: number;
  totalScore: number;
  maxCombo: number;
  maxSpeed: number;
  powerupsUsed: number;
    jumps: number;
    dodges: number;
    nearMisses: number;
  unlockedCharacters: CharacterId[];
  unlockedCosmetics: string[];
  unlockedHoverboards: string[];
  equippedCharacter: CharacterId;
  equippedCosmetics: Record<CosmeticType, string | null>;
  equippedHoverboard: string | null;
  equippedTrail: string | null;
  activeWorld: WorldId;
  completedMissions: string[];
  missionProgress: Record<string, number>;
  achievements: string[];
  dailyRewardDay: number;
  lastDailyClaim: number;
  mysteryBoxes: { basic: number; rare: number; epic: number; legendary: number };
  lastRun: RunResult | null;
  settings: GameSettings;
  onboardingComplete: boolean;
  storyProgress: number;
  dailyMissionDate: string;
  weeklyMissionDate: string;
}

export interface GameSettings {
  graphics: 'low' | 'medium' | 'high';
  sound: boolean;
  music: boolean;
  musicVolume: number;
  sfxVolume: number;
  haptics: boolean;
  reducedEffects: boolean;
  sensitivity: number;
  leftHanded: boolean;
  notifications: boolean;
}

export interface RunResult {
  score: number;
  distance: number;
  coins: number;
  combo: number;
  xp: number;
  jumps: number;
  dodges: number;
  powerups: number;
  nearMisses: number;
  maxSpeed: number;
  worldId: WorldId;
  perfectRun: boolean;
  missionsCompleted: string[];
  achievementsCompleted: string[];
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  distance: number;
  country: string;
  character: CharacterId;
  level: number;
  createdAt: string;
}


