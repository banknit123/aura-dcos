# Phase V7 — ECU Discovery

The `@aura-dcos/ecu-discovery` package discovers and records ECU identity, capability and trust metadata.

## Scope

- Discovery probes for CAN, CAN-FD, LIN, Automotive Ethernet, diagnostics and simulator paths.
- ECU descriptors with address, domain, bus, versions and capabilities.
- Trust-state management.
- Snapshot summaries for future Vehicle Integration Studio panels.

## Architecture

```text
Bus and diagnostic probes
        ↓
EcuDiscoveryService
        ↓
Vehicle Signal Manager, Diagnostics, Secure Gateway, Studio
```

## Production Notes

OEM-specific discovery should implement `EcuDiscoveryProbe`. The service does not assume a single discovery method because production vehicles may expose ECU metadata through diagnostics, gateway manifests, SOME/IP service discovery or OEM configuration files.
