import { describe, expect, it } from 'vitest';
import { createLinBus, SimulatorLinDriver } from './index';

describe('LIN bus framework', () => {
  it('publishes a scheduled body electronics frame', async () => {
    const driver = new SimulatorLinDriver('lin-body');
    const bus = createLinBus(driver);
    bus.registerFrame({ id: 0x12, name: 'WindowCommand', length: 2, checksum: 'enhanced', direction: 'publisher', periodMs: 50 });
    bus.registerSchedule({ id: 'body-normal', name: 'Body Normal Operation', entries: [{ frameId: 0x12, delayMs: 50 }] });

    await bus.wake();
    bus.activateSchedule('body-normal');
    const frame = await bus.publish(0x12, [50, 0]);

    expect(frame.id).toBe(0x12);
    expect(driver.transmitted()).toHaveLength(1);
    expect(bus.health().activeSchedule).toBe('body-normal');
  });

  it('rejects unregistered schedule frames', () => {
    const bus = createLinBus();
    expect(() => bus.registerSchedule({ id: 'bad', name: 'Bad', entries: [{ frameId: 0x20, delayMs: 10 }] })).toThrow('unknown LIN frame');
  });
});
