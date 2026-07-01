# Phase V13 — Door Controller

The `@aura-dcos/door-controller` package provides lock, child-lock and ajar-state abstractions.

## Scope

- Door state and command models.
- Speed-aware unlock policy.
- Simulator adapter.

## Production Notes

OEM implementations should implement `DoorAdapter`. Safety policy is enforced before commands are delegated to the adapter.
