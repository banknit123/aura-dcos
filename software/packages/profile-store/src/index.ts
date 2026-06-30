export interface AuraProfile<TData> {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  data: TData;
}

export interface AuraProfileStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class AuraProfileStore<TData> {
  constructor(private readonly storage: AuraProfileStorage, private readonly storageKey: string) {}

  list(): AuraProfile<TData>[] {
    const raw = this.storage.getItem(this.storageKey);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as AuraProfile<TData>[];
    } catch {
      return [];
    }
  }

  save(name: string, data: TData): AuraProfile<TData> {
    const now = new Date().toISOString();
    const profile: AuraProfile<TData> = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      createdAt: now,
      updatedAt: now,
      data,
    };
    this.write([...this.list(), profile]);
    return profile;
  }

  load(profileId: string): AuraProfile<TData> {
    const profile = this.list().find((item) => item.id === profileId);
    if (!profile) throw new Error(`Profile not found: ${profileId}`);
    return profile;
  }

  remove(profileId: string): void {
    this.write(this.list().filter((item) => item.id !== profileId));
  }

  clear(): void {
    this.storage.removeItem(this.storageKey);
  }

  private write(profiles: AuraProfile<TData>[]): void {
    this.storage.setItem(this.storageKey, JSON.stringify(profiles));
  }
}

export function createAuraProfileStore<TData>(storage: AuraProfileStorage, storageKey: string): AuraProfileStore<TData> {
  return new AuraProfileStore<TData>(storage, storageKey);
}
