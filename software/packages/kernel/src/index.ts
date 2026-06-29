export interface AuraModuleContext {
  emitLifecycle?(event: AuraKernelLifecycleEvent): void;
}

export interface AuraModule {
  name: string;
  version: string;
  dependencies?: string[];
  start(context?: AuraModuleContext): Promise<void> | void;
  stop(context?: AuraModuleContext): Promise<void> | void;
}

export type KernelState = 'created' | 'starting' | 'running' | 'stopping' | 'stopped' | 'failed';
export type AuraKernelLifecycleEventType = 'kernel.starting' | 'kernel.running' | 'kernel.stopping' | 'kernel.stopped' | 'kernel.failed' | 'module.starting' | 'module.running' | 'module.stopping' | 'module.stopped';

export interface AuraKernelLifecycleEvent {
  type: AuraKernelLifecycleEventType;
  timestamp: string;
  module?: string;
  message?: string;
}

export class AuraKernel {
  private readonly modules = new Map<string, AuraModule>();
  private readonly lifecycle: AuraKernelLifecycleEvent[] = [];
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

  getLifecycleEvents(): readonly AuraKernelLifecycleEvent[] {
    return this.lifecycle;
  }

  async start(): Promise<void> {
    if (this.state === 'running') return;
    this.setState('starting', 'kernel.starting');

    try {
      for (const module of this.getStartOrder()) {
        this.emit({ type: 'module.starting', module: module.name });
        await module.start(this.createContext());
        this.emit({ type: 'module.running', module: module.name });
      }

      this.setState('running', 'kernel.running');
    } catch (error) {
      this.setState('failed', 'kernel.failed', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.state !== 'running') return;
    this.setState('stopping', 'kernel.stopping');

    const stopOrder = this.getStartOrder().reverse();
    for (const module of stopOrder) {
      this.emit({ type: 'module.stopping', module: module.name });
      await module.stop(this.createContext());
      this.emit({ type: 'module.stopped', module: module.name });
    }

    this.setState('stopped', 'kernel.stopped');
  }

  private createContext(): AuraModuleContext {
    return {
      emitLifecycle: (event) => this.emit(event),
    };
  }

  private setState(state: KernelState, eventType: AuraKernelLifecycleEventType, message?: string): void {
    this.state = state;
    this.emit({ type: eventType, message });
  }

  private emit(event: Omit<AuraKernelLifecycleEvent, 'timestamp'>): void {
    this.lifecycle.push({ ...event, timestamp: new Date().toISOString() });
  }

  private getStartOrder(): AuraModule[] {
    const ordered: AuraModule[] = [];
    const visiting = new Set<string>();
    const visited = new Set<string>();

    const visit = (module: AuraModule) => {
      if (visited.has(module.name)) return;
      if (visiting.has(module.name)) {
        throw new Error(`Circular module dependency detected: ${module.name}`);
      }

      visiting.add(module.name);

      for (const dependency of module.dependencies ?? []) {
        const dependencyModule = this.modules.get(dependency);
        if (!dependencyModule) {
          throw new Error(`Missing dependency for ${module.name}: ${dependency}`);
        }
        visit(dependencyModule);
      }

      visiting.delete(module.name);
      visited.add(module.name);
      ordered.push(module);
    };

    for (const module of this.modules.values()) {
      visit(module);
    }

    return ordered;
  }
}

export function createAuraKernel(): AuraKernel {
  return new AuraKernel();
}
