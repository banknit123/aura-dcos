# OEM Adapter Toolkit

The OEM Adapter Toolkit is Milestone 2 of the AURA Core Stabilisation and Adaptability Program.

## Package

`@aura-dcos/oem-adapter-toolkit`

## Purpose

The toolkit helps manufacturers create vehicle-specific adapters without modifying AURA Core v1.0.

## Capabilities

- OEM adapter scaffold generation.
- Signal mapping templates for CAN, CAN-FD, LIN, Automotive Ethernet, diagnostics and simulator buses.
- ECU scanner template generation.
- Diagnostics connector templates for UDS and OBD-II.
- Compatibility analysis with missing signal and missing command detection.
- Readiness scoring for adapter completeness.

## Workflow

1. Create an OEM adapter blueprint.
2. Generate the adapter scaffold.
3. Define signal mappings.
4. Define diagnostics connectors.
5. Define ECU scanner expectations.
6. Run compatibility analysis.
7. Resolve missing required signals or diagnostics gaps.

## Boundary Rule

The toolkit does not change AURA Core. It creates adapter and configuration assets that integrate through the stable adapter-boundary packages defined by `@aura-dcos/core-stability`.

## Production Notes

Generated adapters are scaffolds. Real OEM integrations still require bus-specific drivers, ECU documentation, cybersecurity review, HMI compliance and vehicle validation.
