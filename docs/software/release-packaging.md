# Release Packaging

Release Packaging is Milestone 6 of the AURA Core Stabilisation and Adaptability Program.

## Package

`@aura-dcos/release-packaging`

## Purpose

This package defines bundle, installer and rollback manifests for an AURA deployment made from:

- AURA Core bundle.
- OEM Adapter bundle.
- Vehicle Profile bundle.
- Validation report and documentation bundles.

## Capabilities

- Core bundle manifest generation.
- OEM adapter bundle manifest generation.
- Vehicle profile bundle manifest generation.
- Installer manifest generation.
- Required install steps.
- Rollback manifest generation.
- Packaging validation.

## Production Notes

The package defines deployment metadata and validation rules. Real deployment must add signed artifacts, secure storage, device-specific installation scripts, hardware validation and OEM release approval.
