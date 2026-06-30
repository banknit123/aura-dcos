import { describe, expect, it } from 'vitest';
import { createAnimationEngine } from './index';

describe('AnimationEngine', () => {
  it('calculates frame values at elapsed time', () => {
    const engine = createAnimationEngine();
    const frame = engine.frameAt({
      id: 'energy',
      target: 'roof',
      property: 'energy',
      from: 0,
      to: 100,
      durationMs: 1000,
      delayMs: 0,
      easing: 'linear',
    }, 500);

    expect(frame.value).toBe(50);
    expect(frame.target).toBe('roof');
  });
});
