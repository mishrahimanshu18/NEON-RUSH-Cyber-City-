import React from 'react';
import { levelFromXP } from '../../game/data';
import './HomeLiveStatus.css';

type HomeLiveStatusProps = {
  level?: number;
  xp?: number;
  coins?: number;
  score?: number;
};

export default function HomeLiveStatus({
  level = 1,
  xp = 0,
  coins = 0,
  score = 0,
}: HomeLiveStatusProps) {
  const levelInfo = levelFromXP(xp);
  const xpProgress = Math.round(levelInfo.progress * 100);
  const displayLevel = levelInfo.level || level;

  const streak = 7;

  return (
    <section className="nr-live-status">
      <div className="nr-status-head">
        <div>
          <span className="nr-status-line" />
          <span>RUNNER STATUS // LIVE DATA</span>
        </div>
        <span className="nr-status-live">
          <i />
          ONLINE
        </span>
      </div>

      <div className="nr-status-grid">
        <div className="nr-status-main">
          <div className="nr-runner-row">
            <div className="nr-runner-avatar">
              K
              <span>01</span>
            </div>

            <div className="nr-runner-info">
              <small>ACTIVE RUNNER</small>
              <strong>KAI // CYBER RUNNER</strong>

              <div className="nr-xp-label">
                <span>LEVEL {displayLevel}</span>
                <span>{xpProgress}% XP</span>
              </div>

              <div className="nr-xp-track">
                <span style={{ width: `${xpProgress}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="nr-stat-box nr-stat-cyan">
          <small>COINS</small>
          <strong>{coins.toLocaleString()}</strong>
          <span>ENERGY UNITS</span>
        </div>

        <div className="nr-stat-box nr-stat-pink">
          <small>HIGH SCORE</small>
          <strong>{score.toLocaleString()}</strong>
          <span>BEST RUN</span>
        </div>

        <div className="nr-stat-box nr-stat-gold">
          <small>STREAK</small>
          <strong>{streak}</strong>
          <span>DAYS ACTIVE</span>
        </div>
      </div>
    </section>
  );
}
