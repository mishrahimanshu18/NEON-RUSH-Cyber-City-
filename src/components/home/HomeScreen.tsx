import React, { useState } from 'react';
import './HomeScreen.css';
import HomeExtraOptions from './HomeExtraOptions';
import HomeLiveStatus from './HomeLiveStatus';
import HomeModulePanel, { HomeModuleKey } from './HomeModulePanel';

type HomeScreenProps = {
    player?: import('../../game/types').PlayerState;
  coins: number;
  level: number;
  score: number;
  onPlay: () => void;
  onDailyReward: () => void;
  canClaimReward: boolean;
  onProfile: () => void;
};

type FeatureCardProps = {
  icon: string;
  label: string;
  title: string;
  value: string;
  accent: 'cyan' | 'pink' | 'violet' | 'gold' | 'blue';
  onClick?: () => void;
};

function FeatureCard({
  icon,
  label,
  title,
  value,
  accent,
  onClick,
}: FeatureCardProps) {
  return (
    <button
      type="button"
      className={`nr-feature-card nr-accent-${accent}`}
      onClick={onClick}
    >
      <span className="nr-feature-corner nr-feature-corner-tl" />
      <span className="nr-feature-corner nr-feature-corner-br" />
      <div className="nr-feature-icon">{icon}</div>

      <div className="nr-feature-copy">
        <span className="nr-feature-label">{label}</span>
        <strong>{title}</strong>
        <span className="nr-feature-value">{value}</span>
      </div>

      <span className="nr-feature-arrow">›</span>
    </button>
  );
}

export default function HomeScreen({
  coins,
  level,
  score,
  onPlay,
  onDailyReward,
  canClaimReward,
  onProfile,
}: HomeScreenProps) {
  const xp = Math.min(100, (coins % 10) * 10);

  const [activeModule, setActiveModule] =
    useState<HomeModuleKey | null>(null);

  const openModule = (module: HomeModuleKey) => {
    setActiveModule(module);
  };

  return (
    <section className="nr-home">
      <div className="nr-noise" />
      <div className="nr-grid" />
      <div className="nr-scanlines" />

      <div className="nr-city-glow nr-city-glow-cyan" />
      <div className="nr-city-glow nr-city-glow-pink" />

      <header className="nr-topbar">
        <div className="nr-system-status">
          <span className="nr-status-dot" />
          SYSTEM ONLINE
        </div>

        <div className="nr-world-id">
          <span>NR-01</span>
          <b>CYBER CITY</b>
        </div>

        <button
          type="button"
          className="nr-profile-mini"
          onClick={onProfile}
        >
          <span className="nr-avatar">K</span>
          <span>
            <small>RUNNER</small>
            <strong>PLAYER 01</strong>
          </span>
        </button>
      </header>

      <div className="nr-home-content">
        <div className="nr-brand">
          <span className="nr-brand-line">
            NEON RUSH // PROTOCOL 01
          </span>

          <h1>
            NEON
            <span>RUSH</span>
          </h1>

          <p>CYBER CITY / ENDLESS RUN PROTOCOL</p>
        </div>

        <div className="nr-main-layout">
          <div className="nr-character-zone">
            <div className="nr-character-ring nr-ring-one" />
            <div className="nr-character-ring nr-ring-two" />
            <div className="nr-energy-orbit nr-orbit-one" />
            <div className="nr-energy-orbit nr-orbit-two" />

            <div className="nr-character">
              <div className="nr-character-head" />
              <div className="nr-character-body" />
              <div className="nr-character-arm nr-arm-left" />
              <div className="nr-character-arm nr-arm-right" />
              <div className="nr-character-leg nr-leg-left" />
              <div className="nr-character-leg nr-leg-right" />
              <div className="nr-character-glow" />
            </div>

            <div className="nr-character-tag">
              <span>KAI</span>
              <small>CYBER RUNNER</small>
            </div>
          </div>

          <div className="nr-control-zone">
            <div className="nr-level-panel">
              <div className="nr-level-head">
                <div>
                  <span>RUNNER LEVEL</span>
                  <strong>LVL {level}</strong>
                </div>

                <span>{xp}% XP</span>
              </div>

              <div className="nr-xp-track">
                <div
                  className="nr-xp-fill"
                  style={{ width: `${xp}%` }}
                />
              </div>

              <div className="nr-level-meta">
                <span>XP PROGRESS</span>
                <span>{xp}/100</span>
              </div>
            </div>

            <button
              type="button"
              className="nr-start-btn"
              onClick={onPlay}
            >
              <span className="nr-start-small">READY TO RUN?</span>
              <strong>START RUN</strong>
              <span className="nr-start-arrow">→</span>
            </button>

            <button
              type="button"
              className="nr-daily-btn"
              onClick={() => openModule('reward')}
            >
              <span className="nr-daily-icon">◈</span>

              <span>
                <small>DAILY DROP</small>
                <strong>
                  {canClaimReward
                    ? 'CLAIM REWARD'
                    : 'REWARD CLAIMED'}
                </strong>
              </span>

              <b>{canClaimReward ? '+500' : '24H'}</b>
            </button>
          </div>
        </div>

        <div className="nr-feature-grid">
          <FeatureCard
            icon="◈"
            label="ACTIVE OPS"
            title="MISSIONS"
            value="3 ACTIVE"
            accent="cyan"
            onClick={() => openModule('missions')}
          />

          <FeatureCard
            icon="◆"
            label="MILESTONES"
            title="ACHIEVEMENTS"
            value="12 / 48"
            accent="pink"
            onClick={() => openModule('achievements')}
          />

          <FeatureCard
            icon="♛"
            label="GLOBAL"
            title="LEADERBOARD"
            value="#2,481"
            accent="violet"
            onClick={() => openModule('leaderboard')}
          />

          <FeatureCard
            icon="▣"
            label="MARKET"
            title="SHOP"
            value={`${coins.toLocaleString()} COINS`}
            accent="gold"
            onClick={() => openModule('shop')}
          />

          <FeatureCard
            icon="◇"
            label="LOADOUT"
            title="CHARACTERS"
            value="KAI / 2 SKINS"
            accent="blue"
            onClick={() => openModule('characters')}
          />
        </div>

        <div className="nr-secondary-grid">
          <button
            type="button"
            className="nr-secondary-card nr-secondary-cyan"
            onClick={() => openModule('events')}
          >
            <span className="nr-secondary-icon">◉</span>
            <span>
              <small>LIMITED TIME</small>
              <strong>EVENTS</strong>
            </span>
            <b>LIVE</b>
          </button>

          <button
            type="button"
            className="nr-secondary-card nr-secondary-violet"
            onClick={() => openModule('settings')}
          >
            <span className="nr-secondary-icon">⚙</span>
            <span>
              <small>SYSTEM CONTROL</small>
              <strong>SETTINGS</strong>
            </span>
            <b>›</b>
          </button>

          <button
            type="button"
            className="nr-secondary-card nr-secondary-pink"
            onClick={() => openModule('notifications')}
          >
            <span className="nr-secondary-icon">◌</span>
            <span>
              <small>INCOMING DATA</small>
              <strong>NOTIFICATIONS</strong>
            </span>
            <b>03</b>
          </button>

          <button
            type="button"
            className="nr-secondary-card nr-secondary-blue"
            onClick={() => openModule('tutorial')}
          >
            <span className="nr-secondary-icon">?</span>
            <span>
              <small>NEW RUNNER</small>
              <strong>TUTORIAL</strong>
            </span>
            <b>START</b>
          </button>

          <button
            type="button"
            className="nr-secondary-card nr-secondary-gold"
            onClick={() => openModule('story')}
          >
            <span className="nr-secondary-icon">▤</span>
            <span>
              <small>CYBER CITY</small>
              <strong>STORY / CHAPTERS</strong>
            </span>
            <b>01</b>
          </button>
        </div>

        <HomeLiveStatus
          level={level}
          coins={coins}
          score={score}
        />

        <HomeExtraOptions
          onHoverboards={() => openModule('hoverboards')}
          onChallenges={() => openModule('challenges')}
          onCharacterChange={() => openModule('character-change')}
          onCityChange={() => openModule('city-change')}
        />

        <HomeModulePanel
          module={activeModule}
          onClose={() => setActiveModule(null)}
          onClaimReward={onDailyReward}
          canClaimReward={canClaimReward}
        />

        <div className="nr-bottom-bar">
          <div>
            <span className="nr-bottom-dot" />
            NETWORK STABLE
          </div>

          <span>CYBER CITY // SECTOR 01</span>
          <span>BUILD 1.0.0</span>
        </div>
      </div>
    </section>
  );
}



