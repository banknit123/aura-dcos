export type AuraCapabilityPermission = 'display' | 'audio' | 'lighting' | 'sensor' | 'projection' | 'network';

export interface AuraCapabilityContext {
  requestPermission(permission: AuraCapabilityPermission): boolean;
  emit(type: string, payload?: unknown): Promise<void> | void;
}

export interface AuraCapability {
  id: string;
  name: string;
  version: string;
  permissions: AuraCapabilityPermission[];
  activate(context: AuraCapabilityContext): Promise<void> | void;
  deactivate(context: AuraCapabilityContext): Promise<void> | void;
}

export class AuraCapabilityRegistry {
  private readonly capabilities = new Map<string, AuraCapability>();

  register(capability: AuraCapability): void {
    if (this.capabilities.has(capability.id)) {
      throw new Error(`Capability already registered: ${capability.id}`);
    }
    this.capabilities.set(capability.id, capability);
  }

  get(id: string): AuraCapability {
    const capability = this.capabilities.get(id);
    if (!capability) throw new Error(`Capability not registered: ${id}`);
    return capability;
  }

  list(): AuraCapability[] {
    return [...this.capabilities.values()].sort((a, b) => a.id.localeCompare(b.id));
  }
}

export function createAuraCapabilityRegistry(): AuraCapabilityRegistry {
  return new AuraCapabilityRegistry();
}
