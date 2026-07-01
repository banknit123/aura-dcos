# Phase V - Vehicle Integration Framework

Phase V upgrades AURA DCOS vehicle integration from prototype seams into production-grade automotive platform boundaries.

The objective is not to claim universal plug-and-play support for all vehicles. The objective is to create clean software seams where OEM-specific adapters, safety gateways, diagnostics, cybersecurity controls and certified vehicle interfaces can be added without rewriting AURA Studio, Companion, Brain, Surface Manager or Output Manager.

## V-01 Hardware Abstraction Layer

The first Phase V package extends `@aura-dcos/hal` with a vehicle-grade HAL foundation.

### New contracts

- `VehicleBusKind` identifies CAN, CAN-FD, Automotive Ethernet, LIN, diagnostics and simulator bus families.
- `VehicleBusIdentity` describes a bus adapter, channel, bitrate and secure bus status.
- `VehicleEndpointDescriptor` describes discovered vehicle endpoints, domains, ECU addresses, state and capabilities.
- `VehicleEndpointCapability` declares read signals and write commands supported by an endpoint.
- `VehicleSignalFrame` is the normalized signal frame used by later signal management packages.
- `VehicleHalCommand` is the normalized command envelope used for HVAC, seats, doors, windows, lighting and future controller interfaces.
- `VehicleHalCommandResult` provides safe command acceptance or rejection feedback.
- `VehicleHalSnapshot` gives Studio and diagnostics a single read model for buses, endpoints and cached signals.

### Runtime behavior

`VehicleHardwareAbstractionLayer` provides:

1. Bus registration with duplicate protection.
2. Endpoint discovery across registered bus adapters.
3. Signal polling with a normalized signal cache.
4. Command validation before adapter execution.
5. Secure-bus enforcement for commands that require a secure route.
6. Snapshot generation for diagnostics and future Studio panels.

### Simulator support

`SimulatorVehicleBusAdapter` provides a deterministic local bus for development and tests. It exposes:

- a body/comfort domain endpoint for HVAC and ambient lighting;
- a body/closure domain endpoint for doors, windows and seats;
- valid simulator signals for temperature, lighting scene, door state and window position;
- accepted command echoing for supported commands.

This allows Phase V work to continue without real vehicle hardware while keeping the software architecture adapter-ready.

## Safety stance

The HAL is a software abstraction and integration seam. It does not bypass OEM safety systems and does not directly control production vehicle hardware. Any real deployment must route commands through OEM-approved gateways, safety policies, cybersecurity controls, diagnostic permissions and vehicle-specific validation.

## Tests

`software/packages/hal/tests/vehicle-hal.test.ts` covers:

- endpoint discovery and simulator signal caching;
- rejection before discovery;
- rejection of unsupported commands;
- routing of supported secure commands to the registered bus adapter.

Run the package tests with:

```bash
npm test --workspace @aura-dcos/hal
```

Run full release checks with:

```bash
npm run release:check
```

## Next Phase V package

V-02 should add CAN / CAN-FD contracts on top of the HAL foundation:

- CAN frame model;
- CAN-FD frame model;
- signal decoder registry;
- message freshness and quality state;
- safe command envelope mapping;
- deterministic simulator adapter tests.
