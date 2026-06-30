import React, { useMemo, useState } from 'react';
import {
  createVehicleDisplayMapper,
  createVehicleIntegrationGateway,
  type DisplayRoutePlan,
  type IntegrationCommandResult,
  type IntegrationDiagnostics,
  type VehicleCabinProfile,
} from '@aura-dcos/vehicle-integration';

interface VehicleIntegrationPanelProps {
  requestedSurfaces: string[];
  onEvent?: (type: string, message: string) => void;
}

export function VehicleIntegrationPanel({ requestedSurfaces, onEvent }: VehicleIntegrationPanelProps) {
  const gateway = useMemo(() => createVehicleIntegrationGateway(), []);
  const [profile, setProfile] = useState<VehicleCabinProfile | undefined>();
  const [routes, setRoutes] = useState<DisplayRoutePlan[]>([]);
  const [diagnostics, setDiagnostics] = useState<IntegrationDiagnostics | undefined>();
  const [commandResult, setCommandResult] = useState<IntegrationCommandResult | undefined>();
  const [scanning, setScanning] = useState(false);

  async function scanVehicle(): Promise<void> {
    setScanning(true);
    const nextProfile = await gateway.discoverProfile();
    const nextRoutes = createVehicleDisplayMapper().map(nextProfile, requestedSurfaces);
    const nextDiagnostics = gateway.diagnostics(nextProfile);
    setProfile(nextProfile);
    setRoutes(nextRoutes);
    setDiagnostics(nextDiagnostics);
    setCommandResult(undefined);
    setScanning(false);
    onEvent?.('vehicle-integration.scanned', `Discovered ${nextProfile.hardware.length} hardware endpoints and ${nextRoutes.length} display routes.`);
  }

  async function testSafetyCommand(): Promise<void> {
    const result = await gateway.execute({
      target: 'display',
      action: 'enableImmersiveVideo',
      payload: { vehicleState: 'driving' },
      safetyCritical: false,
    });
    setCommandResult(result);
    onEvent?.('vehicle-integration.command-tested', `Safety command test result: ${result.decision}`);
  }

  return (
    <section className="vehicle-integration-panel">
      <div className="panel-title-row">
        <div>
          <p className="eyebrow">Phase R</p>
          <h2>Vehicle Integration Framework</h2>
        </div>
        <span className={`integration-pill ${profile?.mode ?? 'demo'}`}>{profile?.mode ?? 'demo'} mode</span>
      </div>

      <p className="muted">
        Simulator adapter active. This panel shows how AURA discovers hardware, builds a cabin profile,
        maps surfaces and tests safety-gated commands before OEM-specific adapters are connected.
      </p>

      <div className="actions two-col-actions">
        <button onClick={scanVehicle} disabled={scanning}>{scanning ? 'Scanning...' : 'Scan Vehicle'}</button>
        <button onClick={testSafetyCommand} disabled={!profile}>Test Safety Command</button>
      </div>

      {diagnostics && (
        <div className={`integration-diagnostics ${diagnostics.ready ? 'ready' : 'degraded'}`}>
          <strong>{diagnostics.ready ? 'Integration Ready' : 'Integration Needs Attention'}</strong>
          <span>{diagnostics.readyHardware}/{diagnostics.totalHardware} endpoints ready · {diagnostics.offlineHardware} offline</span>
        </div>
      )}

      {profile && (
        <div className="mini-grid integration-grid">
          <article>
            <strong>Cabin Profile</strong>
            <span>{profile.name}</span>
            <small>{profile.hardware.length} endpoints · {profile.displays.length} displays</small>
          </article>
          <article>
            <strong>Adapter</strong>
            <span>AURA Simulator Vehicle Adapter</span>
            <small>Demo path for OEM integration workflow</small>
          </article>
        </div>
      )}

      {routes.length > 0 && (
        <div className="integration-table-wrap">
          <h3>Display Mapping</h3>
          <table className="integration-table">
            <thead>
              <tr>
                <th>AURA Surface</th>
                <th>Vehicle Display</th>
                <th>Role</th>
                <th>Driver Safe</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr key={`${route.surfaceId}-${route.displayId}`}>
                  <td>{route.surfaceId}</td>
                  <td>{route.displayId}</td>
                  <td>{route.role}</td>
                  <td>{route.safeForDriver ? 'Yes' : 'Review'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {profile && (
        <div className="integration-hardware-list">
          <h3>Discovered Hardware</h3>
          {profile.hardware.slice(0, 8).map((item) => (
            <article key={item.id} className={`hardware-card ${item.health}`}>
              <strong>{item.name}</strong>
              <span>{item.kind} · {item.role}</span>
              <small>{item.capabilities.join(', ')}</small>
            </article>
          ))}
        </div>
      )}

      {commandResult && (
        <div className={`command-result ${commandResult.decision}`}>
          <strong>Safety command result: {commandResult.decision}</strong>
          <span>{commandResult.reason}</span>
        </div>
      )}
    </section>
  );
}
