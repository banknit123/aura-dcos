# Phase V2 — CAN / CAN-FD Framework

The `@aura-dcos/can` package provides the first production-oriented vehicle bus layer for AURA DCOS.

## Scope

- Classic CAN 11-bit identifiers.
- Extended CAN 29-bit identifiers.
- CAN-FD payload support up to 64 bytes.
- Hardware-independent `CanDriver` interface.
- Bus lifecycle management.
- Acceptance filtering.
- Event subscription.
- Basic signal encode/decode architecture.
- Simulator driver for local development and tests.

## Architecture

```text
Vehicle controller / future signal manager
        ↓
CanBusManager
        ↓
CanBus
        ↓
CanDriver
        ↓
Hardware adapter or simulator
```

## Production Notes

This package is intentionally transport-safe and does not assume a specific USB-CAN, PCIe-CAN, SocketCAN or OEM gateway implementation. Those adapters should implement `CanDriver` and remain isolated from the rest of AURA.

DBC support is represented through message and signal definitions. A future importer can convert DBC files into `CanMessageDefinition` objects without changing the runtime bus API.

## Safety Boundary

The CAN package validates identifiers, payload length and byte values. Safety policy remains above this layer in the Secure Vehicle Gateway and command authorization layers.
