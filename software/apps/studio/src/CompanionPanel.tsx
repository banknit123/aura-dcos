import { useMemo } from 'react';
import { createAuraCompanionEngine, type CompanionState, type DriverAttentionState } from '@aura-dcos/companion';
import './companion.css';

interface CompanionPanelProps {
  driverAttention: DriverAttentionState;
  childPresent: boolean;
  emergencyActive: boolean;
  onAttentionChange: (attention: DriverAttentionState) => void;
  onCompanionState: (state: CompanionState) => void;
}

const attentionStates: DriverAttentionState[] = ['parked', 'lowLoad', 'mediumLoad', 'highLoad', 'critical'];

export function CompanionPanel({ driverAttention, childPresent, emergencyActive, onAttentionChange, onCompanionState }: CompanionPanelProps) {
  const engine = useMemo(() => createAuraCompanionEngine(), []);
  const state = engine.evaluate({ driverAttention, childPresent, emergencyActive });

  function publishState(): void {
    onCompanionState(state);
  }

  return (
    <section className="companion-panel">
      <h2>AURA Companion</h2>
      <p className="muted">Driver-safe companion state model.</p>

      <article className={`companion-card companion-${state.mood}`}>
        <strong>{state.name}</strong>
        <small>{state.mode} · {state.mood}</small>
        <p>{state.message}</p>
        <small>Motion {state.animationLevel}% · Visual {state.allowVisualMotion ? 'on' : 'off'} · Speech {state.allowSpeech ? 'on' : 'off'}</small>
      </article>

      <div className="director-state-buttons">
        {attentionStates.map((attention) => (
          <button key={attention} onClick={() => onAttentionChange(attention)}>
            {attention}
          </button>
        ))}
      </div>

      <button onClick={publishState}>Send to AURA Projection</button>
    </section>
  );
}
