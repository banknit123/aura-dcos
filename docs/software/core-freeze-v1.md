# AURA Core v1.0 Freeze

AURA Core v1.0 defines the stable software platform that OEM adapters and vehicle profiles integrate with.

## Goal

Freeze the shared AURA platform so vehicle-specific work happens through adapters and configuration rather than changes to the core.

## Stable Core APIs

Stable APIs are protected by semantic versioning. Breaking changes require a major version change.

Core stable packages include:

- `@aura-dcos/runtime`
- `@aura-dcos/events`
- `@aura-dcos/config`
- `@aura-dcos/surfaces`
- `@aura-dcos/output-manager`
- `@aura-dcos/companion`
- `@aura-dcos/brain`
- `@aura-dcos/voice-bridge`
- `@aura-dcos/autonomy`
- `@aura-dcos/digital-twin`
- `@aura-dcos/cinematic-graphics`
- `@aura-dcos/ai-cabin-intelligence`

## OEM Adapter Boundaries

OEM and vehicle-specific integrations must enter through adapter-boundary packages:

- `@aura-dcos/vehicle-signals`
- `@aura-dcos/secure-vehicle-gateway`
- `@aura-dcos/ota-update-manager`
- `@aura-dcos/oem-adapter-sdk`
- `@aura-dcos/oem-configuration-studio`

## Freeze Rules

1. Stable APIs require a major version change for breaking changes.
2. Vehicle-specific code must not be added directly to AURA Core.
3. Core must remain simulator-runnable without real vehicle hardware.
4. Vehicle-facing commands must pass through safety or secure gateway policy.
5. Personalization memory must respect occupant consent.

## Release Outcome

AURA Core v1.0 is the stable base for future OEM adapter work, vehicle profile work, Studio Professional tooling and deployment packaging.
