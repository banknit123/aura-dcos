# AURA DCOS

AURA DCOS is the software foundation for the AURA Digital Cabin Operating System.

The project combines:

- Digital Cabin Operating System architecture
- Engineering documentation
- Modular software packages
- Digital surface orchestration
- Hardware abstraction for prototype displays, projectors and future vehicle hardware

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

## Current Build

**Phase A: Core Runtime** is complete at foundation level.

**Phase B: Cabin Foundation** includes the first cabin-specific packages.

**Phase C: AURA Studio** includes the first runnable browser app and multi-output routes.

**Phase D: Orchestration Foundation** adds synchronisation, scene, routing and animation packages.

**Phase E: Studio Orchestration** connects Studio to orchestration packages.

**Phase F: Output Planning** adds hardware-aware output profiles and launch planning.

## Included packages

- `@aura-dcos/kernel`
- `@aura-dcos/events`
- `@aura-dcos/logger`
- `@aura-dcos/config`
- `@aura-dcos/runtime`
- `@aura-dcos/surfaces`
- `@aura-dcos/hal`
- `@aura-dcos/digital-twin`
- `@aura-dcos/capabilities`
- `@aura-dcos/cabin-sync`
- `@aura-dcos/scenes`
- `@aura-dcos/display-router`
- `@aura-dcos/animation-engine`
- `@aura-dcos/output-manager`

## Included apps

- `@aura-dcos/studio`

## Commands

Install dependencies:

```bash
npm install
```

Run AURA Studio:

```bash
npm run dev --workspace @aura-dcos/studio
```

Open output windows from the Studio controller, or directly use:

```text
?output=dashboard
?output=roof
?output=projection
?output=floor
```

Quality checks:

```bash
npm run typecheck
npm test
npm run build
```

## Cleanup status

Completed cleanup:

- Removed unused `scene-engine` package files.
- Confirmed `@aura-dcos/scenes` is the active scene package.
- Added tests for scenes, cabin sync, display router, animation engine and output manager.
- Updated package list to reflect the current architecture.

## Project Principle

Every digital surface must either improve safety, reduce cognitive load, increase comfort, provide useful information, create a memorable experience, or disappear.

## Next Phase

Phase G should add real hardware run support: kiosk/fullscreen launch scripts, projector setup guidance and calibration screens.
