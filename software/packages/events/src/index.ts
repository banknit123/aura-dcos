export type AuraEventPriority = 'low' | 'normal' | 'high' | 'critical';

export interface AuraEvent<TPayload = unknown> {
  id: string;
  type: string;
  priority: AuraEventPriority;
  timestamp: string;
  source: string;
  payload?: TPayload;
}

export type AuraEventInput<TPayload = unknown> = Omit<AuraEvent<TPayload>, 'id' | 'timestamp'>;
export type AuraEventHandler<TPayload = unknown> = (event: AuraEvent<TPayload>) => void | Promise<void>;

function createId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export class AuraEventSystem {
  private readonly handlers = new Map<string, Set<AuraEventHandler>>();
  private readonly history: AuraEvent[] = [];

  subscribe<TPayload>(type: string, handler: AuraEventHandler<TPayload>): () => void {
    const set = this.handlers.get(type) ?? new Set<AuraEventHandler>();
    set.add(handler as AuraEventHandler);
    this.handlers.set(type, set);

    return () => {
      set.delete(handler as AuraEventHandler);
    };
  }

  async publish<TPayload>(input: AuraEventInput<TPayload>): Promise<AuraEvent<TPayload>> {
    const event: AuraEvent<TPayload> = {
      ...input,
      id: createId(),
      timestamp: new Date().toISOString(),
    };

    this.history.push(event as AuraEvent);

    const handlers = this.handlers.get(event.type) ?? new Set<AuraEventHandler>();
    for (const handler of handlers) {
      await handler(event);
    }

    return event;
  }

  getHistory(): readonly AuraEvent[] {
    return this.history;
  }

  clearHistory(): void {
    this.history.length = 0;
  }
}

export function createAuraEventSystem(): AuraEventSystem {
  return new AuraEventSystem();
}
