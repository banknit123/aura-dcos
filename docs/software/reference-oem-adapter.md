# Reference OEM Adapter

The Reference OEM Adapter is Milestone 5 of the AURA Core Stabilisation and Adaptability Program.

## Package

`@aura-dcos/reference-oem-adapter`

## Purpose

This package provides a simulator-backed example of how an OEM adapter connects a vehicle model to AURA Core v1.0 without changing the frozen core APIs.

## Included Reference Assets

- Reference 2032 SUV adapter id.
- Reference ECU topology.
- CAN-FD body ECU mappings.
- LIN comfort ECU mappings.
- Automotive Ethernet sensor gateway mappings.
- UDS-style simulator diagnostics.
- Gateway-protected command mappings.
- Camera, radar and LiDAR simulator bindings.

## Production Notes

The adapter is intentionally simulator-backed. Real OEM adapters must replace simulated mappings with manufacturer-specific bus databases, ECU documentation, security controls and hardware validation.
