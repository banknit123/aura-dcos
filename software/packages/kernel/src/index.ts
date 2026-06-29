export interface AuraModule {
  name: string;
  version: string;
  start(): Promise<void> | void;
  stop(): Promise<void> | void;
}

export type KernelState = 'created' | 'starting' | 'running' | 'stopping' | 'stopped';

export class AuraKernel {
  private readonly modules = new Map<string, AuraModule>();
  private state: KernelState = 'created';

  register(module: AuraModule): void {
    if (this.modules.has(module.name)) {
      throw new Error(`Module already registered: ${module.name}`);
    }
    this.modules.set(module.name, module);
  }

  getState(): KernelState {
    return this.state;
  }

  getModules(): readonly AuraModule[] {
    return [...this.modules.values()];
  }

  async start(): Promise<void> {
    if (this.state === 'running') return;
    this.state = 'starting';

    for (const module of this.modules.values()) {
      await module.start();
    }

    this.state = 'running';
  }

  async stop(): Promise<void> {
    if (this.state !== 'running') return;
    this.state = 'stopping';

    for (const module of [...this.modules.values()].reverse()) {
      await module.stop();
    }

    this.state = 'stopped';
  }
}

export function createAuraKernel(): AuraKernel {
  return new AuraKernel();
}
