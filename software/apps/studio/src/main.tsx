import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createAuraDigitalTwin, type AuraCabinContext } from '@aura-dcos/digital-twin';
import { createAuraSurfaceRegistry, type AuraSurface } from '@aura-dcos/surfaces';
import './styles.css';

interface EventEntry {
  timestamp: string;
  type: string;
  source: string;
  message: string;
}

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

function createInitialSurfaceRegistry() {
  const registry = createAuraSurfaceRegistry();
  for (const surface of initialSurfaces) registry.register(surface);
  return registry;
}

function applySafetyRules(surfaces: AuraSurface[], risk: 'normal' | 'elevated' | 'critical'): AuraSurface[] {
  if (risk === 'normal') return surfaces;

  return surfaces.map((surface) => {
    if (!surface.visibleToDriver) {
      return { ...surface, state: 'ambient', energy: Math.min(surface.energy, risk === 'critical' ? 10 : 25) };
    }

    if (risk === 'critical') {
      return { ...surface, state: surface.id === 'projection' ? 'off' : 'emergency', energy: surface.id === 'projection' ? 0 : 95 };
    }

    return { ...surface, energy: Math.min(85, Math.max(surface.energy, 60)) };
  });
}

function App() {
  const [twin] = useState(() => createAuraDigitalTwin(initialContext));
  const [surfaceRegistry] = useState(createInitialSurfaceRegistry);
  const [context, setContext] = useState<AuraCabinContext>(initialContext);
  const [surfaces, setSurfaces] = useState<AuraSurface[]>(surfaceRegistry.list());
  const [events, setEvents] = useState<EventEntry[]>([
    { timestamp: now(), type: 'kernel.running', source: 'studio', message: 'AURA DCOS Studio booted' },
  ]);

  const risk = twin.riskLevel();
  const adjustedSurfaces = useMemo(() => applySafetyRules(surfaces, risk), [surfaces, risk]);

  function emit(type: string, message: string): void {
    setEvents((previous) => [{ timestamp: now(), type, source: 'studio', message }, ...previous].slice(0, 12));
  }

  function updateContext(update: Partial<AuraCabinContext>): void {
    const snapshot = twin.update(update);
    setContext(snapshot.context);
    emit('digitalTwin.updated', `Context updated. Risk is now ${twin.riskLevel()}`);
  }

  function runScenario(mode: AuraCabinContext['mode'], vehicleState: AuraCabinContext['vehicleState'], speedKph: number, weather: AuraCabinContext['weather']): void {
    updateContext({ mode, vehicleState, speedKph, weather });
    emit('scenario.selected', `Mode changed to ${mode}, ${vehicleState}, ${speedKph} km/h, weather ${weather}`);
  }

  function increaseRoofEnergy(): void {
    const roof = surfaceRegistry.get('roof');
    surfaceRegistry.update('roof', { energy: Math.min(100, roof.energy + 15), state: 'interactive' });
    setSurfaces(surfaceRegistry.list());
    emit('surface.energy.changed', 'Digital Roof energy increased through Surface Registry');
  }

  function emergencyMode(): void {
    updateContext({ mode: 'safety', vehicleState: 'driving', speedKph: 82, weather: 'rain' });
    emit('safety.envelope.critical', 'Critical safety envelope activated');
  }

  return (
    <main className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">AURA DCOS · Phase C</p>
          <h1>AURA Studio</h1>
          <p>Runnable app connected to the DCOS Digital Twin and Surface Registry packages.</p>
        </div>
        <div className={`risk risk-${risk}`}>Risk: {risk}</div>
      </header>

      <section className="grid">
        <section className="panel">
          <h2>Digital Twin Context</h2>
          <dl>
            <div><dt>Mode</dt><dd>{context.mode}</dd></div>
            <div><dt>Vehicle</dt><dd>{context.vehicleState}</dd></div>
            <div><dt>Speed</dt><dd>{context.speedKph} km/h</dd></div>
            <div><dt>Weather</dt><dd>{context.weather}</dd></div>
            <div><dt>Occupants</dt><dd>{context.occupants}</dd></div>
            <div><dt>Child Present</dt><dd>{context.childPresent ? 'Yes' : 'No'}</dd></div>
          </dl>
          <div className="actions">
            <button onClick={() => runScenario('family', 'parked', 0, 'clear')}>Welcome / Family</button>
            <button onClick={() => runScenario('commute', 'driving', 48, 'clear')}>Commute</button>
            <button onClick={() => runScenario('business', 'driving', 65, 'rain')}>Business + Rain</button>
            <button onClick={emergencyMode}>Emergency Safety</button>
          </div>
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
