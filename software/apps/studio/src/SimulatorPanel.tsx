import { useMemo, useState } from 'react';
import { createAuraProviderRegistry, MockVehicleAdapter, type VehicleSignal } from '@aura-dcos/integrations';
import { createAuraVehicleSimulator, type SimulatorScenario } from '@aura-dcos/simulator';
import type { AutonomySignal } from '@aura-dcos/autonomy';
import './simulator.css';

interface SimulatorPanelProps {
  onSignals: (signals: AutonomySignal[], source: string) => void;
}

export function SimulatorPanel({ onSignals }: SimulatorPanelProps) {
  const simulator = useMemo(() => createAuraVehicleSimulator(), []);
  const scenarios = useMemo(() => simulator.listScenarios(), [simulator]);
  const [scenario, setScenario] = useState<SimulatorScenario>('parkedFamily');
  const [lastSignals, setLastSignals] = useState<VehicleSignal[]>([]);

  async function replayScenario(): Promise<void> {
    const replay = simulator.replay(scenario);
    setLastSignals(replay.signals);
    const registry = createAuraProviderRegistry({ vehicle: new MockVehicleAdapter(replay.signals) });
    const autonomySignals = await registry.readAutonomySignals();
    onSignals(autonomySignals, `simulator.${scenario}`);
  }

  async function injectFatigue(): Promise<void> {
    const signal: VehicleSignal = {
      id: 'fatigue',
      kind: 'fatigue',
      value: true,
      confidence: 90,
      timestamp: new Date().toISOString(),
    };
    setLastSignals([signal]);
    const registry = createAuraProviderRegistry({ vehicle: new MockVehicleAdapter([signal]) });
    onSignals(await registry.readAutonomySignals(), 'simulator.fault.fatigue');
  }

  return (
    <section className="simulator-panel">
      <h2>Vehicle + Sensor Simulator</h2>
      <p className="muted">Phase P replays development vehicle streams through Integrations, Autonomy and AURA Brain.</p>

      <label className="simulator-field">
        Scenario
        <select value={scenario} onChange={(event) => setScenario(event.currentTarget.value as SimulatorScenario)}>
          {scenarios.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>

      <div className="simulator-actions">
        <button onClick={() => void replayScenario()}>Replay Scenario</button>
        <button onClick={() => void injectFatigue()}>Inject Fatigue Fault</button>
      </div>

      {lastSignals.length > 0 ? (
        <div className="simulator-signals">
          <strong>Last replayed signals</strong>
          {lastSignals.map((signal, index) => (
            <small key={`${signal.id}-${index}`}>{signal.kind}: {String(signal.value)} · {signal.confidence}%</small>
          ))}
        </div>
      ) : null}
    </section>
  );
}
