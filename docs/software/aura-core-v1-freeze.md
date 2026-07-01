# AURA Core v1.0 Freeze

This document defines the first stable AURA Core baseline.

## Goal

AURA Core v1.0 freezes the shared platform contracts that OEM adapters and vehicle profiles should depend on. Vehicle-specific code must remain outside the core and integrate through adapter-boundary packages.

## Package

`@aura-dcos/core-stability`

## Stable Core Surfaces

- Runtime lifecycle.
- Event bus and event envelopes.
- Configuration registry.
- Surface model and output planning.
- Companion state.
- Brain intent and safety-gated action planning.
- Voice and language-model adapter contracts.
- Autonomy cycle and cabin signals.
- Digital Twin cabin state.
- Cinematic Graphics frame planning.
- AI Cabin Intelligence consent-aware memory and personalization actions.

## Adapter Boundaries

OEM and vehicle-specific integrations must use adapter-boundary packages instead of changing AURA Core:

- `@aura-dcos/vehicle-signals`
- `@aura-dcos/secure-vehicle-gateway`
- `@aura-dcos/ota-update-manager`
- Vehicle bus packages such as CAN, LIN and Automotive Ethernet.
- Sensor packages such as Camera, Radar and LiDAR.

## Freeze Rules

- Stable package exported contracts require major-version changes for breaking changes.
- OEM-specific code must integrate through adapter-boundary packages.
- AURA Core must remain simulator-runnable without real vehicle hardware.
- Vehicle-facing commands must pass through safety or secure gateway policy.
- Personalization memory must respect occupant consent.

## Outcome

AURA Core v1.0 is the common platform baseline. Future work should add OEM adapters, vehicle profiles and deployment bundles without modifying stable core contracts unless a deliberate major version is introduced.
