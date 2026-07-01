# AURA DCOS

AURA DCOS is the software foundation for the AURA Digital Cabin Operating System.

The project combines engineering documentation, modular software packages, digital surface orchestration, hardware abstraction, cinematic graphics and AI-assisted cabin intelligence.

## Current Build

**Phase A through Phase U** are complete.

**Studio Track STU-1 through STU-5** is complete.

**Phase V: Production Vehicle Integration Framework** is complete. It adds the production HAL, vehicle communication backbone, signal manager, ECU discovery, sensor abstractions, body/comfort/audio controllers, OTA lifecycle, secure gateway, OEM adapter SDK and Vehicle Integration Studio model.

**Phase W: Cinematic Graphics Engine** is complete. It adds render planning, shader/effect descriptors, particle systems, transitions, cabin visual scenes, quality budgets and driver-visible safety checks.

**Milestone 1: Demo Ready** is the stabilization track for clean local execution and demonstration. See `docs/software/milestone-1-demo-ready.md`.

## Repository Structure

```text
aura-dcos/
├── docs/
│   ├── engineering/
│   └── software/
├── software/
│   ├── apps/
│   ├── packages/
│   ├── scripts/
│   └── tests/
├── assets/
└── .github/workflows/
```

## Included packages

- `@aura-dcos/kernel`
- `@aura-dcos/events`
- `@aura-dcos/logger`
- `@aura-dcos/config`
- `@aura-dcos/runtime`
- `@aura-dcos/surfaces`
- `@aura-dcos/hal`
- `@aura-dcos/can`
- `@aura-dcos/automotive-ethernet`
- `@aura-dcos/lin`
- `@aura-dcos/diagnostics`
- `@aura-dcos/vehicle-signals`
- `@aura-dcos/ecu-discovery`
- `@aura-dcos/camera`
- `@aura-dcos/radar`
- `@aura-dcos/lidar`
- `@aura-dcos/hvac`
- `@aura-dcos/seat-controller`
- `@aura-dcos/door-controller`
- `@aura-dcos/window-controller`
- `@aura-dcos/ambient-lighting`
- `@aura-dcos/audio-amplifier`
- `@aura-dcos/ota-update-manager`
- `@aura-dcos/secure-vehicle-gateway`
- `@aura-dcos/oem-adapter-sdk`
- `@aura-dcos/vehicle-integration-studio`
- `@aura-dcos/cinematic-graphics`
- `@aura-dcos/digital-twin`
- `@aura-dcos/capabilities`
- `@aura-dcos/cabin-sync`
- `@aura-dcos/scenes`
- `@aura-dcos/display-router`
- `@aura-dcos/animation-engine`
- `@aura-dcos/output-manager`
- `@aura-dcos/calibration`
- `@aura-dcos/profile-store`
- `@aura-dcos/companion`
- `@aura-dcos/brain`
- `@aura-dcos/voice-bridge`
- `@aura-dcos/ai-adapter`
- `@aura-dcos/autonomy`
- `@aura-dcos/integrations`
- `@aura-dcos/simulator`
- `@aura-dcos/vehicle-platform`
- `@aura-dcos/vehicle-integration`

## Included apps

- `@aura-dcos/studio`

## Quick start

```bash
git clone https://github.com/banknit123/aura-dcos.git
cd aura-dcos
npm install
npm run release:check
npm run dev --workspace @aura-dcos/studio
```

## Quality and release checks

```bash
npm run validate
npm run health
npm run typecheck
npm test
npm run build
npm run release:check
```

## Phase V Vehicle Integration Framework

Phase V expands the production vehicle integration foundation. See `docs/project-roadmap.md` and `docs/software/phase-v*.md`.

## Phase W Cinematic Graphics Engine

Phase W adds `@aura-dcos/cinematic-graphics` for cinematic multi-surface rendering orchestration:

- Graphics surface descriptors.
- Shader/effect descriptors.
- Particle system descriptors.
- Cinematic layers and scenes.
- Multi-screen frame planning.
- Scene transitions.
- Quality budgets.
- Driver-visible safety checks.
- Studio-ready snapshots.

See `docs/software/phase-w-cinematic-graphics-engine.md`.

## Project Principle

Every digital surface must either improve safety, reduce cognitive load, increase comfort, provide useful information, create a memorable experience, or disappear.
