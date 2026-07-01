# Phase V14 — Window Controller

The `@aura-dcos/window-controller` package provides window position control with an anti-pinch policy seam.

## Scope

- Window state and command models.
- Position validation.
- Obstruction sensor health checks.
- Simulator adapter.

## Production Notes

OEM implementations should implement `WindowAdapter`. Closing movement is blocked when obstruction sensing is not healthy.
