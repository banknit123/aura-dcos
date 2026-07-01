# Phase V12 — Seat Controller

The `@aura-dcos/seat-controller` package provides safety-bounded seat preset and movement abstractions.

## Scope

- Seat position model.
- Preset registration.
- Park-only and low-speed movement policies.
- Simulator adapter.

## Production Notes

OEM seat implementations should implement `SeatAdapter`. Movement policies are enforced before commands reach vehicle hardware.
