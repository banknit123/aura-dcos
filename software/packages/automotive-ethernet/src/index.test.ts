import { describe, expect, it } from 'vitest';
import { createAutomotiveEthernetGateway } from './index';

describe('Automotive Ethernet gateway', () => {
  it('registers services and publishes messages', async () => {
    const gateway = createAutomotiveEthernetGateway();
    gateway.registerService({
      id: 'camera-front',
      name: 'Front Camera Stream',
      protocol: 'rtsp',
      endpoint: { id: 'front-camera', host: '10.0.0.10', port: 8554, vlanId: 20 },
      qos: 'sensor-stream',
      secure: true,
      bandwidthMbps: 800,
    });

    await gateway.open();
    const result = await gateway.publish('camera-front', { stream: true }, 'corr-1');

    expect(result.accepted).toBe(true);
    expect(gateway.health().publishedMessages).toBe(1);
  });

  it('blocks insecure control services in simulator transport', async () => {
    const gateway = createAutomotiveEthernetGateway();
    gateway.registerService({
      id: 'body-control',
      name: 'Body Control',
      protocol: 'someip',
      endpoint: { id: 'body', host: '10.0.0.20', port: 30490 },
      qos: 'control',
      secure: false,
    });

    await gateway.open();
    const result = await gateway.publish('body-control', { command: 'unlock' });

    expect(result.accepted).toBe(false);
    expect(result.reason).toContain('secure');
  });
});
