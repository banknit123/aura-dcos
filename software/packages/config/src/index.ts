export type ConfigPrimitive = string | number | boolean | null;
export type ConfigValue = ConfigPrimitive | ConfigPrimitive[] | Record<string, ConfigPrimitive>;

export class AuraConfigStore {
  private values: Record<string, ConfigValue> = {};

  constructor(initialValues: Record<string, ConfigValue> = {}) {
    for (const key of Object.keys(initialValues)) {
      this.values[key] = initialValues[key];
    }
  }

  get<T extends ConfigValue>(key: string, fallback?: T): T | undefined {
    const value = this.values[key];
    if (value === undefined) return fallback;
    return value as T;
  }

  set(key: string, value: ConfigValue): void {
    this.values[key] = value;
  }

  snapshot(): Record<string, ConfigValue> {
    const copy: Record<string, ConfigValue> = {};
    for (const key of Object.keys(this.values)) {
      copy[key] = this.values[key];
    }
    return copy;
  }
}

export function createAuraConfigStore(initialValues: Record<string, ConfigValue> = {}): AuraConfigStore {
  return new AuraConfigStore(initialValues);
}
