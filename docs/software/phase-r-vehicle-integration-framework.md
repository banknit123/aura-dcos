# Phase R — Vehicle Integration Framework

Phase R adds the Vehicle Integration Framework (VIF), the layer that moves AURA from a simulator-first platform toward a hardware-adaptive OEM integration platform.

## Objective

AURA should not be rewritten for every vehicle. Vehicle-specific hardware, buses and APIs should be isolated behind adapters so the AURA Experience, Brain, Voice, Companion and Display systems can use common interfaces.

## Positioning

AURA is not positioned as a replacement for Android Automotive, QNX, AUTOSAR or an OEM base operating system. AURA sits above those systems as an intelligent cabin orchestration layer.

```text
AURA Experience / Brain / Voice / Companion
                    ↓
Vehicle Integration Framework
                    ↓
OEM Adapter Layer
                    ↓
Android Automotive / QNX / Linux / ROS 2 / CAN / Ethernet
                    ↓
Vehicle hardware
```

## Package

```text
@aura-dcos/vehicle-integration
```

## Core capabilities

### Vehicle Abstraction Layer

Defines a common hardware descriptor model for displays, sensors, actuators, audio, lighting, network endpoints and compute endpoints.

### Hardware Discovery

The framework can ask an adapter to discover available hardware and turn the result into a `VehicleCabinProfile`.

### Display Mapping

AURA surfaces such as dashboard, roof, projection and floor can be mapped to actual vehicle display hardware.

### Integration Gateway

The gateway executes commands through the selected adapter and returns safety-aware command decisions.

### Diagnostics

The framework reports readiness, degraded hardware, offline hardware and integration messages.

### Simulator Adapter

A simulator-backed adapter is included so the same integration workflow can run without real vehicle hardware.

## Demo Mode vs Integration Mode

### Demo Mode

- Uses simulator hardware descriptors.
- Runs on a laptop.
- Demonstrates the integration workflow without a real car.

### Integration Mode

- Uses OEM-supplied adapters.
- Reads actual hardware capabilities.
- Routes AURA outputs to real vehicle displays and systems.

### Production Mode

- Requires OEM safety, cybersecurity, HMI and regional compliance processes.
- Must use certified vehicle gateways for safety-critical actions.

## Plug-and-play readiness

Phase R makes AURA hardware-adaptive and integration-ready. It does not mean AURA can be installed into any production car with zero OEM work.

The correct positioning is:

> AURA is designed to be integrated through vehicle adapters, hardware discovery and display mapping so OEMs can deploy the same cabin intelligence across different vehicle architectures with minimal product-code changes.

## Current included adapter

The simulator adapter exposes:

- Driver dashboard
- Digital roof
- Guidance floor
- AURA projection
- Speed sensor
- Occupancy sensor
- Lighting zones
- Spatial audio system

## Example flow

```ts
const gateway = createVehicleIntegrationGateway();
const profile = await gateway.discoverProfile();
const routes = createVehicleDisplayMapper().map(profile, ['dashboard', 'roof', 'projection', 'floor']);
const diagnostics = gateway.diagnostics(profile);
```

## Compliance note

Phase R introduces compliance-ready seams but does not certify the platform. Production deployment would require OEM-led work against standards such as ISO 26262, ISO/SAE 21434, UNECE R155/R156, ASPICE and regional HMI distraction requirements.
