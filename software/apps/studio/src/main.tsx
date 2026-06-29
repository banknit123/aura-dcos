import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createAuraDigitalTwin, type AuraCabinContext } from '@aura-dcos/digital-twin';
import { createAuraSurfaceRegistry, type AuraSurface } from '@aura-dcos/surfaces';
import { OrchestrationPanel } from './OrchestrationPanel';
import './styles.css';

interface EventEntry {
  timestamp: string;
  type: string;
  source: string;
  message: string;
}

type OutputRoute = 'controller' | 'dashboard' | 'roof' | 'projection' | 'floor';

interface StudioSharedState {
  context: AuraCabinContext;
  surfaces: AuraSurface[];
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
  if (route === 'dashboard' || route === 'roof' || route === 'projection' || route === 'floor') return route;
  return 'controller';
}

function defaultState(): StudioSharedState {
  return { context: initialContext, surfaces: initialSurfaces, updatedAt: new Date().toISOString() };
}

function readSharedState(): StudioSharedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StudioSharedState) : defaultState();
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
  return surfaces.map((surface) => {
    if (!surface.visibleToDriver) return { ...surface, state: 'ambient', energy: Math.min(surface.energy, risk === 'critical' ? 10 : 25) };
    if (risk === 'critical') return { ...surface, state: surface.id === 'projection' ? 'off' : 'emergency', energy: surface.id === 'projection' ? 0 : 95 };
    return { ...surface, energy: Math.min(85, Math.max(surface.energy, 60)) };
  });
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

function ProjectionOutput({ risk }: { risk: string }) {
  return (
    <OutputShell title="AURA Presence" subtitle="Live projection / virtual companion output">
      <section className={`aura-presence risk-${risk}`}>
        <div className="aura-avatar">A</div>
        <p>{risk === 'critical' ? 'Voice-only mode' : 'Hello, I am AURA.'}</p>
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
  const [events, setEvents] = useState<EventEntry[]>([
    { timestamp: now(), type: 'kernel.running', source: 'studio', message: 'AURA DCOS Studio booted' },
  ]);

  useEffect(() => {
    if (!channel) return;
    channel.onmessage = (message) => setShared(message.data as StudioSharedState);
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
  if (route === 'projection') return <ProjectionOutput risk={risk} />;
  if (route === 'floor') return <FloorOutput risk={risk} />;

  function emit(type: string, message: string): void {
    setEvents((previous) => [{ timestamp: now(), type, source: 'studio', message }, ...previous].slice(0, 12));
  }

  function updateShared(next: StudioSharedState, eventType: string, message: string): void {
    setShared(next);
    saveSharedState(next, channel);
    emit(eventType, message);
  }

  function runScenario(mode: AuraCabinContext['mode'], vehicleState: AuraCabinContext['vehicleState'], speedKph: number, weather: AuraCabinContext['weather']): void {
    const next = { ...shared, context: { ...shared.context, mode, vehicleState, speedKph, weather }, updatedAt: new Date().toISOString() };
    updateShared(next, 'scenario.selected', `Broadcast ${mode} scenario to all outputs`);
  }

  function increaseRoofEnergy(): void {
    const registry = createInitialSurfaceRegistry(shared.surfaces);
    const roof = registry.get('roof');
    registry.update('roof', { energy: Math.min(100, roof.energy + 15), state: 'interactive' });
    const next = { ...shared, surfaces: registry.list(), updatedAt: new Date().toISOString() };
    updateShared(next, 'surface.energy.changed', 'Broadcast Digital Roof energy change');
  }

  function emergencyMode(): void {
    const next = { ...shared, context: { ...shared.context, mode: 'safety', vehicleState: 'driving', speedKph: 82, weather: 'rain' }, updatedAt: new Date().toISOString() };
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
          <p className="eyebrow">AURA DCOS · Phase E</p>
          <h1>AURA Studio</h1>
          <p>Synchronised controller for live dashboard, roof, projection and floor outputs.</p>
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
          <div className="actions">
            <button onClick={() => runScenario('family', 'parked', 0, 'clear')}>Welcome / Family</button>
            <button onClick={() => runScenario('commute', 'driving', 48, 'clear')}>Commute</button>
            <button onClick={() => runScenario('business', 'driving', 65, 'rain')}>Business + Rain</button>
            <button onClick={emergencyMode}>Emergency Safety</button>
          </div>
          <OrchestrationPanel />
        </section>

        <section className="panel cabin">
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
        </section>

        <section className="panel">
          <h2>Output Windows</h2>
          <div className="actions">
            <button onClick={() => openOutput('dashboard')}>Open Dashboard Output</button>
            <button onClick={() => openOutput('roof')}>Open Roof Output</button>
            <button onClick={() => openOutput('projection')}>Open AURA Projection Output</button>
            <button onClick={() => openOutput('floor')}>Open Floor Output</button>
          </div>
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
