export type StudioPanelId = 'discovery' | 'diagnostics' | 'signals' | 'commands' | 'sensors' | 'ota' | 'oem';
export type StudioPanelStatus = 'ready' | 'warning' | 'blocked';

export interface StudioPanel {
  id: StudioPanelId;
  title: string;
  status: StudioPanelStatus;
  summary: string;
  items: string[];
}

export interface VehicleIntegrationStudioSnapshot {
  panels: StudioPanel[];
  ready: boolean;
  messages: string[];
}

export class VehicleIntegrationStudioModel {
  private readonly panels = new Map<StudioPanelId, StudioPanel>();

  upsertPanel(panel: StudioPanel): void {
    this.panels.set(panel.id, panel);
  }

  panel(id: StudioPanelId): StudioPanel {
    const panel = this.panels.get(id);
    if (!panel) throw new Error(`Vehicle Integration Studio panel not registered: ${id}`);
    return panel;
  }

  snapshot(): VehicleIntegrationStudioSnapshot {
    const panels = [...this.panels.values()];
    return {
      panels,
      ready: panels.length > 0 && panels.every((panel) => panel.status !== 'blocked'),
      messages: [`${panels.length} Vehicle Integration Studio panels registered.`],
    };
  }
}

export function createVehicleIntegrationStudioModel(): VehicleIntegrationStudioModel {
  const model = new VehicleIntegrationStudioModel();
  model.upsertPanel({ id: 'discovery', title: 'ECU Discovery', status: 'ready', summary: 'ECU identity and capability discovery.', items: [] });
  model.upsertPanel({ id: 'diagnostics', title: 'Diagnostics', status: 'ready', summary: 'UDS and OBD-II diagnostic visibility.', items: [] });
  model.upsertPanel({ id: 'signals', title: 'Signal Watch', status: 'ready', summary: 'Normalized signal freshness and quality.', items: [] });
  model.upsertPanel({ id: 'commands', title: 'Command Simulation', status: 'warning', summary: 'Safe command simulation through gateway policy.', items: [] });
  model.upsertPanel({ id: 'sensors', title: 'Sensor Streams', status: 'ready', summary: 'Camera, radar and LiDAR endpoint health.', items: [] });
  model.upsertPanel({ id: 'ota', title: 'OTA', status: 'warning', summary: 'Update campaign lifecycle monitoring.', items: [] });
  model.upsertPanel({ id: 'oem', title: 'OEM Adapter', status: 'ready', summary: 'OEM adapter manifest validation.', items: [] });
  return model;
}
