# Phase V18 — Secure Vehicle Gateway

The `@aura-dcos/secure-vehicle-gateway` package provides command authorization and audit seams.

## Scope

- Gateway command risk classification.
- Parked-vehicle enforcement.
- Trusted ECU enforcement.
- Audit event generation.

## Production Notes

This package is a policy seam. OEM deployments should connect it to identity, certificates, secure boot, signed commands and cybersecurity controls.
