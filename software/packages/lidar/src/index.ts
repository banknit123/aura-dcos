export type LidarPosition = 'front' | 'roof' | 'rear' | 'left' | 'right' | 'cabin';
export type LidarHealth = 'ready' | 'degraded' | 'offline' | 'blocked';
export type LidarPointCloudFormat = 'xyz' | 'xyzi' | 'reference';

export interface LidarDescriptor {
  id: string;
  name: string;
  position: LidarPosition;
  rangeMeters: number;
  verticalFovDeg: number;
  horizontalFovDeg: number;
  pointsPerSecond: number;
  health: LidarHealth;
}

export interface LidarPointCloudRef {
  lidarId: string;
  cloudId: string;
  timestamp: string;
  format: LidarPointCloudFormat;
  pointCount: number;
  sequence: number;
  uri?: string;
}

export interface LidarProvider {
  listLidars(): Promise<LidarDescriptor[]> | LidarDescriptor[];
  capturePointCloud(lidarId: string): Promise<LidarPointCloudRef> | LidarPointCloudRef;
}

export interface LidarSnapshot {
  lidars: LidarDescriptor[];
  latestClouds: LidarPointCloudRef[];
  ready: boolean;
  messages: string[];
}

function now(): string {
  return new Date().toISOString();
}

export class LidarManager {
  private readonly lidars = new Map<string, LidarDescriptor>();
  private readonly latestClouds = new Map<string, LidarPointCloudRef>();

  constructor(private readonly provider: LidarProvider) {}

  async discover(): Promise<LidarDescriptor[]> {
    const lidars = await this.provider.listLidars();
    this.lidars.clear();
    for (const lidar of lidars) {
      if (lidar.rangeMeters <= 0 || lidar.pointsPerSecond <= 0) throw new Error(`Invalid LiDAR descriptor: ${lidar.id}`);
      this.lidars.set(lidar.id, lidar);
    }
    return [...this.lidars.values()];
  }

  async capturePointCloud(lidarId: string): Promise<LidarPointCloudRef> {
    const lidar = this.lidars.get(lidarId);
    if (!lidar) throw new Error(`LiDAR not discovered: ${lidarId}`);
    if (lidar.health === 'offline' || lidar.health === 'blocked') throw new Error(`LiDAR unavailable: ${lidarId}`);
    const cloud = await this.provider.capturePointCloud(lidarId);
    if (cloud.pointCount < 0) throw new Error(`Invalid LiDAR point count: ${cloud.cloudId}`);
    this.latestClouds.set(lidarId, cloud);
    return cloud;
  }

  snapshot(): LidarSnapshot {
    const lidars = [...this.lidars.values()];
    return {
      lidars,
      latestClouds: [...this.latestClouds.values()],
      ready: lidars.length > 0 && lidars.every((lidar) => lidar.health === 'ready'),
      messages: [`${lidars.length} LiDAR endpoints discovered.`, `${this.latestClouds.size} point-cloud references cached.`],
    };
  }
}

export class SimulatorLidarProvider implements LidarProvider {
  private sequence = 0;

  listLidars(): LidarDescriptor[] {
    return [{ id: 'roof-lidar', name: 'Roof LiDAR', position: 'roof', rangeMeters: 220, verticalFovDeg: 40, horizontalFovDeg: 360, pointsPerSecond: 1200000, health: 'ready' }];
  }

  capturePointCloud(lidarId: string): LidarPointCloudRef {
    this.sequence += 1;
    return { lidarId, cloudId: `${lidarId}-${this.sequence}`, timestamp: now(), format: 'reference', pointCount: 64000, sequence: this.sequence, uri: `sim://lidar/${lidarId}/${this.sequence}` };
  }
}

export function createLidarManager(provider: LidarProvider = new SimulatorLidarProvider()): LidarManager {
  return new LidarManager(provider);
}
