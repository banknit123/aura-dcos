export type OtaCampaignState = 'available' | 'downloaded' | 'installed' | 'rolled-back' | 'failed';
export type OtaTarget = 'studio' | 'vehicle-gateway' | 'sensor-adapter' | 'controller';

export interface OtaPackageManifest {
  id: string;
  version: string;
  target: OtaTarget;
  checksum: string;
  sizeBytes: number;
  requiresParked: boolean;
}

export interface OtaCampaign {
  id: string;
  manifest: OtaPackageManifest;
  state: OtaCampaignState;
  createdAt: string;
  updatedAt: string;
  reason?: string;
}

function now(): string {
  return new Date().toISOString();
}

export class OtaUpdateManager {
  private readonly campaigns = new Map<string, OtaCampaign>();

  register(manifest: OtaPackageManifest): OtaCampaign {
    if (!manifest.checksum.trim()) throw new Error('OTA checksum is required');
    const campaign = { id: manifest.id, manifest, state: 'available' as const, createdAt: now(), updatedAt: now() };
    this.campaigns.set(campaign.id, campaign);
    return campaign;
  }

  transition(id: string, state: OtaCampaignState, vehicleParked = true, reason?: string): OtaCampaign {
    const campaign = this.campaigns.get(id);
    if (!campaign) throw new Error(`OTA campaign not registered: ${id}`);
    if (campaign.manifest.requiresParked && !vehicleParked && (state === 'installed' || state === 'rolled-back')) {
      throw new Error('OTA install or rollback requires parked vehicle');
    }
    const updated = { ...campaign, state, updatedAt: now(), reason };
    this.campaigns.set(id, updated);
    return updated;
  }

  list(): OtaCampaign[] {
    return [...this.campaigns.values()];
  }
}

export function createOtaUpdateManager(): OtaUpdateManager {
  return new OtaUpdateManager();
}
