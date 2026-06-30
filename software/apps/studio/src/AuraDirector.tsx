import type { AuraSurface, SurfaceState } from '@aura-dcos/surfaces';

interface AuraDirectorProps {
  surfaces: AuraSurface[];
  selectedSurfaceId: string;
  onSelectSurface: (surfaceId: string) => void;
  onUpdateSurface: (surfaceId: string, update: { state?: SurfaceState; energy?: number }) => void;
}

const cabinLayout = [
  { id: 'windshield', label: 'Windshield', className: 'director-windshield' },
  { id: 'dashboard', label: 'Dashboard', className: 'director-dashboard' },
  { id: 'roof', label: 'Roof', className: 'director-roof' },
  { id: 'projection', label: 'AURA Projection', className: 'director-projection' },
  { id: 'floor', label: 'Floor', className: 'director-floor' },
];

export function AuraDirector({ surfaces, selectedSurfaceId, onSelectSurface, onUpdateSurface }: AuraDirectorProps) {
  const selectedSurface = surfaces.find((surface) => surface.id === selectedSurfaceId) ?? surfaces[0];

  return (
    <section className="aura-director">
      <h2>AURA Director</h2>
      <p className="muted">Cabin-map control for surface state and energy.</p>

      <div className="director-map" aria-label="AURA cabin map">
        {cabinLayout.map((item) => {
          const surface = surfaces.find((candidate) => candidate.id === item.id);
          const selected = selectedSurface?.id === item.id;
          return (
            <button
              className={`director-zone ${item.className} ${selected ? 'selected' : ''} state-${surface?.state ?? 'off'}`}
              key={item.id}
              onClick={() => onSelectSurface(item.id)}
            >
              <strong>{item.label}</strong>
              <small>{surface ? `${surface.energy}% · ${surface.state}` : 'not registered'}</small>
            </button>
          );
        })}
      </div>

      {selectedSurface ? (
        <div className="director-controls">
          <h3>{selectedSurface.name}</h3>
          <label>
            Energy
            <input
              type="range"
              min="0"
              max="100"
              value={selectedSurface.energy}
              onChange={(event) => onUpdateSurface(selectedSurface.id, { energy: Number(event.currentTarget.value) })}
            />
          </label>

          <div className="director-state-buttons">
            {(['off', 'ambient', 'informative', 'interactive', 'emergency'] as SurfaceState[]).map((state) => (
              <button key={state} onClick={() => onUpdateSurface(selectedSurface.id, { state })}>
                {state}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
