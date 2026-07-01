# Phase V5 — Diagnostics Framework

The `@aura-dcos/diagnostics` package provides the diagnostic service boundary for UDS and OBD-II-ready vehicle integration.

## Scope

- ECU identity registry.
- UDS-style request/response model.
- OBD-II live data access abstraction.
- Diagnostic session management.
- Security seed/key seam.
- DTC read, record and clear workflow.
- Simulator diagnostic transport for local development.

## Architecture

```text
Vehicle Integration Studio / future ECU Discovery
        ↓
DiagnosticsGateway
        ↓
DiagnosticTransport
        ↓
UDS, OBD-II, DoIP, CAN diagnostics or simulator
```

## Production Notes

This package defines the diagnostic application boundary. It does not perform real flashing, unlock production ECUs, bypass security, or provide unsafe diagnostic operations. Real UDS, DoIP, ISO-TP and OBD-II transports should implement `DiagnosticTransport` and remain subject to Secure Vehicle Gateway authorization.

## Safety Boundary

DTC clearing requires an extended diagnostic session. Programming and flash workflows are intentionally architecture-only at this stage and should be implemented only behind OEM-authorized security and release controls.
