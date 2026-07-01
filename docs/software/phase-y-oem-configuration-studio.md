# Phase Y — OEM Configuration Studio

Phase Y introduces manufacturer customization tooling for AURA DCOS.

## Package

`@aura-dcos/oem-configuration-studio`

## Scope

- OEM brand theme configuration.
- Vehicle platform and model-year metadata.
- Display surface enablement and brightness limits.
- Feature enablement states.
- Certification-required feature tracking.
- Exportable OEM configuration profiles.

## Production Notes

This package is the configuration contract for future OEM-specific Studio workflows. It validates configuration profiles before export so downstream installers, adapters and release tooling have a consistent source of truth.
