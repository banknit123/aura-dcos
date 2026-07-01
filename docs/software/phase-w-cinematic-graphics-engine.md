# Phase W — Cinematic Graphics Engine

Phase W introduces the cinematic visual foundation for AURA DCOS.

## Package

`@aura-dcos/cinematic-graphics`

## Scope

- Graphics surface descriptors for dashboard, HUD, roof, doors, floor, rear cabin, projection and passenger displays.
- Shader effect descriptors with uniform metadata and driver-safety flags.
- Particle system descriptors with cost and safety metadata.
- Cinematic layers with z-index, opacity and effect bindings.
- Cinematic scenes with quality budgets.
- Frame planning across multiple cabin surfaces.
- Scene transition validation.
- Studio-ready engine snapshots.
- AURA launch cinematic scene factory.

## Architecture

```text
Experience Director / Keynote Mode / Studio
        ↓
CinematicGraphicsEngine
        ↓
FramePlan per cabin surface
        ↓
Future renderer adapters: WebGPU, WebGL, native GPU, OEM compositor
```

## Safety Boundary

Driver-visible surfaces are evaluated for unsafe effects and particle systems. The engine reports driver-safety per surface so Studio and future renderers can avoid presenting distracting visuals on driver-visible displays.

## Production Notes

The package intentionally models render planning and cinematic descriptors rather than binding directly to WebGPU, WebGL, Unreal, Unity or an OEM compositor. Renderer-specific adapters can consume `FramePlan` without changing scene authoring APIs.
