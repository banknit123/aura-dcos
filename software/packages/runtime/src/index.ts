export type ServiceFactory<TService> = () => TService;

export class AuraServiceRegistry {
  private readonly services = new Map<string, unknown>();

  register<TService>(name: string, service: TService): void {
    if (this.services.has(name)) {
      throw new Error(`Service already registered: ${name}`);
    }
    this.services.set(name, service);
  }

  resolve<TService>(name: string): TService {
    if (!this.services.has(name)) {
      throw new Error(`Service not registered: ${name}`);
    }
    return this.services.get(name) as TService;
  }

  has(name: string): boolean {
    return this.services.has(name);
  }

  list(): string[] {
    return [...this.services.keys()].sort();
  }
}

export class AuraContainer {
  private readonly factories = new Map<string, ServiceFactory<unknown>>();
  private readonly instances = new Map<string, unknown>();

  bind<TService>(name: string, factory: ServiceFactory<TService>): void {
    if (this.factories.has(name)) {
      throw new Error(`Factory already bound: ${name}`);
    }
    this.factories.set(name, factory as ServiceFactory<unknown>);
  }

  get<TService>(name: string): TService {
    if (this.instances.has(name)) {
      return this.instances.get(name) as TService;
    }

    const factory = this.factories.get(name);
    if (!factory) {
      throw new Error(`Factory not found: ${name}`);
    }

    const instance = factory();
    this.instances.set(name, instance);
    return instance as TService;
  }

  listBindings(): string[] {
    return [...this.factories.keys()].sort();
  }
}

export function createAuraServiceRegistry(): AuraServiceRegistry {
  return new AuraServiceRegistry();
}

export function createAuraContainer(): AuraContainer {
  return new AuraContainer();
}
