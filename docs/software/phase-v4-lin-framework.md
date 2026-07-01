# Phase V4 — LIN Bus Framework

The `@aura-dcos/lin` package provides the low-speed body electronics communication layer for AURA DCOS.

## Scope

- LIN frame definitions.
- Classic/enhanced checksum metadata.
- Master-style header and response flow.
- Schedule table registration and activation.
- Sleep/wake lifecycle.
- Simulator driver for tests and local development.

## Target Use Cases

- Window controllers.
- Seat controllers.
- Mirror controllers.
- Ambient lighting nodes.
- Low-speed body electronics modules.

## Architecture

```text
Future body controllers
        ↓
LinBus
        ↓
LinDriver
        ↓
LIN interface, body controller gateway or simulator
```

## Production Notes

LIN transport details are intentionally isolated behind `LinDriver`. OEM-specific LIN masters, USB-LIN adapters and gateway-backed implementations should implement the driver interface without changing higher-level AURA controllers.
