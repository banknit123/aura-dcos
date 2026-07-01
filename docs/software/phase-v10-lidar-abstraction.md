# Phase V10 — LiDAR Abstraction

The `@aura-dcos/lidar` package provides LiDAR endpoint and point-cloud reference abstractions.

## Scope

- LiDAR descriptors with position, range, field of view, rate and health.
- Point-cloud references with format, point count, sequence and URI metadata.
- Simulator provider for local development.

## Architecture

```text
OEM LiDAR provider / simulator
        ↓
LidarManager
        ↓
Perception, Digital Twin, Autonomy and Studio
```

## Production Notes

Raw point-cloud buffers and vendor SDK details stay behind `LidarProvider`. Higher-level AURA services consume point-cloud references and metadata so production integrations can use shared memory, files, middleware topics or Automotive Ethernet streams without API changes.
