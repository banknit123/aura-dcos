# Phase V19 — OEM Adapter SDK

The `@aura-dcos/oem-adapter-sdk` package provides adapter manifest validation and checklist generation.

## Scope

- Adapter manifest metadata.
- Required capability validation.
- Readiness checklist generation.

## Production Notes

This SDK is the contract boundary for manufacturer-specific integrations. Adapters should declare supported packages, vehicle platform metadata and required integration capabilities.
