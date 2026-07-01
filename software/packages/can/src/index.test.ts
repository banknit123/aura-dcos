import { describe, expect, it } from 'vitest';
import { BasicCanCodec, CanBus, SimulatorCanDriver } from './index';

describe('CAN core', () => {
  it('filters incoming frames and records statistics', async () => {
    const driver = new SimulatorCanDriver('test-can');
    const bus = new CanBus(driver);
    bus.addFilter({ id: 0x120, mask: 0x7ff, format: 'standard-11bit' });
    await bus.open();

    driver.inject({ id: 0x120, format: 'standard-11bit', type: 'data', data: [1] });
    driver.inject({ id: 0x121, format: 'standard-11bit', type: 'data', data: [2] });

    const frames = await bus.poll();
    expect(frames).toHaveLength(1);
    expect(frames[0]?.id).toBe(0x120);
    expect(bus.getStatistics()).toMatchObject({ receivedFrames: 1, droppedFrames: 1 });
  });

  it('encodes and decodes simple signal definitions', () => {
    const codec = new BasicCanCodec();
    const message = {
      id: 0x220,
      name: 'CabinComfort',
      format: 'standard-11bit' as const,
      dlc: 8,
      signals: [{ name: 'temperatureC', startBit: 0, length: 8, scale: 0.5, offset: -40, unit: 'celsius' }],
    };

    const frame = codec.encode(message, { temperatureC: 22 }, 'test-can');
    const decoded = codec.decode(message, frame);

    expect(frame.data[0]).toBe(124);
    expect(decoded[0]).toMatchObject({ name: 'temperatureC', value: 22, unit: 'celsius' });
  });

  it('rejects CAN-FD frames on non FD drivers', async () => {
    const driver = new SimulatorCanDriver('classic-can');
    Object.defineProperty(driver, 'supportsFlexibleDataRate', { value: false });
    const bus = new CanBus(driver);
    await bus.open();

    await expect(
      bus.transmit({ id: 1, format: 'standard-11bit', type: 'data', data: Array.from({ length: 12 }, () => 0), timestamp: new Date().toISOString(), channel: 'classic-can', flexibleDataRate: true }),
    ).rejects.toThrow('does not support CAN-FD');
  });
});
