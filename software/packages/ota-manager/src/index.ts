export type OtaCampaignState = 'available' | 'downloaded' | 'ready-to-install' | 'installing' | 'installed' | 'rolled-back' | 'failed';
export interface OtaPackage { id: string; version: string; target: string; sizeBytes: number; signature: string; }
export interface OtaCampaign { id: string; package: OtaPackage; state: OtaCampaignState; progressPct: number; rollbackVersion?: string; }
export interface OtaInstaller { verify(pkg: OtaPackage): Promise<boolean> | boolean; install(campaign: OtaCampaign): Promise<OtaCampaign> | OtaCampaign; rollback(campaign: OtaCampaign): Promise<OtaCampaign> | OtaCampaign; }

export class OtaUpdateManager {
  private readonly campaigns = new Map<string, OtaCampaign>();
  constructor(private readonly installer: OtaInstaller) {}
  addCampaign(campaign: OtaCampaign): void { if (campaign.package.sizeBytes <= 0) throw new Error('OTA package size must be positive'); this.campaigns.set(campaign.id, campaign); }
  get(id: string): OtaCampaign { const c = this.campaigns.get(id); if (!c) throw new Error(`OTA campaign not found: ${id}`); return c; }
  async prepare(id: string): Promise<OtaCampaign> { const campaign = this.get(id); if (!(await this.installer.verify(campaign.package))) throw new Error('OTA package verification failed'); const updated = { ...campaign, state: 'ready-to-install' as const, progressPct: 100 }; this.campaigns.set(id, updated); return updated; }
  async install(id: string, vehicleSpeedKph: number): Promise<OtaCampaign> { if (vehicleSpeedKph > 0) throw new Error('OTA install requires vehicle parked'); const installed = await this.installer.install(this.get(id)); this.campaigns.set(id, installed); return installed; }
  async rollback(id: string): Promise<OtaCampaign> { const rolledBack = await this.installer.rollback(this.get(id)); this.campaigns.set(id, rolledBack); return rolledBack; }
  list(): OtaCampaign[] { return [...this.campaigns.values()]; }
}

export class SimulatorOtaInstaller implements OtaInstaller {
  verify(pkg: OtaPackage): boolean { return pkg.signature.startsWith('sim-signed:'); }
  install(campaign: OtaCampaign): OtaCampaign { return { ...campaign, state: 'installed', progressPct: 100 }; }
  rollback(campaign: OtaCampaign): OtaCampaign { return { ...campaign, state: 'rolled-back', progressPct: 100 }; }
}

export function createOtaUpdateManager(installer: OtaInstaller = new SimulatorOtaInstaller()): OtaUpdateManager { return new OtaUpdateManager(installer); }
