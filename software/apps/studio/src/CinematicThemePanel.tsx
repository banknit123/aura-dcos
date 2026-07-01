import React, { useMemo, useState } from 'react';
import {
  createAuraCinematicEngine,
  type CinematicSurfaceRole,
  type CinematicThemeId,
} from '@aura-dcos/cinematic-engine';
import { type AuraCabinContext } from '@aura-dcos/digital-twin';
import { type DriverAttentionState } from '@aura-dcos/companion';

interface CinematicThemePanelProps {
  context: AuraCabinContext;
  risk: 'normal' | 'elevated' | 'critical';
  driverAttention: DriverAttentionState;
}

const surfaces: CinematicSurfaceRole[] = ['dashboard', 'windshield', 'roof', 'floor', 'projection'];

function recommendedTheme(context: AuraCabinContext, risk: 'normal' | 'elevated' | 'critical'): CinematicThemeId {
  if (risk === 'critical' || context.mode === 'safety') return 'rainSafety';
  if (context.mode === 'family') return 'familyGlow';
  if (context.mode === 'commute') return 'auroraDrive';
  if (context.mode === 'business') return 'executiveCalm';
  return 'oceanSerenity';
}

export function CinematicThemePanel({ context, risk, driverAttention }: CinematicThemePanelProps) {
  const engine = useMemo(() => createAuraCinematicEngine(), []);
  const [selectedTheme, setSelectedTheme] = useState<CinematicThemeId>(() => recommendedTheme(context, risk));
  const plans = surfaces.map((surfaceRole) => engine.render({
    theme: risk === 'critical' ? 'rainSafety' : selectedTheme,
    surfaceRole,
    vehicleState: context.vehicleState,
    speedKph: context.speedKph,
    weather: context.weather,
    driverAttention,
    childPresent: context.childPresent,
    risk,
  }));

  return (
    <section className="cinematic-theme-panel orchestration-panel">
      <p className="eyebrow">STU-2</p>
      <h2>Cinematic Experience Engine</h2>
      <p className="muted">Living cabin theme plans generated from speed, weather, risk, surface and driver workload.</p>

      <div className="actions two-col-actions">
        {engine.listThemes().map((theme) => (
          <button key={theme.id} onClick={() => setSelectedTheme(theme.id)}>
            {theme.name}
          </button>
        ))}
      </div>

      <div className="mini-grid">
        {plans.map((plan) => (
          <article key={plan.surfaceRole} className={`hardware-card ${plan.safeForDriver ? 'ready' : 'degraded'}`}>
            <strong>{plan.headline}</strong>
            <span>{plan.background}</span>
            <small>{plan.particleLayer}</small>
            <small>Motion {plan.motion} · Brightness {plan.brightness}% · {plan.safeForDriver ? 'driver-safe' : 'review for driving'}</small>
            {plan.notes.map((note) => <small key={note}>{note}</small>)}
          </article>
        ))}
      </div>
    </section>
  );
}
