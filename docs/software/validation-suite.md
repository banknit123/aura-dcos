# Validation Suite

The Validation Suite is Milestone 4 of the AURA Core Stabilisation and Adaptability Program.

## Package

`@aura-dcos/validation-suite`

## Purpose

The suite checks whether an OEM adapter and vehicle profile are ready to integrate with AURA Core v1.0.

## Validation Domains

- Missing required signals.
- Unsafe vehicle commands not routed through Secure Vehicle Gateway.
- Diagnostics readiness.
- OTA readiness.
- Safety checklist completion.
- Cybersecurity checklist completion.
- Overall integration readiness score.

## Readiness Output

The suite returns a `ValidationReport` containing:

- `ready` boolean.
- Readiness score.
- Findings grouped by domain and severity.
- Checklist state.
- Summary messages.

## Production Notes

This suite is a software readiness validator. Real production deployment still requires OEM validation, functional safety assessment, cybersecurity review, HMI compliance, hardware-in-loop testing and vehicle certification.
