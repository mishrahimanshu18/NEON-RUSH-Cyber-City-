import React, { useState } from 'react';
import './HomeModulePanel.css';

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
    status: '+250 COINS',
    accent: 'gold',
    items: ['DAY 01', '250 COINS', 'NEXT DROP: 24H'],
  },
  missions: {
    icon: '◈',
    eyebrow: 'ACTIVE OPS',
    title: 'MISSIONS',
    description: 'Complete objectives to earn coins and XP.',
    status: '3 ACTIVE',
    accent: 'cyan',
    items: ['COLLECT 500 COINS', 'RUN 2,000 METERS', 'PERFORM 20 JUMPS'],
  },
  achievements: {
    icon: '◆',
    eyebrow: 'MILESTONES',
    title: 'ACHIEVEMENTS',
    description: 'Track your runner milestones and unlocks.',
    status: '12 / 48',
    accent: 'pink',
    items: ['SCORE HUNTER', 'COMBO MASTER', 'COIN COLLECTOR'],
  },
  leaderboard: {
    icon: '♛',
    eyebrow: 'GLOBAL NETWORK',
    title: 'LEADERBOARD',
    description: 'Your competitive ranking will appear here.',
    status: '#2,481',
    accent: 'violet',
    items: ['GLOBAL', 'WEEKLY', 'PERSONAL BEST'],
  },
  shop: {
    icon: '▣',
    eyebrow: 'NEON MARKET',
    title: 'SHOP',
    description: 'Browse characters, skins, boards and cosmetics.',
    status: 'MARKET OPEN',
    accent: 'gold',
    items: ['CHARACTERS', 'HOVERBOARDS', 'TRAILS'],
  },
  characters: {
    icon: '◇',
    eyebrow: 'RUNNER LOADOUT',
    title: 'CHARACTERS',
    description: 'Customize Kai and manage unlocked skins.',
    status: '2 SKINS',
    accent: 'cyan',
    items: ['KAI // DEFAULT', 'CYBER KAI', 'LOCKED SLOTS'],
  },
  events: {
    icon: '◉',
    eyebrow: 'LIMITED TIME',
    title: 'EVENTS',
    description: 'Special events and exclusive rewards.',
    status: 'LIVE',
    accent: 'cyan',
    items: ['NEON FESTIVAL', 'CYBER RACE', 'NEXUS INVASION'],
  },
  settings: {
    icon: '⚙',
    eyebrow: 'SYSTEM CONTROL',
    title: 'SETTINGS',
    description: 'Configure graphics, audio and controls.',
    status: 'READY',
    accent: 'violet',
    items: ['GRAPHICS', 'AUDIO', 'CONTROLS'],
  },
  notifications: {
    icon: '◌',
    eyebrow: 'INCOMING DATA',
    title: 'NOTIFICATIONS',
    description: 'Recent game activity and alerts.',
    status: '03 NEW',
    accent: 'pink',
    items: ['DAILY REWARD READY', 'NEW CHALLENGE', 'EVENT UPDATE'],
  },
  tutorial: {
    icon: '?',
    eyebrow: 'NEW RUNNER',
    title: 'TUTORIAL',
    description: 'Learn the essential Cyber City controls.',
    status: '6 STEPS',
    accent: 'cyan',
    items: ['LANE SWITCH', 'JUMP / SLIDE', 'COINS / POWER-UPS'],
  },
  story: {
    icon: '▤',
    eyebrow: 'CYBER CITY',
    title: 'STORY / CHAPTERS',
    description: 'Follow Kai through the Cyber City story.',
    status: 'CHAPTER 01',
    accent: 'gold',
    items: ['THE ESCAPE', 'CYBER TUNNELS', 'SKY CITY'],
  },
  hoverboards: {
    icon: '▱',
    eyebrow: 'EQUIPMENT',
    title: 'HOVERBOARDS',
    description: 'Select futuristic boards and cosmetic trails.',
    status: '2 AVAILABLE',
    accent: 'cyan',
    items: ['NEON BOARD', 'THUNDER BOARD', 'LOCKED BOARD'],
  },
  challenges: {
    icon: '◈',
    eyebrow: 'OBJECTIVES',
    title: 'DAILY / WEEKLY',
    description: 'Complete rotating challenges for bonus rewards.',
    status: '3 READY',
    accent: 'pink',
    items: ['DAILY RUN', 'WEEKLY SCORE', 'COMBO TARGET'],
  },
  'character-change': {
    icon: '◎',
    eyebrow: 'RUNNER LOADOUT',
    title: 'CHARACTER CHANGE',
    description: 'Change your active runner appearance.',
    status: 'KAI ACTIVE',
    accent: 'violet',
    items: ['KAI', 'CYBER KAI', 'MORE COMING SOON'],
  },
  'city-change': {
    icon: '⌁',
    eyebrow: 'DESTINATION',
    title: 'CITY CHANGE',
    description: 'Choose the world for your next run.',
    status: 'CITY 01',
    accent: 'gold',
    items: ['NEON CITY', 'CYBER TUNNELS', 'SKY CITY'],
  },
};

type HomeModulePanelProps = {
  module: HomeModuleKey | null;
  onClose: () => void;
};

export default function HomeModulePanel({
  module,
  onClose,
}: HomeModulePanelProps) {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  if (!module) return null;

  const data = modules[module];

  const handleItemClick = (index: number) => {
    setSelectedItem(index);
  };

  return (
    <div className="nr-module-overlay" onClick={onClose}>
      <div
        className={`nr-module-panel nr-module-${data.accent}`}
        onClick={(event) => event.stopPropagation()}
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
          <span className="nr-module-icon">{data.icon}</span>

          <div>
            <small>{data.eyebrow}</small>
            <h2>{data.title}</h2>
          </div>
        </div>

        <p className="nr-module-description">{data.description}</p>

        <div className="nr-module-status">
          <span>{selectedItem === null ? 'STATUS' : 'SELECTED'}</span>
          <strong>
            {selectedItem === null
              ? data.status
              : data.items[selectedItem]}
          </strong>
        </div>

        <div className="nr-module-list">
          {data.items.map((item, index) => (
            <button
              type="button"
              className={`nr-module-item ${
                selectedItem === index ? 'nr-module-item-active' : ''
              }`}
              key={item}
              onClick={() => handleItemClick(index)}
            >
              <span>0{index + 1}</span>
              <strong>{item}</strong>
              <b>{selectedItem === index ? '✓' : '›'}</b>
            </button>
          ))}
        </div>

        <div className="nr-module-footer">
          <span>
            {selectedItem === null
              ? 'NEON RUSH // MODULE ONLINE'
              : 'ACTION READY // SELECTED'}
          </span>

          <button type="button" onClick={onClose}>
            RETURN
          </button>
        </div>
      </div>
    </div>
  );
}
