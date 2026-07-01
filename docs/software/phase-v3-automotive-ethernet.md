# Phase V3 — Automotive Ethernet

The `@aura-dcos/automotive-ethernet` package provides a service-oriented transport boundary for high-bandwidth and service-based vehicle communications.

## Scope

- Service descriptors for SOME/IP, DDS, HTTP, RTSP, UDP and TCP style integrations.
- Endpoint validation with host, port, VLAN and MAC metadata.
- QoS classification for control, diagnostics, media and sensor streams.
- Secure-service metadata for future secure gateway enforcement.
- Publish/request transport abstraction.
- Simulator transport for local development.

## Architecture

```text
AURA services / future sensor abstractions
        ↓
AutomotiveEthernetGateway
        ↓
EthernetTransport
        ↓
OEM gateway, middleware stack or simulator
```

## Production Notes

This package does not bind AURA to a specific AUTOSAR Adaptive, SOME/IP, DDS or vendor middleware stack. OEM adapters should implement `EthernetTransport` and map service descriptors into their runtime communication layer.

## Safety Boundary

The simulator blocks insecure control services. Full certificate, TLS, MACsec, identity and authorization enforcement belongs in the Secure Vehicle Gateway package.
