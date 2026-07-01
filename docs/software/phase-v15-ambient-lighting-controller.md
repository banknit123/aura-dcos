# Phase V15 — Ambient Lighting Controller

The `@aura-dcos/ambient-lighting` package provides zone-based cabin lighting control.

## Scope

- Lighting zones.
- RGB validation.
- Brightness validation.
- Scene metadata.
- Simulator adapter.

## Production Notes

OEM implementations should implement `LightingAdapter`. AURA scene logic can target lighting zones without knowing bus or ECU details.
