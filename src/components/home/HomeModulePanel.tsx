import React, { useState } from 'react';
import './HomeModulePanel.css';
import { ShopScreen } from '../ShopScreen';
import { useGameStore } from '../../game/store';
import { startMusic, stopMusic, setMusicEnabled, setSoundEnabled } from '../../game/audio';
import {
  DAILY_MISSIONS,
  ACHIEVEMENTS,
  EVENTS,
  CHARACTERS,
  HOVERBOARDS,
  WORLDS,
  STORY_MISSIONS,
} from '../../game/data';

export type HomeModuleKey =
  | 'reward'
  | 'missions'
  | 'achievements'
  | 'leaderboard'
  | 'shop'
  | 'characters'
  | 'events'
  | 'settings'
  | 'notifications'
  | 'tutorial'
  | 'story'
  | 'hoverboards'
  | 'challenges'
  | 'character-change'
  | 'city-change';

type ModuleData = {
  icon: string;
  eyebrow: string;
  title: string;
  description: string;
  status: string;
  accent: 'cyan' | 'pink' | 'violet' | 'gold';
  items: string[];
};

const modules: Record<HomeModuleKey, ModuleData> = {
  reward: {
    icon: '◈',
    eyebrow: 'DAILY REWARD',
    title: 'REWARD DROP',
    description: 'Your daily reward is ready to claim.',
    status: '+500 COINS',
    accent: 'gold',
    items: ['DAY REWARD', '500 COINS', 'NEXT DROP: 24H'],
  },

  missions: {
    icon: '◈',
    eyebrow: 'ACTIVE OPS',
    title: 'MISSIONS',
    description: 'Complete objectives to earn coins and XP.',
    status: 'ACTIVE',
    accent: 'cyan',
    items: [
      'DAILY MISSIONS',
      'WEEKLY MISSIONS',
      'STORY MISSIONS',
    ],
  },

  achievements: {
    icon: '◆',
    eyebrow: 'MILESTONES',
    title: 'ACHIEVEMENTS',
    description: 'Track your runner milestones and unlocks.',
    status: 'TRACKING',
    accent: 'pink',
    items: [
      'SCORE HUNTER',
      'COMBO MASTER',
      'COIN COLLECTOR',
    ],
  },

  leaderboard: {
    icon: '♛',
    eyebrow: 'GLOBAL NETWORK',
    title: 'LEADERBOARD',
    description: 'Your personal performance statistics.',
    status: 'PERSONAL STATS',
    accent: 'violet',
    items: [
      'HIGH SCORE',
      'BEST DISTANCE',
      'TOTAL SCORE',
    ],
  },

  shop: {
    icon: '▣',
    eyebrow: 'NEON MARKET',
    title: 'SHOP',
    description: 'Browse characters, skins, boards and cosmetics.',
    status: 'MARKET OPEN',
    accent: 'gold',
    items: [
      'CHARACTERS',
      'HOVERBOARDS',
      'COSMETICS',
    ],
  },

  characters: {
    icon: '◇',
    eyebrow: 'RUNNER LOADOUT',
    title: 'CHARACTERS',
    description: 'Customize your active runner.',
    status: 'AVAILABLE',
    accent: 'cyan',
    items: [
      'KAI // DEFAULT',
      'UNLOCKABLE RUNNERS',
      'LOCKED SLOTS',
    ],
  },

  events: {
    icon: '◉',
    eyebrow: 'LIMITED TIME',
    title: 'EVENTS',
    description: 'Special events and exclusive rewards.',
    status: 'LIVE',
    accent: 'cyan',
    items: [
      'NEON FESTIVAL',
      'CYBER RACE',
      'NEXUS INVASION',
    ],
  },

  settings: {
    icon: '⚙',
    eyebrow: 'SYSTEM CONTROL',
    title: 'SETTINGS',
    description: 'Configure graphics, audio and controls.',
    status: 'READY',
    accent: 'violet',
    items: [
      'GRAPHICS',
      'AUDIO',
      'CONTROLS',
    ],
  },

  notifications: {
    icon: '◌',
    eyebrow: 'INCOMING DATA',
    title: 'NOTIFICATIONS',
    description: 'Recent game activity and alerts.',
    status: '03 NEW',
    accent: 'pink',
    items: [
      'DAILY REWARD',
      'NEW CHALLENGE',
      'EVENT UPDATE',
    ],
  },

  tutorial: {
    icon: '?',
    eyebrow: 'NEW RUNNER',
    title: 'TUTORIAL',
    description: 'Learn the essential Cyber City controls.',
    status: '6 STEPS',
    accent: 'cyan',
    items: [
      'LANE SWITCH',
      'JUMP / SLIDE',
      'COINS / POWER-UPS',
    ],
  },

  story: {
    icon: '▤',
    eyebrow: 'CYBER CITY',
    title: 'STORY / CHAPTERS',
    description: 'Follow Kai through the Cyber City story.',
    status: 'CHAPTER 01',
    accent: 'gold',
    items: [
      'THE ESCAPE',
      'CYBER TUNNELS',
      'SKY CITY',
    ],
  },

  hoverboards: {
    icon: '▱',
    eyebrow: 'EQUIPMENT',
    title: 'HOVERBOARDS',
    description: 'Select futuristic boards and cosmetic trails.',
    status: 'AVAILABLE',
    accent: 'cyan',
    items: [
      'NEON BOARD',
      'THUNDER BOARD',
      'LOCKED BOARD',
    ],
  },

  challenges: {
    icon: '◈',
    eyebrow: 'OBJECTIVES',
    title: 'DAILY / WEEKLY',
    description: 'Complete rotating challenges for bonus rewards.',
    status: 'READY',
    accent: 'pink',
    items: [
      'DAILY RUN',
      'WEEKLY SCORE',
      'COMBO TARGET',
    ],
  },

  'character-change': {
    icon: '◎',
    eyebrow: 'RUNNER LOADOUT',
    title: 'CHARACTER CHANGE',
    description: 'Change your active runner appearance.',
    status: 'KAI ACTIVE',
    accent: 'violet',
    items: [
      'KAI',
      'CYBER KAI',
      'MORE COMING SOON',
    ],
  },

  'city-change': {
    icon: '⌁',
    eyebrow: 'DESTINATION',
    title: 'CITY CHANGE',
    description: 'Choose the world for your next run.',
    status: 'CITY 01',
    accent: 'gold',
    items: [
      'NEON CITY',
      'CYBER TUNNELS',
      'SKY CITY',
    ],
  },
};

type HomeModulePanelProps = {
  module: HomeModuleKey | null;
  onClose: () => void;
  onClaimReward?: () => void;
  canClaimReward?: boolean;
};

export default function HomeModulePanel({
  module,
  onClose,
  onClaimReward,
  canClaimReward = false,
}: HomeModulePanelProps) {
  const { player, updateSettings, equipCharacter, buyCharacter, equipHoverboard, buyHoverboard, buyCosmetic, equipCosmetic, buyMysteryBox, openMysteryBox, setActiveWorld } = useGameStore();

  const [selectedItem, setSelectedItem] =
    useState<number | null>(null);

  if (!module) return null;

  if (module === 'shop') {
    return (
      <ShopScreen
        player={player}
        onBack={onClose}
        onBuyCharacter={buyCharacter}
        onBuyCosmetic={buyCosmetic}
        onBuyHoverboard={buyHoverboard}
        onBuyMysteryBox={buyMysteryBox}
        onOpenMysteryBox={openMysteryBox}
      />
    );
  }

  const data = modules[module];

  const getAchievementValue = (
    metric: string,
  ): number => {
    switch (metric) {
      case 'runs':
        return player.totalRuns;

      case 'totalCoins':
        return player.totalCoins;

      case 'maxSpeed':
        return player.maxSpeed;

      case 'perfectRun':
        return player.lastRun?.perfectRun ? 1 : 0;

      case 'totalScore':
        return player.totalScore;

      case 'maxCombo':
        return player.maxCombo;

      case 'totalDistance':
        return player.totalDistance;

      case 'powerups':
        return player.powerupsUsed;

      default:
        return 0;
    }
  };

  const missionItems = DAILY_MISSIONS.map(
    (mission) => {
      const current =
        player.missionProgress[mission.id] ?? 0;

      const completed =
        player.completedMissions.includes(
          mission.id,
        );

      let item =
        mission.name.toUpperCase() +
        ' // ' +
        current +
        ' / ' +
        mission.target;

      if (completed) {
        item += '  ✓';
      }

      return item;
    },
  );

  const missionCompletedCount =
    DAILY_MISSIONS.filter((mission) =>
      player.completedMissions.includes(
        mission.id,
      ),
    ).length;

  const missionStatus =
    missionCompletedCount +
    ' / ' +
    DAILY_MISSIONS.length +
    ' COMPLETE';

  const achievementItems =
    ACHIEVEMENTS.map((achievement) => {
      const current = Math.min(
        getAchievementValue(
          achievement.metric,
        ),
        achievement.target,
      );

      const unlocked =
        player.achievements.includes(
          achievement.id,
        );

      let item =
        achievement.icon +
        ' ' +
        achievement.name.toUpperCase() +
        ' // ' +
        current +
        ' / ' +
        achievement.target;

      if (unlocked) {
        item += '  ✓';
      }

      return item;
    });

  const achievementCompletedCount =
    ACHIEVEMENTS.filter((achievement) =>
      player.achievements.includes(
        achievement.id,
      ),
    ).length;

  const characterItems = CHARACTERS.map((character) => {
    const unlocked =
      player.unlockedCharacters.includes(character.id);

    const equipped =
      player.equippedCharacter === character.id;

    let item =
      character.name.toUpperCase() +
      ' // ' +
      character.rarity.toUpperCase();

    if (equipped) {
      item += ' // EQUIPPED';
    } else if (unlocked) {
      item += ' // UNLOCKED';
    } else {
      item +=
        ' // ' +
        character.price.toLocaleString() +
        ' COINS';
    }

    return item;
  });

  const unlockedCharacterCount =
    player.unlockedCharacters.length;
  const hoverboardItems = HOVERBOARDS.map((board) => {
    const unlocked =
      player.unlockedHoverboards.includes(board.id);

    const equipped =
      player.equippedHoverboard === board.id;

    let item =
      board.name.toUpperCase() +
      ' // ' +
      board.rarity.toUpperCase();

    if (equipped) {
      item += ' // EQUIPPED';
    } else if (unlocked) {
      item += ' // UNLOCKED';
    } else {
      item +=
        ' // ' +
        board.price.toLocaleString() +
        ' COINS';
    }

    return item;
  });

  const unlockedHoverboardCount =
    player.unlockedHoverboards.length;
  const worldItems = WORLDS.map((world) => {
    const unlocked =
      player.totalDistance >= world.unlockDistance;

    let item =
      world.name.toUpperCase() +
      ' // ' +
      world.unlockDistance.toLocaleString() +
      'M';

    if (world.unlockDistance === 0) {
      item += ' // DEFAULT';
    } else if (unlocked) {
      item += ' // UNLOCKED';
    } else {
      item += ' // LOCKED';
    }

    return item;
  });

  const unlockedWorldCount = WORLDS.filter(
    (world) =>
      player.totalDistance >= world.unlockDistance,
  ).length;
  const storyItems = STORY_MISSIONS.map((mission) => {
    const completed =
      player.completedMissions.includes(mission.id);

    const progress =
      mission.metric === 'distance'
        ? Math.min(player.totalDistance, mission.target)
        : 0;

    let item =
      mission.name.toUpperCase() +
      ' // ' +
      Math.floor(progress).toLocaleString() +
      '/' +
      mission.target.toLocaleString() +
      'M';

    if (completed) {
      item += ' // COMPLETE';
    } else {
      item += ' // IN PROGRESS';
    }

    return item;
  });

  const completedStoryCount = STORY_MISSIONS.filter(
    (mission) =>
      player.completedMissions.includes(mission.id),
  ).length;
  const notificationItems = [
    player.settings.notifications
      ? 'PUSH NOTIFICATIONS // ENABLED'
      : 'PUSH NOTIFICATIONS // DISABLED',
    'DAILY REWARDS // ' +
      (player.settings.notifications ? 'ENABLED' : 'DISABLED'),
    'MISSION ALERTS // ' +
      (player.settings.notifications ? 'ENABLED' : 'DISABLED'),
  ];
  const settingsItems = [
    'GRAPHICS // ' +
      player.settings.graphics.toUpperCase(),
    'SOUND // ' +
      (player.settings.sound ? 'ON' : 'OFF'),
    'MUSIC // ' +
      (player.settings.music ? 'ON' : 'OFF'),
    'MUSIC VOLUME // ' +
      Math.round(player.settings.musicVolume * 100) +
      '%',
    'SFX VOLUME // ' +
      Math.round(player.settings.sfxVolume * 100) +
      '%',
    'HAPTICS // ' +
      (player.settings.haptics ? 'ON' : 'OFF'),
    'REDUCED EFFECTS // ' +
      (player.settings.reducedEffects ? 'ON' : 'OFF'),
    'SENSITIVITY // ' +
      player.settings.sensitivity,
    'LEFT HANDED // ' +
      (player.settings.leftHanded ? 'ON' : 'OFF'),
    'NOTIFICATIONS // ' +
      (player.settings.notifications ? 'ON' : 'OFF'),
  ];
  const shopItems = [
    'COINS // ' + player.coins.toLocaleString(),
    'CHARACTERS // ' +
      player.unlockedCharacters.length +
      ' / ' +
      5 +
      ' UNLOCKED',
    'COSMETICS // ' +
      player.unlockedCosmetics.length +
      ' / ' +
      17 +
      ' UNLOCKED',
    'HOVERBOARDS // ' +
      player.unlockedHoverboards.length +
      ' / ' +
      5 +
      ' UNLOCKED',
    'EQUIPPED CHARACTER // ' +
      player.equippedCharacter.toUpperCase(),
    'EQUIPPED BOARD // ' +
      (player.equippedHoverboard
        ? player.equippedHoverboard.toUpperCase()
        : 'NONE'),
  ];
  const leaderboardItems = [
    'HIGH SCORE // ' +
      player.highScore.toLocaleString(),

    'BEST DISTANCE // ' +
      player.bestDistance.toLocaleString() +
      'm',

    'TOTAL SCORE // ' +
      player.totalScore.toLocaleString(),

    'TOTAL RUNS // ' +
      player.totalRuns.toLocaleString(),

    'MAX COMBO // x' +
      player.maxCombo,

    'MAX SPEED // ' +
      player.maxSpeed +
      ' km/h',
  ];

  const activeEvents =
    EVENTS.filter((event) => event.active);

  const eventItems = EVENTS.map((event) => {
    const state = event.active
      ? '● LIVE // '
      : '○ ENDED // ';

    return (
      state +
      event.name.toUpperCase() +
      ' // ' +
      event.reward
    );
  });

  const eventStatus =
    activeEvents.length +
    ' ACTIVE / ' +
    EVENTS.length +
    ' TOTAL';

  const status =
    module === 'reward'
      ? canClaimReward
        ? '+500 COINS READY'
        : 'CLAIMED // 24H COOLDOWN'
      : module === 'missions'
        ? missionStatus
        : module === 'achievements'
          ? achievementCompletedCount +
            ' / ' +
            ACHIEVEMENTS.length +
            ' UNLOCKED'
          : module === 'leaderboard'
            ? 'PERSONAL STATS'
            : module === 'events'
              ? eventStatus
              : data.status;

  const items =
    module === 'missions'
      ? missionItems
      : module === 'achievements'
        ? achievementItems
        : module === 'leaderboard'
          ? leaderboardItems
          : module === 'events'
            ? eventItems
            : data.items;

  const handleItemClick = (
    index: number,
  ) => {
    setSelectedItem(index);
  };
  const handleSettingsAction = () => {
    if (selectedItem === null || module !== 'settings') return;

    switch (selectedItem) {
      case 1:
        setSoundEnabled(!player.settings.sound);
      updateSettings({ sound: !player.settings.sound });
        break;
      case 2:
        setMusicEnabled(!player.settings.music);
      updateSettings({ music: !player.settings.music });
        break;
      case 6:
        updateSettings({ haptics: !player.settings.haptics });
        break;
      case 7:
        updateSettings({ reducedEffects: !player.settings.reducedEffects });
        break;
      case 9:
        updateSettings({ notifications: !player.settings.notifications });
        break;
      default:
        break;
    }
  };

  const handleLoadoutAction = () => {
  if (selectedItem === null) return;

  if (module === 'characters') {
    const character = CHARACTERS[selectedItem];
    if (!character) return;

    if (player.unlockedCharacters.includes(character.id)) {
      equipCharacter(character.id);
    } else {
      buyCharacter(character.id);
    }
  }

  if (module === 'hoverboards') {
    const board = HOVERBOARDS[selectedItem];
    if (!board) return;

    if (player.unlockedHoverboards.includes(board.id)) {
      equipHoverboard(board.id);
    } else {
      buyHoverboard(board.id);
    }
  }
};

  return (
    <div
      className="nr-module-overlay"
      onClick={onClose}
    >
      <div
        className={
          'nr-module-panel nr-module-' +
          data.accent
        }
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <button
          type="button"
          className="nr-module-close"
          onClick={onClose}
          aria-label="Close module"
        >
          ×
        </button>

        <div className="nr-module-top">
          <span className="nr-module-icon">
            {data.icon}
          </span>

          <div>
            <small>{data.eyebrow}</small>
            <h2>{data.title}</h2>
          </div>
        </div>

        <p className="nr-module-description">
          {data.description}
        </p>

        <div className="nr-module-status">
          <span>
            {selectedItem === null
              ? 'STATUS'
              : 'SELECTED'}
          </span>

          <strong>
            {selectedItem === null
              ? status
              : items[selectedItem]}
          </strong>
        </div>

        <div className="nr-module-list">
          {items.map((item, index) => (
            <button
              type="button"
              className={
                'nr-module-item ' +
                (selectedItem === index
                  ? 'nr-module-item-active'
                  : '')
              }
              key={item}
              onClick={() =>
                handleItemClick(index)
              }
            >
              <span>
                {String(index + 1).padStart(
                  2,
                  '0',
                )}
              </span>

              <strong>{item}</strong>

              <b>
                {selectedItem === index
                  ? '✓'
                  : '›'}
              </b>
            </button>
          ))}
        </div>

        {(module === 'characters' || module === 'hoverboards') && selectedItem !== null && (
          <button
            type="button"
            className="nr-module-claim"
            onClick={handleLoadoutAction}
          >
            {module === 'characters'
              ? (player.unlockedCharacters.includes(CHARACTERS[selectedItem]?.id) ? 'EQUIP SELECTED CHARACTER' : 'BUY SELECTED CHARACTER')
              : (player.unlockedHoverboards.includes(HOVERBOARDS[selectedItem]?.id) ? 'EQUIP SELECTED HOVERBOARD' : 'BUY SELECTED HOVERBOARD')}
          </button>
        )}

        {module === 'city-change' && selectedItem !== null && (
          <button
            type="button"
            className="nr-module-claim"
            disabled={player.totalDistance < (WORLDS[selectedItem]?.unlockDistance ?? 0)}
            onClick={() => {
              const world = WORLDS[selectedItem];
              if (world) setActiveWorld(world.id);
            }}
          >
            {player.activeWorld === WORLDS[selectedItem]?.id
              ? 'ACTIVE CITY'
              : player.totalDistance >= (WORLDS[selectedItem]?.unlockDistance ?? 0)
                ? 'ENTER SELECTED CITY'
                : 'LOCKED // RUN MORE'}
          </button>
        )}

        {module === 'settings' && selectedItem !== null && (
          <button
            type="button"
            className="nr-module-claim"
            onClick={handleSettingsAction}
          >
            {selectedItem === 1 ? (player.settings.sound ? 'TURN SOUND OFF' : 'TURN SOUND ON') :
             selectedItem === 2 ? (player.settings.music ? 'TURN MUSIC OFF' : 'TURN MUSIC ON') :
             selectedItem === 6 ? (player.settings.haptics ? 'TURN HAPTICS OFF' : 'TURN HAPTICS ON') :
             selectedItem === 7 ? (player.settings.reducedEffects ? 'TURN REDUCED EFFECTS OFF' : 'TURN REDUCED EFFECTS ON') :
             selectedItem === 9 ? (player.settings.notifications ? 'TURN NOTIFICATIONS OFF' : 'TURN NOTIFICATIONS ON') :
             'NO ACTION AVAILABLE'}
          </button>
        )}

        {module === 'reward' && (
          <button
            type="button"
            className="nr-module-claim"
            disabled={!canClaimReward}
            onClick={onClaimReward}
          >
            {canClaimReward
              ? 'CLAIM REWARD // +500 COINS'
              : 'CLAIMED // COME BACK TOMORROW'}
          </button>
        )}

        <div className="nr-module-footer">
          <span>
            {selectedItem === null
              ? 'NEON RUSH // MODULE ONLINE'
              : 'ACTION READY // SELECTED'}
          </span>

          <button
            type="button"
            onClick={onClose}
          >
            RETURN
          </button>
        </div>
      </div>
    </div>
  );
}


















