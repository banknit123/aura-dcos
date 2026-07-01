export type CameraPosition = 'front' | 'rear' | 'left' | 'right' | 'cabin' | 'driver' | 'surround';
export type CameraHealth = 'ready' | 'degraded' | 'offline' | 'blocked';
export type CameraFrameFormat = 'rgb' | 'yuv' | 'h264' | 'h265' | 'jpeg' | 'reference';

export interface CameraCalibration {
  intrinsicMatrix: number[];
  distortionCoefficients: number[];
  extrinsic?: { x: number; y: number; z: number; roll: number; pitch: number; yaw: number };
}

export interface CameraDescriptor {
  id: string;
  name: string;
  position: CameraPosition;
  width: number;
  height: number;
  fps: number;
  format: CameraFrameFormat;
  health: CameraHealth;
  calibration?: CameraCalibration;
  metadata?: Record<string, string | number | boolean>;
}

export interface CameraFrameRef {
  cameraId: string;
  frameId: string;
  timestamp: string;
  format: CameraFrameFormat;
  width: number;
  height: number;
  uri?: string;
  sequence: number;
}

export interface CameraProvider {
  listCameras(): Promise<CameraDescriptor[]> | CameraDescriptor[];
  capture(cameraId: string): Promise<CameraFrameRef> | CameraFrameRef;
}

export interface CameraSnapshot {
  cameras: CameraDescriptor[];
  lastFrames: CameraFrameRef[];
  ready: boolean;
  messages: string[];
}

function now(): string {
  return new Date().toISOString();
}

export class CameraManager {
  private readonly cameras = new Map<string, CameraDescriptor>();
  private readonly lastFrames = new Map<string, CameraFrameRef>();

  constructor(private readonly provider: CameraProvider) {}

  async discover(): Promise<CameraDescriptor[]> {
    const cameras = await this.provider.listCameras();
    this.cameras.clear();
    for (const camera of cameras) {
      if (camera.width <= 0 || camera.height <= 0 || camera.fps <= 0) throw new Error(`Invalid camera descriptor: ${camera.id}`);
      this.cameras.set(camera.id, camera);
    }
    return [...this.cameras.values()];
  }

  async capture(cameraId: string): Promise<CameraFrameRef> {
    const camera = this.cameras.get(cameraId);
    if (!camera) throw new Error(`Camera not discovered: ${cameraId}`);
    if (camera.health === 'offline' || camera.health === 'blocked') throw new Error(`Camera unavailable: ${cameraId}`);
    const frame = await this.provider.capture(cameraId);
    this.lastFrames.set(cameraId, frame);
    return frame;
  }

  snapshot(): CameraSnapshot {
    const cameras = [...this.cameras.values()];
    return {
      cameras,
      lastFrames: [...this.lastFrames.values()],
      ready: cameras.length > 0 && cameras.every((camera) => camera.health === 'ready'),
      messages: [`${cameras.length} cameras discovered.`, `${this.lastFrames.size} latest camera frames cached.`],
    };
  }
}

export class SimulatorCameraProvider implements CameraProvider {
  private sequence = 0;

  listCameras(): CameraDescriptor[] {
    return [
      { id: 'front-camera', name: 'Front Camera', position: 'front', width: 1920, height: 1080, fps: 30, format: 'reference', health: 'ready' },
      { id: 'cabin-camera', name: 'Cabin Camera', position: 'cabin', width: 1280, height: 720, fps: 30, format: 'reference', health: 'ready' },
    ];
  }

  capture(cameraId: string): CameraFrameRef {
    this.sequence += 1;
    const size = cameraId === 'front-camera' ? { width: 1920, height: 1080 } : { width: 1280, height: 720 };
    return { cameraId, frameId: `${cameraId}-${this.sequence}`, timestamp: now(), format: 'reference', sequence: this.sequence, ...size, uri: `sim://camera/${cameraId}/${this.sequence}` };
  }
}

export function createCameraManager(provider: CameraProvider = new SimulatorCameraProvider()): CameraManager {
  return new CameraManager(provider);
}
