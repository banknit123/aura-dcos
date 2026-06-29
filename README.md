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

Included packages:

- `@aura-dcos/kernel`
- `@aura-dcos/events`
- `@aura-dcos/logger`
- `@aura-dcos/config`
- `@aura-dcos/runtime`

## Commands

```bash
npm install
npm run typecheck
npm test
npm run build
```

## Project Principle

Every digital surface must either improve safety, reduce cognitive load, increase comfort, provide useful information, create a memorable experience, or disappear.

## Next Phase

Phase B will add the cabin foundation:

- Surface Manager
- Hardware Abstraction Layer
- Display Registry
- Digital Twin Engine
- Plugin SDK
