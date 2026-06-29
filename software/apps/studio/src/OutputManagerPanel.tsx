import { useMemo } from 'react';
import { createDefaultOutputManager, type OutputLaunchPlan } from '@aura-dcos/output-manager';

export function OutputManagerPanel({ baseUrl, onOpen }: { baseUrl: string; onOpen: (plan: OutputLaunchPlan) => void }) {
  const manager = useMemo(() => createDefaultOutputManager(), []);
  const devices = manager.list();
  const launchPlan = manager.planLaunch(baseUrl);

  return (
    <section className="output-manager-panel">
      <h2>Output Manager</h2>
      <p className="muted">Device profiles and launch plan for laptop, monitors and projectors.</p>

      <div className="mini-grid">
        {devices.map((device) => {
          const plan = launchPlan.find((item) => item.deviceId === device.id);
          return (
            <article key={device.id}>
              <strong>{device.name}</strong>
              <small>{device.role} · {device.kind}</small>
              <small>{device.width}×{device.height} · {device.fullscreen ? 'fullscreen target' : 'windowed'}</small>
              {plan && device.role !== 'controller' ? <button onClick={() => onOpen(plan)}>Open</button> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
