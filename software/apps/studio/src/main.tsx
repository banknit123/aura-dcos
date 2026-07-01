import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createAuraAutonomyEngine, type AutonomyCycleResult, type AutonomySignal } from '@aura-dcos/autonomy';
import { type BrainDecision } from '@aura-dcos/brain';
import { type CompanionState, type DriverAttentionState } from '@aura-dcos/companion';
import { createAuraDigitalTwin, type AuraCabinContext } from '@aura-dcos/digital-twin';
import { type ExperienceScene } from '@aura-dcos/experience-director';
import { createAuraSurfaceRegistry, type AuraSurface, type SurfaceState } from '@aura-dcos/surfaces';
import { type SafeVoiceResponse } from '@aura-dcos/voice-bridge';
import { AuraDirector } from './AuraDirector';
import { AutonomyPanel } from './AutonomyPanel';
import { BrainPanel } from './BrainPanel';
import { CalibrationOutput } from './CalibrationOutput';
import { CompanionPanel } from './CompanionPanel';
import { ExperienceDirectorPanel, type ExperienceSceneState } from './ExperienceDirectorPanel';
import { OrchestrationPanel } from './OrchestrationPanel';
import { OutputManagerPanel } from './OutputManagerPanel';
import { ProfilePanel, type StudioProfileData } from './ProfilePanel';
import { SimulatorPanel } from './SimulatorPanel';
import { VehicleIntegrationPanel } from './VehicleIntegrationPanel';
import { VoiceBridgePanel } from './VoiceBridgePanel';
import './styles.css';

interface EventEntry {
  timestamp: string;
  type: string;
  source: string;
  message: string;
}

type OutputRoute = 'controller' | 'dashboard' | 'roof' | 'projection' | 'floor' | 'calibration';

interface StudioSharedState {
  context: AuraCabinContext;
  surfaces: AuraSurface[];
  companion: CompanionState;
  driverAttention: DriverAttentionState;
  updatedAt: string;
}

const STORAGE_KEY = 'aura-dcos-studio-state';
const CHANNEL_NAME = 'aura-dcos-studio-channel';

const initialContext: AuraCabinContext = {
  mode: 'family',
  vehicleState: 'parked',
  speedKph: 0,
  weather: 'clear',
  occupants: 3,
  childPresent: true,
};

const initialCompanion: CompanionState = {
  name: 'AURA',
  mood: 'friendly',
  mode: 'visual',
  message: 'Family mode active.',
  animationLevel: 70,
  allowVisualMotion: true,
  allowSpeech: true,
};

const initialSurfaces: AuraSurface[] = [
  { id: 'dashboard', name: 'Dashboard', kind: 'dashboard', state: 'informative', energy: 80, visibleToDriver: true, priority: 'high' },
  { id: 'windshield', name: 'AR Windshield', kind: 'windshield', state: 'informative', energy: 70, visibleToDriver: true, priority: 'critical' },
  { id: 'roof', name: 'Digital Roof', kind: 'roof', state: 'ambient', energy: 35, visibleToDriver: false, priority: 'medium' },
  { id: 'floor', name: 'Digital Floor', kind: 'floor', state: 'ambient', energy: 30, visibleToDriver: false, priority: 'medium' },
  { id: 'projection', name: 'AURA Presence', kind: 'projection', state: 'interactive', energy: 55, visibleToDriver: true, priority: 'medium' },
];

function now(): string {
  return new Date().toLocaleTimeString();
}

function currentRoute(): OutputRoute {
  const route = new URLSearchParams(window.location.search).get('output');
  if (route === 'dashboard' || route === 'roof' || route === 'projection' || route === 'floor' || route === 'calibration') return route;
  return 'controller';
}

function defaultState(): StudioSharedState {
  return {
    context: initialContext,
    surfaces: initialSurfaces,
    companion: initialCompanion,
    driverAttention: 'parked',
    updatedAt: new Date().toISOString(),
  };
}

function normaliseState(state: Partial<StudioSharedState>): StudioSharedState {
  return {
    ...defaultState(),
    ...state,
    context: state.context ?? initialContext,
    surfaces: state.surfaces ?? initialSurfaces,
    companion: state.companion ?? initialCompanion,
    driverAttention: state.driverAttention ?? 'parked',
  };
}

function readSharedState(): StudioSharedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normaliseState(JSON.parse(raw) as Partial<StudioSharedState>) : defaultState();
  } catch {
    return defaultState();
  }
}

function saveSharedState(state: StudioSharedState, channel?: BroadcastChannel): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  channel?.postMessage(state);
}

function createInitialSurfaceRegistry(surfaces: AuraSurface[]) {
  const registry = createAuraSurfaceRegistry();
  for (const surface of surfaces) registry.register(surface);
  return registry;
}

function riskLevel(context: AuraCabinContext): 'normal' | 'elevated' | 'critical' {
  return createAuraDigitalTwin(context).riskLevel();
}

function applySafetyRules(surfaces: AuraSurface[], risk: 'normal' | 'elevated' | 'critical'): AuraSurface[] {
  if (risk === 'normal') return surfaces;
  return surfaces.map((surface): AuraSurface => {
    if (!surface.visibleToDriver) return { ...surface, state: 'ambient', energy: Math.min(surface.energy, risk === 'critical' ? 10 : 25) };
    if (risk === 'critical') return { ...surface, state: surface.id === 'projection' ? 'off' : 'emergency', energy: surface.id === 'projection' ? 0 : 95 };
    return { ...surface, energy: Math.min(85, Math.max(surface.energy, 60)) };
  });
}

function contextFromSignals(context: AuraCabinContext, signals: AutonomySignal[]): AuraCabinContext {
  let next = { ...context };
  for (const signal of signals) {
    if (signal.id === 'speed' && typeof signal.value === 'number') {
      next = { ...next, speedKph: signal.value, vehicleState: signal.value > 0 ? 'driving' : 'parked' };
    }
    if (signal.id === 'weather-rain' && signal.value === 'rain') {
      next = { ...next, weather: 'rain' };
    }
  }
  return next;
}

function applyBrainDecisionToState(base: StudioSharedState, decision: BrainDecision): StudioSharedState {
  let nextSurfaces = [...base.surfaces];
  let nextCompanion = { ...base.companion };

  for (const action of decision.actions) {
    if (action.kind === 'setSurfaceState' && typeof action.value === 'string') {
      nextSurfaces = nextSurfaces.map((surface) => surface.id === action.target ? { ...surface, state: action.value as SurfaceState } : surface);
    }

    if (action.kind === 'reduceMotion') {
      nextSurfaces = nextSurfaces.map((surface) => action.target === 'all' || surface.id === action.target ? { ...surface, energy: Math.min(surface.energy, 25) } : surface);
    }

    if (action.kind === 'setCompanionMode' && typeof action.value === 'string') {
      const mode = action.value === 'friendly' ? 'visual' : action.value as CompanionState['mode'];
      nextCompanion = {
        ...nextCompanion,
        mode,
        mood: action.value === 'emergency' ? 'emergency' : action.value === 'voiceOnly' ? 'focused' : action.value === 'friendly' ? 'friendly' : nextCompanion.mood,
        allowVisualMotion: mode !== 'emergency' && mode !== 'voiceOnly',
        animationLevel: mode === 'emergency' || mode === 'voiceOnly' ? 0 : nextCompanion.animationLevel,
      };
    }

    if (action.kind === 'speak' || action.kind === 'showMessage') {
      nextCompanion = { ...nextCompanion, message: String(action.value) };
    }
  }

  return { ...base, surfaces: nextSurfaces, companion: nextCompanion, updatedAt: new Date().toISOString() };
}

function OutputShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="output-screen">
      <header>
        <p className="eyebrow">AURA Output</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </header>
      {children}
    </main>
  );
}

function DashboardOutput({ context, risk }: { context: AuraCabinContext; risk: string }) {
  return (
    <OutputShell title="Driver Dashboard" subtitle="Live driver-safe primary display output">
      <section className={`driver-cluster risk-${risk}`}>
        <div><span>Speed</span><strong>{context.speedKph}</strong><small>km/h</small></div>
        <div><span>Mode</span><strong>{context.mode}</strong><small>{context.vehicleState}</small></div>
        <div><span>Safety</span><strong>{risk}</strong><small>{context.weather}</small></div>
      </section>
    </OutputShell>
  );
}

function RoofOutput({ context, risk }: { context: AuraCabinContext; risk: string }) {
  return (
    <OutputShell title="Digital Roof" subtitle="Live immersive passenger ceiling output">
      <section className={`ambient-stage ${context.mode} risk-${risk}`}>
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="orb orb-c" />
        <p>{risk === 'critical' ? 'Safety-dimmed roof ambience' : `${context.mode} ambience active`}</p>
      </section>
    </OutputShell>
  );
}

function ProjectionOutput({ companion, risk }: { companion: CompanionState; risk: string }) {
  return (
    <OutputShell title="AURA Presence" subtitle="Live projection / virtual companion output">
      <section className={`aura-presence risk-${risk} companion-${companion.mood}`}>
        <div className="aura-avatar">A</div>
        <p>{companion.message}</p>
        <p className="muted">{companion.mode} · {companion.mood} · motion {companion.animationLevel}%</p>
      </section>
    </OutputShell>
  );
}

function FloorOutput({ risk }: { risk: string }) {
  return (
    <OutputShell title="Digital Floor" subtitle="Live guidance and emergency wayfinding output">
      <section className={`floor-path risk-${risk}`}>
        <div />
        <div />
        <div />
        <p>{risk === 'critical' ? 'Emergency exit path' : 'Welcome path active'}</p>
      </section>
    </OutputShell>
  );
}

function App() {
  const route = currentRoute();
  const [channel] = useState(() => (typeof BroadcastChannel === 'undefined' ? undefined : new BroadcastChannel(CHANNEL_NAME)));
  const [shared, setShared] = useState<StudioSharedState>(() => readSharedState());
  const [selectedSurfaceId, setSelectedSurfaceId] = useState('dashboard');
  const [autonomyEngine] = useState(() => createAuraAutonomyEngine());
  const [events, setEvents] = useState<EventEntry[]>([
    { timestamp: now(), type: 'kernel.running', source: 'studio', message: 'AURA DCOS Studio booted' },
  ]);

  useEffect(() => {
    if (!channel) return;
    channel.onmessage = (message) => setShared(normaliseState(message.data as Partial<StudioSharedState>));
    return () => channel.close();
  }, [channel]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setShared(readSharedState());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const risk = riskLevel(shared.context);
  const adjustedSurfaces = useMemo(() => applySafetyRules(shared.surfaces, risk), [shared.surfaces, risk]);

  if (route === 'dashboard') return <DashboardOutput context={shared.context} risk={risk} />;
  if (route === 'roof') return <RoofOutput context={shared.context} risk={risk} />;
  if (route === 'projection') return <ProjectionOutput companion={shared.companion} risk={risk} />;
  if (route === 'floor') return <FloorOutput risk={risk} />;
  if (route === 'calibration') return <CalibrationOutput />;

  function emit(type: string, message: string): void {
    setEvents((previous) => [{ timestamp: now(), type, source: 'studio', message }, ...previous].slice(0, 12));
  }

  function updateShared(next: StudioSharedState, eventType: string, message: string): void {
    setShared(next);
    saveSharedState(next, channel);
    emit(eventType, message);
  }

  function runScenario(mode: AuraCabinContext['mode'], vehicleState: AuraCabinContext['vehicleState'], speedKph: number, weather: AuraCabinContext['weather']): void {
    const next: StudioSharedState = { ...shared, context: { ...shared.context, mode, vehicleState, speedKph, weather }, updatedAt: new Date().toISOString() };
    updateShared(next, 'scenario.selected', `Broadcast ${mode} scenario to all outputs`);
  }

  function updateSurface(surfaceId: string, update: { state?: SurfaceState; energy?: number }): void {
    const registry = createInitialSurfaceRegistry(shared.surfaces);
    registry.update(surfaceId, update);
    const next: StudioSharedState = { ...shared, surfaces: registry.list(), updatedAt: new Date().toISOString() };
    updateShared(next, 'director.surface.updated', `Updated ${surfaceId} from AURA Director`);
  }

  function loadProfile(data: StudioProfileData): void {
    const next: StudioSharedState = { ...shared, context: data.context, surfaces: data.surfaces, updatedAt: new Date().toISOString() };
    updateShared(next, 'profile.loaded', 'Loaded saved AURA layout profile');
  }

  function updateDriverAttention(driverAttention: DriverAttentionState): void {
    const next: StudioSharedState = { ...shared, driverAttention, updatedAt: new Date().toISOString() };
    updateShared(next, 'companion.attention.changed', `Driver attention changed to ${driverAttention}`);
  }

  function updateCompanion(companion: CompanionState): void {
    const next: StudioSharedState = { ...shared, companion, updatedAt: new Date().toISOString() };
    updateShared(next, 'companion.state.updated', `AURA companion switched to ${companion.mode}`);
  }

  function applyExperienceScene(scene: ExperienceScene, sceneState: ExperienceSceneState): void {
    const next: StudioSharedState = { ...sceneState, updatedAt: new Date().toISOString() };
    updateShared(next, 'experience.scene.broadcast', `Experience scene active: ${scene.title}`);
  }

  function handleSafeVoiceResponse(response: SafeVoiceResponse): void {
    const nextCompanion: CompanionState = {
      ...shared.companion,
      message: response.text,
      mode: response.outputMode === 'silent' ? 'silent' : response.outputMode === 'textOnly' ? 'assistive' : response.outputMode === 'speech' ? 'voiceOnly' : 'assistive',
      mood: response.safety === 'blocked' ? 'alert' : response.safety === 'modified' ? 'focused' : shared.companion.mood,
      allowSpeech: response.outputMode === 'speech' || response.outputMode === 'speechAndText',
      allowVisualMotion: response.outputMode !== 'speech' && response.safety !== 'modified',
      animationLevel: response.safety === 'modified' ? 0 : shared.companion.animationLevel,
    };
    const next: StudioSharedState = { ...shared, companion: nextCompanion, updatedAt: new Date().toISOString() };
    updateShared(next, 'voice.safe-response.applied', `Voice Bridge response ${response.safety}: ${response.reason}`);
  }

  function executeBrainDecision(decision: BrainDecision): void {
    const next = applyBrainDecisionToState(shared, decision);
    updateShared(next, 'brain.decision.executed', `Applied Brain decision: ${decision.summary}`);
  }

  function handleAutonomyDecision(result: AutonomyCycleResult): void {
    executeBrainDecision(result.brainDecision);
    emit('autonomy.cycle.completed', `Autonomy inferred ${result.inferredIntent} with ${result.risk} risk and ${result.suggestions.length} suggestions`);
  }

  function handleSimulatorSignals(signals: AutonomySignal[], source: string): void {
    const nextContext = contextFromSignals(shared.context, signals);
    const result = autonomyEngine.runCycle({
      vehicleState: nextContext.vehicleState,
      speedKph: nextContext.speedKph,
      weather: nextContext.weather,
      driverAttention: shared.driverAttention,
      childPresent: nextContext.childPresent,
      occupants: nextContext.occupants,
      availableSurfaces: shared.surfaces.map((surface) => surface.id),
    }, signals);

    const simulatorState: StudioSharedState = { ...shared, context: nextContext, updatedAt: new Date().toISOString() };
    const next = applyBrainDecisionToState(simulatorState, result.brainDecision);
    updateShared(next, 'simulator.signals.applied', `${source} produced ${signals.length} signals and applied Brain decision: ${result.brainDecision.summary}`);
    emit('autonomy.cycle.completed', `Autonomy inferred ${result.inferredIntent} with ${result.risk} risk and ${result.suggestions.length} suggestions`);
  }

  function increaseRoofEnergy(): void {
    const registry = createInitialSurfaceRegistry(shared.surfaces);
    const roof = registry.get('roof');
    registry.update('roof', { energy: Math.min(100, roof.energy + 15), state: 'interactive' });
    const next: StudioSharedState = { ...shared, surfaces: registry.list(), updatedAt: new Date().toISOString() };
    updateShared(next, 'surface.energy.changed', 'Broadcast Digital Roof energy change');
  }

  function emergencyMode(): void {
    const next: StudioSharedState = {
      ...shared,
      context: { ...shared.context, mode: 'safety', vehicleState: 'driving', speedKph: 82, weather: 'rain' },
      driverAttention: 'critical',
      updatedAt: new Date().toISOString(),
    };
    updateShared(next, 'safety.envelope.critical', 'Broadcast critical safety mode to all outputs');
  }

  function openOutput(output: OutputRoute): void {
    window.open(`${window.location.origin}${window.location.pathname}?output=${output}`, '_blank', 'popup=yes,width=1280,height=720');
    emit('output.opened', `Opened ${output} output window`);
  }

  return (
    <main className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">AURA DCOS · Demo Ready</p>
          <h1>AURA Studio</h1>
          <p>Vehicle simulation, Voice, Autonomy, Brain and multi-surface outputs running through one local demo path.</p>
        </div>
        <div className={`risk risk-${risk}`}>Risk: {risk}</div>
      </header>

      <section className="grid">
        <section className="panel">
          <h2>Digital Twin Context</h2>
          <dl>
            <div><dt>Mode</dt><dd>{shared.context.mode}</dd></div>
            <div><dt>Vehicle</dt><dd>{shared.context.vehicleState}</dd></div>
            <div><dt>Speed</dt><dd>{shared.context.speedKph} km/h</dd></div>
            <div><dt>Weather</dt><dd>{shared.context.weather}</dd></div>
            <div><dt>Occupants</dt><dd>{shared.context.occupants}</dd></div>
            <div><dt>Child Present</dt><dd>{shared.context.childPresent ? 'Yes' : 'No'}</dd></div>
          </dl>
          <ExperienceDirectorPanel
            baseState={{ context: shared.context, surfaces: shared.surfaces, companion: shared.companion, driverAttention: shared.driverAttention }}
            onApplyScene={applyExperienceScene}
            onEvent={emit}
          />
          <div className="actions">
            <button onClick={() => runScenario('family', 'parked', 0, 'clear')}>Welcome / Family</button>
            <button onClick={() => runScenario('commute', 'driving', 48, 'clear')}>Commute</button>
            <button onClick={() => runScenario('business', 'driving', 65, 'rain')}>Business + Rain</button>
            <button onClick={emergencyMode}>Emergency Safety</button>
            <button onClick={() => openOutput('calibration')}>Open Calibration Grid</button>
          </div>
          <CompanionPanel
            driverAttention={shared.driverAttention}
            childPresent={shared.context.childPresent}
            emergencyActive={risk === 'critical'}
            onAttentionChange={updateDriverAttention}
            onCompanionState={updateCompanion}
          />
          <VoiceBridgePanel context={shared.context} risk={risk} driverAttention={shared.driverAttention} onSafeResponse={handleSafeVoiceResponse} />
          <SimulatorPanel onSignals={handleSimulatorSignals} />
          <AutonomyPanel context={shared.context} surfaces={shared.surfaces} driverAttention={shared.driverAttention} onAutonomyDecision={handleAutonomyDecision} />
          <BrainPanel context={shared.context} surfaces={shared.surfaces} risk={risk} driverAttention={shared.driverAttention} onExecuteDecision={executeBrainDecision} />
          <OrchestrationPanel />
        </section>

        <section className="panel cabin">
          <AuraDirector
            surfaces={shared.surfaces}
            selectedSurfaceId={selectedSurfaceId}
            onSelectSurface={setSelectedSurfaceId}
            onUpdateSurface={updateSurface}
          />
          <h2>Cabin Surfaces</h2>
          <div className="cabin-map">
            {adjustedSurfaces.map((surface) => (
              <article className={`surface state-${surface.state}`} key={surface.id}>
                <strong>{surface.name}</strong>
                <span>{surface.kind} · {surface.priority}</span>
                <meter min="0" max="100" value={surface.energy} />
                <small>Energy {surface.energy} · {surface.state}</small>
              </article>
            ))}
          </div>
          <button onClick={increaseRoofEnergy}>Increase Roof Energy</button>
          <VehicleIntegrationPanel requestedSurfaces={shared.surfaces.map((surface) => surface.id)} onEvent={emit} />
        </section>

        <section className="panel">
          <OutputManagerPanel baseUrl={`${window.location.origin}${window.location.pathname}`} onOpen={(plan) => openOutput(plan.role as OutputRoute)} />
          <ProfilePanel data={{ context: shared.context, surfaces: shared.surfaces }} onLoad={loadProfile} />
          <h2>Runtime Event Log</h2>
          <div className="events">
            {events.map((event, index) => (
              <article key={`${event.timestamp}-${index}`}>
                <strong>{event.type}</strong>
                <span>{event.timestamp} · {event.source}</span>
                <p>{event.message}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
