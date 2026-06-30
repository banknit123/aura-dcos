import { useMemo, useState } from 'react';
import {
  createAuraAutonomyEngine,
  type AutonomyCabinSnapshot,
  type AutonomyCycleResult,
  type AutonomySignal,
} from '@aura-dcos/autonomy';
import type { AuraSurface } from '@aura-dcos/surfaces';
import type { AuraCabinContext } from '@aura-dcos/digital-twin';
import type { DriverAttentionState } from '@aura-dcos/companion';
import './autonomy.css';

interface AutonomyPanelProps {
  context: AuraCabinContext;
  surfaces: AuraSurface[];
  driverAttention: DriverAttentionState;
  onAutonomyDecision: (result: AutonomyCycleResult) => void;
}

function timestamp(): string {
  return new Date().toISOString();
}

export function AutonomyPanel({ context, surfaces, driverAttention, onAutonomyDecision }: AutonomyPanelProps) {
  const engine = useMemo(() => createAuraAutonomyEngine(), []);
  const [result, setResult] = useState<AutonomyCycleResult | null>(null);
  const [fatigueSignal, setFatigueSignal] = useState(false);
  const [comfortPreference, setComfortPreference] = useState('soft blue ambience');

  function snapshot(): AutonomyCabinSnapshot {
    return {
      vehicleState: context.vehicleState,
      speedKph: context.speedKph,
      weather: context.weather,
      driverAttention,
      childPresent: context.childPresent,
      occupants: context.occupants,
      availableSurfaces: surfaces.map((surface) => surface.id),
    };
  }

  function buildSignals(): AutonomySignal[] {
    const signals: AutonomySignal[] = [
      { id: 'system-heartbeat', kind: 'system', value: true, confidence: 100, timestamp: timestamp() },
    ];

    if (context.vehicleState === 'parked') {
      signals.push({ id: 'entry-detected', kind: 'occupant', value: true, confidence: 92, timestamp: timestamp() });
    }

    if (fatigueSignal) {
      signals.push({ id: 'fatigue', kind: 'occupant', value: true, confidence: 82, timestamp: timestamp() });
    }

    if (comfortPreference.trim()) {
      signals.push({ id: 'comfort-preference', kind: 'occupant', value: comfortPreference.trim(), confidence: 80, timestamp: timestamp() });
    }

    return signals;
  }

  function runCycle(): void {
    const next = engine.runCycle(snapshot(), buildSignals());
    setResult(next);
    onAutonomyDecision(next);
  }

  function resetMemory(): void {
    engine.resetMemory();
    setResult(null);
  }

  return (
    <section className="autonomy-panel">
      <h2>Autonomous Cabin Intelligence</h2>
      <p className="muted">Phase N runs a context-aware autonomy cycle, stores cabin memory and routes decisions through AURA Brain.</p>

      <label className="autonomy-toggle">
        <input type="checkbox" checked={fatigueSignal} onChange={(event) => setFatigueSignal(event.currentTarget.checked)} />
        Simulate driver fatigue signal
      </label>

      <label className="autonomy-field">
        Remember comfort preference
        <input value={comfortPreference} onChange={(event) => setComfortPreference(event.currentTarget.value)} />
      </label>

      <div className="autonomy-actions">
        <button onClick={runCycle}>Run Autonomy Cycle</button>
        <button onClick={resetMemory}>Reset Memory</button>
      </div>

      {result ? (
        <div className={`autonomy-result risk-${result.risk}`}>
          <strong>{result.inferredIntent} · {result.risk}</strong>
          <small>Brain confidence {result.brainDecision.confidence}% · {result.brainDecision.summary}</small>

          <div className="autonomy-list">
            {result.suggestions.map((suggestion) => (
              <article key={suggestion.id}>
                <strong>{suggestion.title}</strong>
                <p>{suggestion.message}</p>
                <small>{suggestion.urgency} · {suggestion.confidence}% · {suggestion.reason}</small>
              </article>
            ))}
          </div>

          <div className="autonomy-memory">
            <strong>Memory</strong>
            {result.memory.length === 0 ? <small>No memory yet.</small> : result.memory.map((item) => (
              <small key={item.key}>{item.scope}: {item.key} = {item.value}</small>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
