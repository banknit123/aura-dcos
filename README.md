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

**Phase B: Cabin Foundation** has started and includes the first cabin-specific packages.

**Phase C: AURA Studio** has started with the first runnable browser app.

Included packages:

- `@aura-dcos/kernel`
- `@aura-dcos/events`
- `@aura-dcos/logger`
- `@aura-dcos/config`
- `@aura-dcos/runtime`
- `@aura-dcos/surfaces`
- `@aura-dcos/hal`
- `@aura-dcos/digital-twin`
- `@aura-dcos/capabilities`

Included apps:

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

Quality checks:

```bash
npm run typecheck
npm test
npm run build
```

## Project Principle

Every digital surface must either improve safety, reduce cognitive load, increase comfort, provide useful information, create a memorable experience, or disappear.

## Next Phase

Phase C should continue by replacing local UI logic with direct imports from the DCOS packages and adding multi-screen output pages.
