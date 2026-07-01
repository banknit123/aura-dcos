# Phase V17 — OTA Update Manager

The `@aura-dcos/ota-update-manager` package provides a safe OTA campaign lifecycle seam.

## Scope

- OTA package manifest.
- Campaign state tracking.
- Download/install/rollback state transitions.
- Parked-vehicle policy for install and rollback.

## Production Notes

This package does not download or flash binaries. It defines the lifecycle and safety policy seam that future signed update transports and OEM deployment systems can implement.
