export type VehicleSignalValue = string | number | boolean | null;
export type VehicleSignalQuality = 'valid' | 'stale' | 'estimated' | 'fault' | 'unauthorized';
export type VehicleSignalDomain = 'body' | 'comfort' | 'infotainment' | 'adas' | 'powertrain' | 'sensor' | 'diagnostic';

export interface VehicleSignalDefinition {
  id: string;
  name: string;
  domain: VehicleSignalDomain;
  unit?: string;
  freshnessMs: number;
  writable: boolean;
  safetyCritical?: boolean;
}

export interface VehicleSignalSample {
  id: string;
  value: VehicleSignalValue;
  quality: VehicleSignalQuality;
  source: string;
  timestamp: string;
}

export interface VehicleSignalSnapshot {
  definitions: VehicleSignalDefinition[];
  samples: VehicleSignalSample[];
  staleSignals: string[];
  messages: string[];
}

export type VehicleSignalListener = (sample: VehicleSignalSample) => void;

function ageMs(timestamp: string, reference = Date.now()): number {
  return Math.max(0, reference - new Date(timestamp).getTime());
}

function isStale(definition: VehicleSignalDefinition, sample: VehicleSignalSample | undefined, reference = Date.now()): boolean {
  if (!sample) return true;
  if (sample.quality === 'stale') return true;
  return ageMs(sample.timestamp, reference) > definition.freshnessMs;
}

export class VehicleSignalManager {
  private readonly definitions = new Map<string, VehicleSignalDefinition>();
  private readonly samples = new Map<string, VehicleSignalSample>();
  private readonly listeners = new Map<string, Set<VehicleSignalListener>>();

  register(definition: VehicleSignalDefinition): void {
    if (this.definitions.has(definition.id)) throw new Error(`Vehicle signal already registered: ${definition.id}`);
    if (definition.freshnessMs <= 0) throw new Error(`Vehicle signal freshness must be positive: ${definition.id}`);
    this.definitions.set(definition.id, definition);
  }

  ingest(sample: VehicleSignalSample): VehicleSignalSample {
    if (!this.definitions.has(sample.id)) throw new Error(`Vehicle signal not registered: ${sample.id}`);
    this.samples.set(sample.id, sample);
    for (const listener of this.listeners.get(sample.id) ?? []) listener(sample);
    for (const listener of this.listeners.get('*') ?? []) listener(sample);
    return sample;
  }

  get(id: string): VehicleSignalSample | undefined {
    return this.samples.get(id);
  }

  requireFresh(id: string, reference = Date.now()): VehicleSignalSample {
    const definition = this.definitions.get(id);
    if (!definition) throw new Error(`Vehicle signal not registered: ${id}`);
    const sample = this.samples.get(id);
    if (isStale(definition, sample, reference)) throw new Error(`Vehicle signal is stale: ${id}`);
    return sample as VehicleSignalSample;
  }

  subscribe(id: string, listener: VehicleSignalListener): () => void {
    const listeners = this.listeners.get(id) ?? new Set<VehicleSignalListener>();
    listeners.add(listener);
    this.listeners.set(id, listeners);
    return () => listeners.delete(listener);
  }

  snapshot(reference = Date.now()): VehicleSignalSnapshot {
    const definitions = [...this.definitions.values()];
    const samples = [...this.samples.values()];
    const staleSignals = definitions.filter((definition) => isStale(definition, this.samples.get(definition.id), reference)).map((definition) => definition.id);
    return {
      definitions,
      samples,
      staleSignals,
      messages: [`${definitions.length} vehicle signals registered.`, `${samples.length} vehicle signal samples cached.`, `${staleSignals.length} vehicle signals stale.`],
    };
  }
}

export function createVehicleSignalManager(): VehicleSignalManager {
  return new VehicleSignalManager();
}
