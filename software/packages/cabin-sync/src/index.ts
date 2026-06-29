export type CabinSyncListener<TState> = (state: TState, version: number) => void | Promise<void>;

export interface CabinSyncSnapshot<TState> {
  version: number;
  state: TState;
  updatedAt: string;
}

export class CabinSyncStore<TState extends Record<string, unknown>> {
  private version = 0;
  private state: TState;
  private readonly listeners = new Set<CabinSyncListener<TState>>();

  constructor(initialState: TState) {
    this.state = { ...initialState };
  }

  snapshot(): CabinSyncSnapshot<TState> {
    return {
      version: this.version,
      state: { ...this.state },
      updatedAt: new Date().toISOString(),
    };
  }

  listen(listener: CabinSyncListener<TState>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async update(update: Partial<TState>): Promise<CabinSyncSnapshot<TState>> {
    this.state = { ...this.state, ...update };
    this.version += 1;

    for (const listener of this.listeners) {
      await listener({ ...this.state }, this.version);
    }

    return this.snapshot();
  }
}

export function createCabinSyncStore<TState extends Record<string, unknown>>(initialState: TState): CabinSyncStore<TState> {
  return new CabinSyncStore(initialState);
}
