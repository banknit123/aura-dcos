import { useEffect, useMemo, useState } from 'react';
import { createAuraProviderRegistry, MockVehicleAdapter, type VehicleSignal } from '@aura-dcos/integrations';
import { createAuraVehicleSimulator, type SimulatorFrame, type SimulatorScenario } from '@aura-dcos/simulator';
import type { AutonomySignal } from '@aura-dcos/autonomy';
import './simulator.css';

interface SimulatorPanelProps {
  onSignals: (signals: AutonomySignal[], source: string) => void;
}

type ReplaySpeed = 1 | 2 | 5;

async function toAutonomySignals(signals: VehicleSignal[]): Promise<AutonomySignal[]> {
  const registry = createAuraProviderRegistry({ vehicle: new MockVehicleAdapter(signals) });
  return registry.readAutonomySignals();
}

export function SimulatorPanel({ onSignals }: SimulatorPanelProps) {
  const simulator = useMemo(() => createAuraVehicleSimulator(), []);
  const scenarios = useMemo(() => simulator.listScenarios(), [simulator]);
  const [scenario, setScenario] = useState<SimulatorScenario>('parkedFamily');
  const [lastSignals, setLastSignals] = useState<VehicleSignal[]>([]);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<ReplaySpeed>(1);
  const [frameIndex, setFrameIndex] = useState(0);

  const frames = useMemo<SimulatorFrame[]>(() => simulator.framesFor(scenario), [simulator, scenario]);

  async function emitSignals(signals: VehicleSignal[], source: string): Promise<void> {
    setLastSignals(signals);
    onSignals(await toAutonomySignals(signals), source);
  }

  async function replayScenario(): Promise<void> {
    const replay = simulator.replay(scenario);
    await emitSignals(replay.signals, `simulator.${scenario}.instant`);
  }

  async function emitFrame(index: number): Promise<void> {
    const frame = frames[index];
    if (!frame) {
      setPlaying(false);
      setFrameIndex(0);
      return;
    }
    await emitSignals(frame.signals, `simulator.${scenario}.frame.${index + 1}`);
  }

  function startReplay(): void {
    setFrameIndex(0);
    setPlaying(true);
  }

  function stopReplay(): void {
    setPlaying(false);
    setFrameIndex(0);
  }

  useEffect(() => {
    if (!playing) return;
    const currentFrame = frames[frameIndex];
    if (!currentFrame) {
      stopReplay();
      return;
    }

    const timeoutMs = frameIndex === 0
      ? 0
      : Math.max(0, (currentFrame.atMs - (frames[frameIndex - 1]?.atMs ?? 0)) / speed);

    const timer = window.setTimeout(() => {
      void emitFrame(frameIndex);
      setFrameIndex((previous) => previous + 1);
    }, timeoutMs);

    return () => window.clearTimeout(timer);
  }, [playing, frameIndex, frames, speed]);

  async function injectFatigue(): Promise<void> {
    const signal: VehicleSignal = {
      id: 'fatigue',
      kind: 'fatigue',
      value: true,
      confidence: 90,
      timestamp: new Date().toISOString(),
    };
    await emitSignals([signal], 'simulator.fault.fatigue');
  }

  return (
    <section className="simulator-panel">
      <h2>Vehicle + Sensor Simulator</h2>
      <p className="muted">Phase P replays development vehicle streams through Integrations, Autonomy and AURA Brain.</p>

      <label className="simulator-field">
        Scenario
        <select value={scenario} onChange={(event) => { setScenario(event.currentTarget.value as SimulatorScenario); stopReplay(); }}>
          {scenarios.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>

      <label className="simulator-field">
        Replay speed
        <select value={speed} onChange={(event) => setSpeed(Number(event.currentTarget.value) as ReplaySpeed)}>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={5}>5x</option>
        </select>
      </label>

      <div className="simulator-actions">
        <button onClick={() => void replayScenario()}>Replay Instant</button>
        <button onClick={startReplay} disabled={playing}>Play Stream</button>
        <button onClick={stopReplay} disabled={!playing}>Stop</button>
        <button onClick={() => void injectFatigue()}>Inject Fatigue Fault</button>
      </div>

      <small className="simulator-status">{playing ? `Streaming frame ${Math.min(frameIndex + 1, frames.length)} of ${frames.length}` : `${frames.length} frames ready`}</small>

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
