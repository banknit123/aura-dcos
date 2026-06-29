import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type SurfaceState = 'off' | 'ambient' | 'informative' | 'interactive' | 'emergency';
type CabinMode = 'commute' | 'family' | 'business' | 'relax' | 'entertainment' | 'safety';
type VehicleState = 'parked' | 'driving';

interface Surface {
  id: string;
  name: string;
  kind: string;
  state: SurfaceState;
  energy: number;
  visibleToDriver: boolean;
}

interface CabinContext {
  mode: CabinMode;
  vehicleState: VehicleState;
  speedKph: number;
  weather: 'clear' | 'rain' | 'fog';
  occupants: number;
  childPresent: boolean;
}

interface EventEntry {
  timestamp: string;
  type: string;
  source: string;
  message: string;
}

const initialSurfaces: Surface[] = [
  { id: 'dashboard', name: 'Dashboard', kind: 'dashboard', state: 'informative', energy: 80, visibleToDriver: true },
  { id: 'windshield', name: 'AR Windshield', kind: 'windshield', state: 'informative', energy: 70, visibleToDriver: true },
  { id: 'roof', name: 'Digital Roof', kind: 'roof', state: 'ambient', energy: 35, visibleToDriver: false },
  { id: 'floor', name: 'Digital Floor', kind: 'floor', state: 'ambient', energy: 30, visibleToDriver: false },
  { id: 'projection', name: 'AURA Presence', kind: 'projection', state: 'interactive', energy: 55, visibleToDriver: true },
];

const initialContext: CabinContext = {
  mode: 'family',
  vehicleState: 'parked',
  speedKph: 0,
  weather: 'clear',
  occupants: 3,
  childPresent: true,
};

function riskLevel(context: CabinContext): 'normal' | 'elevated' | 'critical' {
  let score = 0;
  if (context.vehicleState === 'driving') score += 1;
  if (context.speedKph > 60) score += 2;
  if (context.weather !== 'clear') score += 1;
  if (context.mode === 'safety') score += 3;

  if (score >= 5) return 'critical';
  if (score >= 3) return 'elevated';
  return 'normal';
}

function applySafetyRules(surfaces: Surface[], context: CabinContext): Surface[] {
  const risk = riskLevel(context);

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

function now(): string {
  return new Date().toLocaleTimeString();
}

function App() {
  const [context, setContext] = useState<CabinContext>(initialContext);
  const [surfaces, setSurfaces] = useState<Surface[]>(initialSurfaces);
  const [events, setEvents] = useState<EventEntry[]>([
    { timestamp: now(), type: 'kernel.running', source: 'studio', message: 'AURA DCOS Studio booted' },
  ]);

  const adjustedSurfaces = useMemo(() => applySafetyRules(surfaces, context), [surfaces, context]);
  const risk = riskLevel(context);

  function emit(type: string, message: string): void {
    setEvents((previous) => [{ timestamp: now(), type, source: 'studio', message }, ...previous].slice(0, 12));
  }

  function runScenario(mode: CabinMode, vehicleState: VehicleState, speedKph: number, weather: CabinContext['weather']): void {
    setContext((previous) => ({ ...previous, mode, vehicleState, speedKph, weather }));
    emit('context.updated', `Mode changed to ${mode}, ${vehicleState}, ${speedKph} km/h, weather ${weather}`);
  }

  function increaseRoofEnergy(): void {
    setSurfaces((previous) => previous.map((surface) => surface.id === 'roof' ? { ...surface, energy: Math.min(100, surface.energy + 15), state: 'interactive' } : surface));
    emit('surface.energy.changed', 'Digital Roof energy increased');
  }

  function emergencyMode(): void {
    setContext((previous) => ({ ...previous, mode: 'safety', vehicleState: 'driving', speedKph: 82, weather: 'rain' }));
    emit('safety.envelope.critical', 'Critical safety envelope activated');
  }

  return (
    <main className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">AURA DCOS · Phase C</p>
          <h1>AURA Studio</h1>
          <p>First runnable app wiring together digital cabin context, surface energy and safety behaviour.</p>
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
                <span>{surface.kind}</span>
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
