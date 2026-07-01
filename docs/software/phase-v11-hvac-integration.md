# Phase V11 — HVAC Integration

The `@aura-dcos/hvac` package provides a safety-bounded HVAC controller abstraction.

## Scope

- Cabin zone state.
- Temperature, fan, mode and recirculation commands.
- Safe cabin temperature and fan-level validation.
- Simulator adapter for local development.

## Production Notes

OEM HVAC implementations should implement `HvacAdapter`. The controller validates command limits before delegating to vehicle hardware or simulator adapters.
