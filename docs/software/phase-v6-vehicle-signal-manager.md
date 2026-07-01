# Phase V6 — Vehicle Signal Manager

The `@aura-dcos/vehicle-signals` package provides the normalized vehicle signal store for Phase V.

## Scope

- Signal definitions with domain, freshness, unit and writability metadata.
- Signal sample ingestion with source, timestamp and quality.
- Freshness validation.
- Stale signal detection.
- Per-signal and global subscriptions.
- Snapshot reporting for future Studio panels.

## Architecture

```text
CAN / LIN / Ethernet / Diagnostics / Sensors
        ↓
VehicleSignalManager
        ↓
Autonomy, Digital Twin, Studio, controllers
```

## Production Notes

The signal manager is transport-neutral. It accepts normalized samples from any lower-level adapter and exposes a single quality-aware view to higher-level AURA packages.
