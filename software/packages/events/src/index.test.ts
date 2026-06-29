import { describe, expect, it } from 'vitest';
import { createAuraEventSystem } from './index';

describe('AuraEventSystem', () => {
  it('publishes events to subscribers and records history', async () => {
    const events = createAuraEventSystem();
    const received: string[] = [];

    events.subscribe('door.open', (event) => {
      received.push(event.type);
    });

    await events.publish({
      type: 'door.open',
      priority: 'normal',
      source: 'test',
      payload: { door: 'driver' },
    });

    expect(received).toEqual(['door.open']);
    expect(events.getHistory()).toHaveLength(1);
  });
});
