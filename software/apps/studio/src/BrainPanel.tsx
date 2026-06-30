import { useMemo, useState } from 'react';
import { createAuraBrain, type BrainDecision, type BrainIntent, type BrainRisk } from '@aura-dcos/brain';
import type { DriverAttentionState } from '@aura-dcos/companion';
import type { AuraCabinContext } from '@aura-dcos/digital-twin';
import type { AuraSurface } from '@aura-dcos/surfaces';
import './brain.css';

interface BrainPanelProps {
  context: AuraCabinContext;
  surfaces: AuraSurface[];
  risk: BrainRisk;
  driverAttention: DriverAttentionState;
}

const intents: BrainIntent[] = ['welcome', 'navigate', 'entertain', 'assist', 'calm', 'emergency', 'unknown'];

export function BrainPanel({ context, surfaces, risk, driverAttention }: BrainPanelProps) {
  const brain = useMemo(() => createAuraBrain(), []);
  const [intent, setIntent] = useState<BrainIntent>('assist');
  const decision: BrainDecision = brain.decide({
    intent,
    risk,
    driverAttention,
    vehicleState: context.vehicleState,
    childPresent: context.childPresent,
    availableSurfaces: surfaces.map((surface) => surface.id),
  });

  return (
    <section className="brain-panel">
      <h2>AURA Brain</h2>
      <p className="muted">Safe intent reasoning and output planning.</p>

      <div className="director-state-buttons">
        {intents.map((nextIntent) => (
          <button key={nextIntent} onClick={() => setIntent(nextIntent)}>
            {nextIntent}
          </button>
        ))}
      </div>

      <article className={`brain-decision brain-${decision.risk}`}>
        <strong>{decision.summary}</strong>
        <small>Intent {decision.intent} · Risk {decision.risk} · Confidence {decision.confidence}%</small>
      </article>

      <div className="mini-grid">
        <article>
          <strong>Recommended Actions</strong>
          {decision.actions.map((action, index) => (
            <small key={`${action.kind}-${action.target}-${index}`}>{action.kind} → {action.target}: {String(action.value)}</small>
          ))}
        </article>
        <article>
          <strong>Blocked Actions</strong>
          {decision.blockedActions.length === 0 ? <small>None</small> : null}
          {decision.blockedActions.map((action, index) => (
            <small key={`${action.kind}-${action.target}-${index}`}>{action.kind} → {action.target}: {String(action.value)}</small>
          ))}
        </article>
      </div>
    </section>
  );
}
