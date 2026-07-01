# Phase V9 — Radar Abstraction

The `@aura-dcos/radar` package provides radar endpoint and object-list abstractions.

## Scope

- Radar descriptors with position, range, field of view and health.
- Radar object frames with range, azimuth, relative velocity and confidence.
- Simulator provider for local development.

## Architecture

```text
OEM radar provider / simulator
        ↓
RadarManager
        ↓
Perception, Digital Twin, Autonomy and Studio
```

## Production Notes

Radar signal processing, raw point returns and vendor SDK details should stay behind `RadarProvider`. Higher-level AURA services consume object frames and health metadata.
