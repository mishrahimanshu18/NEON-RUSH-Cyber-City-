import React from 'react';
import './HomeExtraOptions.css';

type HomeExtraOptionsProps = {
  onHoverboards?: () => void;
  onChallenges?: () => void;
  onCharacterChange?: () => void;
  onCityChange?: () => void;
};

type ExtraCardProps = {
  icon: string;
  eyebrow: string;
  title: string;
  detail: string;
  accent: 'cyan' | 'pink' | 'violet' | 'gold';
  onClick?: () => void;
};

function ExtraCard({
  icon,
  eyebrow,
  title,
  detail,
  accent,
  onClick,
}: ExtraCardProps) {
  return (
    <button
      type="button"
      className={`nr-extra-card nr-extra-${accent}`}
      onClick={onClick}
    >
      <span className="nr-extra-corner nr-extra-corner-tl" />
      <span className="nr-extra-corner nr-extra-corner-br" />

      <span className="nr-extra-icon">{icon}</span>

      <span className="nr-extra-content">
        <small>{eyebrow}</small>
        <strong>{title}</strong>
        <span>{detail}</span>
      </span>

      <span className="nr-extra-arrow">→</span>
    </button>
  );
}

export default function HomeExtraOptions({
  onHoverboards,
  onChallenges,
  onCharacterChange,
  onCityChange,
}: HomeExtraOptionsProps) {
  return (
    <section className="nr-extra-section">
      <div className="nr-extra-heading">
        <div>
          <span className="nr-extra-line" />
          <span>PERSONALIZATION // WORLD CONTROL</span>
        </div>
        <small>04 MODULES</small>
      </div>

      <div className="nr-extra-grid">
        <ExtraCard
          icon="▱"
          eyebrow="EQUIPMENT"
          title="HOVERBOARDS"
          detail="2 BOARDS AVAILABLE"
          accent="cyan"
          onClick={onHoverboards}
        />

        <ExtraCard
          icon="◈"
          eyebrow="OBJECTIVES"
          title="DAILY / WEEKLY"
          detail="3 CHALLENGES READY"
          accent="pink"
          onClick={onChallenges}
        />

        <ExtraCard
          icon="◎"
          eyebrow="RUNNER LOADOUT"
          title="CHARACTER CHANGE"
          detail="KAI / 2 SKINS"
          accent="violet"
          onClick={onCharacterChange}
        />

        <ExtraCard
          icon="⌁"
          eyebrow="DESTINATION"
          title="CITY CHANGE"
          detail="CYBER CITY // 01"
          accent="gold"
          onClick={onCityChange}
        />
      </div>
    </section>
  );
}
