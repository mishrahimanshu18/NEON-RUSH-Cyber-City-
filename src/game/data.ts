import type {
  CharacterDef,
  CosmeticDef,
  HoverboardDef,
  WorldDef,
  PowerUpDef,
  MissionDef,
  AchievementDef,
  EventDef,
} from './types';

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'kai',
    name: 'Kai',
    rarity: 'common',
    price: 0,
    colors: { primary: '#00d4ff', secondary: '#0a0e27', accent: '#00ffff', skin: '#e8b894', hair: '#1a1a2e' },
    description: 'The original cyber-runner. Balanced and reliable.',
  },
  {
    id: 'nova',
    name: 'Nova',
    rarity: 'rare',
    price: 5000,
    colors: { primary: '#ff006e', secondary: '#1a0a1a', accent: '#ff4081', skin: '#d4a76a', hair: '#ff006e' },
    description: 'A mysterious runner with neon pink energy.',
  },
  {
    id: 'blaze',
    name: 'Blaze',
    rarity: 'epic',
    price: 15000,
    colors: { primary: '#ff6b00', secondary: '#1a0a00', accent: '#ffaa00', skin: '#c4956a', hair: '#ff4400' },
    description: 'A fiery runner who leaves trails of flame.',
  },
  {
    id: 'shadow',
    name: 'Shadow',
    rarity: 'legendary',
    price: 30000,
    colors: { primary: '#9d00ff', secondary: '#0a001a', accent: '#bd00ff', skin: '#a8826a', hair: '#000000' },
    description: 'A stealth operative from the underground.',
  },
  {
    id: 'cyber_ninja',
    name: 'Cyber Ninja',
    rarity: 'mythic',
    price: 75000,
    colors: { primary: '#00ff88', secondary: '#001a0e', accent: '#00ffaa', skin: '#d4b894', hair: '#00ff88' },
    description: 'The legendary ninja of the digital realm.',
  },
];

export const COSMETICS: CosmeticDef[] = [
  { id: 'jacket_neon', name: 'Neon Jacket', type: 'jacket', rarity: 'common', price: 500, color: '#00d4ff', glow: '#00ffff' },
  { id: 'jacket_inferno', name: 'Inferno Jacket', type: 'jacket', rarity: 'rare', price: 2000, color: '#ff4400', glow: '#ff6b00' },
  { id: 'jacket_void', name: 'Void Jacket', type: 'jacket', rarity: 'epic', price: 5000, color: '#9d00ff', glow: '#bd00ff' },
  { id: 'helmet_visor', name: 'Cyber Visor', type: 'helmet', rarity: 'rare', price: 1500, color: '#00ffff', glow: '#00d4ff' },
  { id: 'helmet_full', name: 'Full Helm', type: 'helmet', rarity: 'epic', price: 4000, color: '#ff006e', glow: '#ff4081' },
  { id: 'mask_neon', name: 'Neon Mask', type: 'mask', rarity: 'common', price: 800, color: '#00ff88', glow: '#00ffaa' },
  { id: 'mask_stealth', name: 'Stealth Mask', type: 'mask', rarity: 'rare', price: 2500, color: '#222222', glow: '#444444' },
  { id: 'shoes_lightning', name: 'Lightning Shoes', type: 'shoes', rarity: 'rare', price: 1800, color: '#ffdd00', glow: '#ffff00' },
  { id: 'shoes_plasma', name: 'Plasma Shoes', type: 'shoes', rarity: 'epic', price: 4500, color: '#00ffff', glow: '#00d4ff' },
  { id: 'gloves_energy', name: 'Energy Gloves', type: 'gloves', rarity: 'common', price: 600, color: '#00d4ff', glow: '#00ffff' },
  { id: 'gloves_power', name: 'Power Gloves', type: 'gloves', rarity: 'rare', price: 2200, color: '#ff006e', glow: '#ff4081' },
  { id: 'back_jetpack', name: 'Jet Pack', type: 'back', rarity: 'epic', price: 5000, color: '#ff6b00', glow: '#ffaa00' },
  { id: 'back_wings', name: 'Cyber Wings', type: 'back', rarity: 'legendary', price: 12000, color: '#00ffff', glow: '#00d4ff' },
  { id: 'trail_lightning', name: 'Lightning Trail', type: 'trail', rarity: 'rare', price: 2000, color: '#ffdd00', glow: '#ffff00' },
  { id: 'trail_plasma', name: 'Plasma Trail', type: 'trail', rarity: 'epic', price: 5000, color: '#00ffff', glow: '#00d4ff' },
  { id: 'trail_shadow', name: 'Shadow Trail', type: 'trail', rarity: 'legendary', price: 10000, color: '#9d00ff', glow: '#bd00ff' },
  { id: 'effect_sparkle', name: 'Sparkle Effect', type: 'effect', rarity: 'rare', price: 2500, color: '#ffdd00', glow: '#ffff00' },
  { id: 'effect_aura', name: 'Energy Aura', type: 'effect', rarity: 'epic', price: 6000, color: '#00ff88', glow: '#00ffaa' },
];

export const HOVERBOARDS: HoverboardDef[] = [
  { id: 'board_neon', name: 'Neon Board', rarity: 'common', price: 1000, color: '#00d4ff', glow: '#00ffff', trail: '#00ffff' },
  { id: 'board_thunder', name: 'Thunder Board', rarity: 'rare', price: 5000, color: '#ffdd00', glow: '#ffff00', trail: '#ffdd00' },
  { id: 'board_shadow', name: 'Shadow Board', rarity: 'epic', price: 12000, color: '#9d00ff', glow: '#bd00ff', trail: '#9d00ff' },
  { id: 'board_plasma', name: 'Plasma Board', rarity: 'legendary', price: 25000, color: '#00ff88', glow: '#00ffaa', trail: '#00ff88' },
  { id: 'board_legendary', name: 'Cyber Board', rarity: 'mythic', price: 60000, color: '#ff006e', glow: '#ff4081', trail: '#ff006e' },
];

export const WORLDS: WorldDef[] = [
  {
    id: 'neon_city',
    name: 'Neon City',
    description: 'Giant skyscrapers, neon signs, and holographic ads light up the rain-soaked streets.',
    skyGradient: ['#0a0e27', '#1a1a3e', '#2a1a4e'],
    groundColor: '#1a1a2e',
    roadColor: '#252540',
    buildingColors: ['#1a1a3e', '#2a2a5e', '#1a2a4e', '#2a1a3e'],
    accentColor: '#00d4ff',
    fogColor: 'rgba(10, 14, 39, 0.3)',
    ambientSpeed: 1,
    unlockDistance: 0,
  },
  {
    id: 'cyber_tunnels',
    name: 'Cyber Tunnels',
    description: 'Underground highways with glowing pipes and laser barriers.',
    skyGradient: ['#0a0a0e', '#1a1a2e', '#0a1a1a'],
    groundColor: '#0e0e1a',
    roadColor: '#1a1a2e',
    buildingColors: ['#1a1a2e', '#0a1a2a', '#1a0a1a', '#0a0a2a'],
    accentColor: '#00ff88',
    fogColor: 'rgba(10, 10, 14, 0.4)',
    ambientSpeed: 1.2,
    unlockDistance: 2000,
  },
  {
    id: 'sky_city',
    name: 'Sky City',
    description: 'Floating platforms above the clouds with giant holograms.',
    skyGradient: ['#1a2a5e', '#2a4a8e', '#4a6abe'],
    groundColor: '#2a3a5e',
    roadColor: '#3a4a7e',
    buildingColors: ['#2a4a7e', '#3a5a9e', '#2a3a6e', '#4a6aae'],
    accentColor: '#ffdd00',
    fogColor: 'rgba(26, 42, 94, 0.2)',
    ambientSpeed: 0.8,
    unlockDistance: 5000,
  },
  {
    id: 'robot_district',
    name: 'Robot District',
    description: 'Factories and conveyor belts with mechanical obstacles.',
    skyGradient: ['#1a1a0a', '#2a2a1a', '#3a2a0a'],
    groundColor: '#2a2a1a',
    roadColor: '#3a3a2a',
    buildingColors: ['#2a2a1a', '#3a3a2a', '#2a3a1a', '#3a2a2a'],
    accentColor: '#ff6b00',
    fogColor: 'rgba(26, 26, 10, 0.35)',
    ambientSpeed: 1.1,
    unlockDistance: 10000,
  },
  {
    id: 'neon_wasteland',
    name: 'Neon Wasteland',
    description: 'Desert cyberpunk with broken buildings and sandstorms.',
    skyGradient: ['#2a1a0a', '#3a2a1a', '#4a3a2a'],
    groundColor: '#3a2a1a',
    roadColor: '#4a3a2a',
    buildingColors: ['#3a2a1a', '#4a3a2a', '#3a3a2a', '#4a3a1a'],
    accentColor: '#ff006e',
    fogColor: 'rgba(42, 26, 10, 0.4)',
    ambientSpeed: 1.3,
    unlockDistance: 20000,
  },
];

export const POWERUPS: PowerUpDef[] = [
  { type: 'magnet', name: 'Magnet', icon: '🧲', color: '#00d4ff', glow: '#00ffff', duration: 8000, description: 'Auto-collects nearby coins' },
  { type: 'shield', name: 'Shield', icon: '🛡', color: '#00ff88', glow: '#00ffaa', duration: 10000, description: 'Protects against one collision' },
  { type: 'turbo', name: 'Turbo', icon: '⚡', color: '#ffdd00', glow: '#ffff00', duration: 5000, description: 'Massive speed boost' },
  { type: 'multiplier', name: '2x Coins', icon: '✕2', color: '#ff006e', glow: '#ff4081', duration: 10000, description: 'Doubles coin collection' },
  { type: 'slowmo', name: 'Slow-Mo', icon: '🐌', color: '#9d00ff', glow: '#bd00ff', duration: 6000, description: 'Slows down obstacles' },
  { type: 'phase', name: 'Phase', icon: '👻', color: '#bd00ff', glow: '#dd00ff', duration: 5000, description: 'Pass through obstacles' },
  { type: 'blast', name: 'Energy Blast', icon: '💥', color: '#ff6b00', glow: '#ffaa00', duration: 3000, description: 'Destroys obstacles ahead' },
  { type: 'timefreeze', name: 'Time Freeze', icon: '❄', color: '#00ffff', glow: '#00d4ff', duration: 4000, description: 'Freezes moving obstacles' },
];

export const DAILY_MISSIONS: MissionDef[] = [
  { id: 'd_coins_500', name: 'Coin Collector', description: 'Collect 500 coins', type: 'daily', target: 500, metric: 'coins', reward: { coins: 200, xp: 50 } },
  { id: 'd_dist_2000', name: 'Long Runner', description: 'Run 2,000 meters', type: 'daily', target: 2000, metric: 'distance', reward: { coins: 250, xp: 60 } },
  { id: 'd_jumps_20', name: 'Jumpy', description: 'Perform 20 jumps', type: 'daily', target: 20, metric: 'jumps', reward: { coins: 150, xp: 40 } },
  { id: 'd_dodge_50', name: 'Dodger', description: 'Dodge 50 obstacles', type: 'daily', target: 50, metric: 'dodges', reward: { coins: 300, xp: 70 } },
  { id: 'd_nearmiss_10', name: 'Close Call', description: 'Get 10 near misses', type: 'daily', target: 10, metric: 'nearmiss', reward: { coins: 350, xp: 80 } },
  { id: 'd_combo_10', name: 'Combo Master', description: 'Achieve a x10 combo', type: 'daily', target: 10, metric: 'combo', reward: { coins: 400, xp: 100 } },
];

export const WEEKLY_MISSIONS: MissionDef[] = [
  { id: 'w_score_20k', name: 'High Scorer', description: 'Reach 20,000 score', type: 'weekly', target: 20000, metric: 'score', reward: { coins: 2000, xp: 500 } },
  { id: 'w_runs_10', name: 'Persistent', description: 'Complete 10 runs', type: 'weekly', target: 10, metric: 'runs', reward: { coins: 1500, xp: 400 } },
  { id: 'w_powerups_15', name: 'Powered Up', description: 'Collect 15 power-ups', type: 'weekly', target: 15, metric: 'powerups', reward: { coins: 1800, xp: 450 } },
  { id: 'w_combo_20', name: 'Combo Legend', description: 'Achieve a x20 combo', type: 'weekly', target: 20, metric: 'combo', reward: { coins: 2500, xp: 600 } },
];

export const STORY_MISSIONS: MissionDef[] = [
  { id: 's_ch1', name: 'Chapter 1: The Escape', description: 'Escape the Cyber Police in Neon City', type: 'story', target: 1500, metric: 'distance', reward: { coins: 1000, xp: 200 }, worldId: 'neon_city', chapter: 1 },
  { id: 's_ch2', name: 'Chapter 2: Cyber Tunnels', description: 'Navigate the underground tunnels', type: 'story', target: 3000, metric: 'distance', reward: { coins: 2000, xp: 400 }, worldId: 'cyber_tunnels', chapter: 2 },
  { id: 's_ch3', name: 'Chapter 3: Sky City', description: 'Reach the floating Sky City', type: 'story', target: 5000, metric: 'distance', reward: { coins: 3000, xp: 600 }, worldId: 'sky_city', chapter: 3 },
  { id: 's_ch4', name: 'Chapter 4: Robot District', description: 'Infiltrate the Robot District', type: 'story', target: 7000, metric: 'distance', reward: { coins: 4000, xp: 800 }, worldId: 'robot_district', chapter: 4 },
  { id: 's_ch5', name: 'Chapter 5: NEXUS Core', description: 'Reach the NEXUS Core', type: 'story', target: 10000, metric: 'distance', reward: { coins: 5000, xp: 1000 }, worldId: 'neon_wasteland', chapter: 5 },
];

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'a_first_run', name: 'First Run', description: 'Complete your first run', icon: '🏃', target: 1, metric: 'runs', reward: { coins: 100, xp: 50 } },
  { id: 'a_coin_master', name: 'Coin Master', description: 'Collect 10,000 total coins', icon: '💰', target: 10000, metric: 'totalCoins', reward: { coins: 500, xp: 200 } },
  { id: 'a_speed_demon', name: 'Speed Demon', description: 'Reach maximum speed', icon: '⚡', target: 200, metric: 'maxSpeed', reward: { coins: 1000, xp: 300 } },
  { id: 'a_perfect_run', name: 'Perfect Run', description: 'Complete a run without collision', icon: '✨', target: 1, metric: 'perfectRun', reward: { coins: 2000, xp: 500 } },
  { id: 'a_neon_legend', name: 'Neon Legend', description: 'Reach 1,000,000 total score', icon: '🏆', target: 1000000, metric: 'totalScore', reward: { coins: 5000, xp: 1000 } },
  { id: 'a_combo_king', name: 'Combo King', description: 'Achieve a x20 combo', icon: '🔥', target: 20, metric: 'maxCombo', reward: { coins: 1500, xp: 400 } },
  { id: 'a_marathoner', name: 'Marathoner', description: 'Run 100,000 total meters', icon: '🎯', target: 100000, metric: 'totalDistance', reward: { coins: 3000, xp: 800 } },
  { id: 'a_powerup_pro', name: 'Power-Up Pro', description: 'Use 100 power-ups', icon: '💎', target: 100, metric: 'powerups', reward: { coins: 1200, xp: 350 } },
];

export const EVENTS: EventDef[] = [
  { id: 'e_neon_festival', name: 'Neon Festival', description: 'Special city environment with bonus rewards!', color: '#00d4ff', glow: '#00ffff', type: 'festival', active: true, reward: 'Festival Trail' },
  { id: 'e_cyber_race', name: 'Cyber Race', description: 'Limited-time leaderboard competition', color: '#ffdd00', glow: '#ffff00', type: 'race', active: true, reward: 'Thunder Board' },
  { id: 'e_nexus_invasion', name: 'NEXUS Invasion', description: 'Special enemies and challenges', color: '#ff006e', glow: '#ff4081', type: 'invasion', active: true, reward: 'Shadow Mask' },
  { id: 'e_halloween', name: 'Halloween Cyber Night', description: 'Spooky futuristic city event', color: '#9d00ff', glow: '#bd00ff', type: 'halloween', active: false, reward: 'Void Jacket' },
  { id: 'e_winter', name: 'Winter Neon Festival', description: 'Snowy cyberpunk environment', color: '#00ff88', glow: '#00ffaa', type: 'winter', active: false, reward: 'Plasma Shoes' },
];

export const RARITY_COLORS: Record<string, { border: string; glow: string; text: string; bg: string }> = {
  common: { border: '#666666', glow: '#888888', text: '#aaaaaa', bg: 'rgba(100,100,100,0.15)' },
  rare: { border: '#00d4ff', glow: '#00ffff', text: '#00d4ff', bg: 'rgba(0,212,255,0.1)' },
  epic: { border: '#9d00ff', glow: '#bd00ff', text: '#bd00ff', bg: 'rgba(157,0,255,0.1)' },
  legendary: { border: '#ffaa00', glow: '#ffdd00', text: '#ffdd00', bg: 'rgba(255,170,0,0.1)' },
  mythic: { border: '#ff006e', glow: '#ff4081', text: '#ff4081', bg: 'rgba(255,0,110,0.1)' },
};

export const RARITY_ORDER = ['common', 'rare', 'epic', 'legendary', 'mythic'] as const;

export const LEVEL_TITLES: { level: number; title: string }[] = [
  { level: 1, title: 'Beginner' },
  { level: 5, title: 'Runner' },
  { level: 10, title: 'Cyber Runner' },
  { level: 20, title: 'Neon Elite' },
  { level: 50, title: 'Cyber Legend' },
  { level: 100, title: 'NEXUS Slayer' },
];

export function getLevelTitle(level: number): string {
  let title = 'Beginner';
  for (const entry of LEVEL_TITLES) {
    if (level >= entry.level) title = entry.title;
  }
  return title;
}

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function xpToNext(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) total += xpForLevel(i);
  return total;
}

export function levelFromXP(xp: number): { level: number; current: number; needed: number; progress: number } {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  const needed = xpForLevel(level);
  return { level, current: remaining, needed, progress: remaining / needed };
}

export const DAILY_REWARDS: { day: number; type: string; amount: number; label: string; icon: string }[] = [
  { day: 1, type: 'coins', amount: 500, label: '500 Coins', icon: '💰' },
  { day: 2, type: 'energy', amount: 5, label: '5 Energy', icon: '⚡' },
  { day: 3, type: 'mysterybox', amount: 1, label: 'Mystery Box', icon: '🎁' },
  { day: 4, type: 'cosmetic', amount: 1, label: 'Rare Cosmetic', icon: '✨' },
  { day: 5, type: 'coins', amount: 2000, label: '2000 Coins', icon: '💰' },
  { day: 6, type: 'bundle', amount: 1, label: 'Power-Up Bundle', icon: '📦' },
  { day: 7, type: 'cosmetic', amount: 1, label: 'Epic Cosmetic', icon: '🌟' },
];

export const LOADING_TIPS: string[] = [
  'TIP: Near misses increase your combo.',
  'TIP: Save your shield for high-speed sections.',
  'TIP: The magnet power-up works best in coin-dense areas.',
  'TIP: Double jump to reach high platforms.',
  'TIP: Slide to dodge low barriers.',
  'TIP: Phase lets you pass through obstacles.',
  'TIP: Energy Blast destroys everything ahead.',
  'TIP: Higher combos mean higher scores.',
  'TIP: Turbo is risky but rewarding.',
  'TIP: Complete missions for extra rewards.',
  'TIP: Visit the shop for new characters.',
  'TIP: Each world has unique obstacles.',
  'TIP: Hoverboards give you a second chance.',
  'TIP: Time Freeze stops moving obstacles.',
  'TIP: Mystery boxes contain rare cosmetics.',
];

export const COUNTRY_FLAGS: Record<string, string> = {
  US: '🇺🇸', UK: '🇬🇧', JP: '🇯🇵', DE: '🇩🇪', FR: '🇫🇷', BR: '🇧🇷', KR: '🇰🇷', CN: '🇨🇳',
  CA: '🇨🇦', AU: '🇦🇺', IN: '🇮🇳', MX: '🇲🇽', ES: '🇪🇸', IT: '🇮🇹', NL: '🇳🇱', SE: '🇸🇪',
};
