import { describe, expect, it } from 'vitest';
import { createSceneEngine } from './index';

describe('SceneEngine', () => {
  it('registers and plans scene steps in delay order', () => {
    const scenes = createSceneEngine();
    scenes.register({
      id: 'welcome',
      name: 'Welcome',
      description: 'Welcome scene',
      steps: [
        { target: 'roof', action: 'ambient', delayMs: 200, durationMs: 500 },
        { target: 'floor', action: 'path', delayMs: 0, durationMs: 500 },
      ],
    });

    expect(scenes.list()).toHaveLength(1);
    expect(scenes.plan('welcome')[0]?.target).toBe('floor');
  });
});
