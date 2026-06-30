import { defaultProjectorCalibrationGrid } from '@aura-dcos/calibration';
import './calibration.css';

export function CalibrationOutput() {
  const grid = defaultProjectorCalibrationGrid();
  const vertical = grid.lines.filter((line) => line.orientation === 'vertical');
  const horizontal = grid.lines.filter((line) => line.orientation === 'horizontal');

  return (
    <main className="calibration-screen">
      <header>
        <p className="eyebrow">AURA Calibration</p>
        <h1>Projector Alignment Grid</h1>
        <p>Use this screen to align projector edges, focus, keystone and surface coverage.</p>
      </header>
      <section className="calibration-grid" aria-label="Projector calibration grid">
        {vertical.map((line) => (
          <span className="calibration-line vertical" key={line.label} style={{ left: `${(line.position / grid.width) * 100}%` }}>
            {line.label}
          </span>
        ))}
        {horizontal.map((line) => (
          <span className="calibration-line horizontal" key={line.label} style={{ top: `${(line.position / grid.height) * 100}%` }}>
            {line.label}
          </span>
        ))}
        <div className="calibration-centre">CENTER</div>
      </section>
    </main>
  );
}
