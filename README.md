# AURA DCOS

AURA DCOS is the software foundation for the AURA Digital Cabin Operating System.

The project combines engineering documentation, modular software packages, digital surface orchestration, hardware abstraction, cinematic graphics, AI-assisted cabin intelligence, OEM configuration and production release tooling.

## Current Build

**Phase A through Phase Z** are complete at production-platform foundation level.

**AURA Core v1.0 Freeze** is complete. Stable core APIs, adapter boundaries, compatibility rules and freeze validation are now defined in `@aura-dcos/core-stability`.

**Studio Track STU-1 through STU-5** is complete.

**Phase V: Production Vehicle Integration Framework** is complete. It adds the production HAL, vehicle communication backbone, signal manager, ECU discovery, sensor abstractions, body/comfort/audio controllers, OTA lifecycle, secure gateway, OEM adapter SDK and Vehicle Integration Studio model.

**Phase W: Cinematic Graphics Engine** is complete. It adds render planning, shader/effect descriptors, particle systems, transitions, cabin visual scenes, quality budgets and driver-visible safety checks.

**Phase X: AI Cabin Intelligence** is complete. It adds consent-aware memory, emotion inference, personalization planning and safety-first cabin suggestions.

**Phase Y: OEM Configuration Studio** is complete. It adds OEM theming, surface configuration, feature enablement, certification tracking and exportable configuration profiles.

**Phase Z: Production Release** is complete. It adds release candidates, release artifacts, readiness gates, release reporting and production validation seams.

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

- `@aura-dcos/core-stability`
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
- `@aura-dcos/ai-cabin-intelligence`
- `@aura-dcos/oem-configuration-studio`
- `@aura-dcos/production-release`
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

## Production Platform Tracks

- AURA Core v1.0 Freeze — see `docs/software/aura-core-v1-freeze.md`.
- Phase V: Vehicle Integration Framework — see `docs/software/phase-v*.md`.
- Phase W: Cinematic Graphics Engine — see `docs/software/phase-w-cinematic-graphics-engine.md`.
- Phase X: AI Cabin Intelligence — see `docs/software/phase-x-ai-cabin-intelligence.md`.
- Phase Y: OEM Configuration Studio — see `docs/software/phase-y-oem-configuration-studio.md`.
- Phase Z: Production Release — see `docs/software/phase-z-production-release.md`.

## Project Principle

Every digital surface must either improve safety, reduce cognitive load, increase comfort, provide useful information, create a memorable experience, or disappear.
