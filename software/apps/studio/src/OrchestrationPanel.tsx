import { useMemo, useState } from 'react';
import { createStudioOrchestration, type StudioSceneId } from './orchestration';

export function OrchestrationPanel() {
  const orchestration = useMemo(() => createStudioOrchestration(), []);
  const [sceneId, setSceneId] = useState<StudioSceneId>('welcome');
  const [syncVersion, setSyncVersion] = useState(0);

  const scenes = orchestration.scenes.list();
  const selectedScene = orchestration.scenes.get(sceneId);
  const plannedSteps = orchestration.scenes.plan(sceneId);
  const displayTargets = orchestration.router.listTargets();
  const animationPreview = orchestration.animation.timelineAt(orchestration.baseAnimations, 600);

  async function activateScene(nextScene: StudioSceneId): Promise<void> {
    setSceneId(nextScene);
    const nextRisk = nextScene === 'emergency' ? 'critical' : nextScene === 'businessRain' ? 'elevated' : 'normal';
    const nextSpeed = nextScene === 'welcome' ? 0 : nextScene === 'commute' ? 48 : nextScene === 'businessRain' ? 65 : 82;
    const nextMode = nextScene === 'businessRain' ? 'business' : nextScene === 'emergency' ? 'safety' : nextScene;
    const snapshot = await orchestration.sync.update({ scene: nextScene, risk: nextRisk, speedKph: nextSpeed, mode: nextMode });
    setSyncVersion(snapshot.version);
  }

  return (
    <section className="orchestration-panel">
      <h2>Orchestration</h2>
      <p className="muted">Sync version {syncVersion} · Scene: {selectedScene.name}</p>

      <div className="actions">
        {scenes.map((scene) => (
          <button key={scene.id} onClick={() => activateScene(scene.id as StudioSceneId)}>
            {scene.name}
          </button>
        ))}
      </div>

      <div className="mini-grid">
        <article>
          <strong>Scene Plan</strong>
          {plannedSteps.map((step) => (
            <small key={`${step.target}-${step.action}`}>{step.target}: {step.action} · {step.delayMs}ms</small>
          ))}
        </article>
        <article>
          <strong>Display Targets</strong>
          {displayTargets.map((target) => (
            <small key={target.id}>{target.role}: {target.name}</small>
          ))}
        </article>
        <article>
          <strong>Animation Preview</strong>
          {animationPreview.map((frame) => (
            <small key={frame.instructionId}>{frame.target}.{frame.property}: {Math.round(frame.value)}</small>
          ))}
        </article>
      </div>
    </section>
  );
}
