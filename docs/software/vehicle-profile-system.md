# Vehicle Profile System

The Vehicle Profile System is Milestone 3 of the AURA Core Stabilisation and Adaptability Program.

## Package

`@aura-dcos/vehicle-profile-system`

## Purpose

Vehicle profiles describe a specific OEM vehicle model and model year without changing AURA Core. They sit between the OEM adapter and AURA Core runtime packages.

## Profile Contents

A vehicle profile defines:

- OEM identity, vehicle platform, model and model year.
- Body style.
- Required AURA Core version.
- OEM adapter id.
- Display surfaces and driver-visibility metadata.
- Cabin controls such as HVAC, seats, doors, windows, lighting and audio.
- Sensors such as cameras, radar, LiDAR, occupant and environment sensors.
- Bus mapping references for CAN, CAN-FD, LIN, Automotive Ethernet and diagnostics.

## Validation

The package validates:

- Required identity metadata.
- Semantic AURA Core version.
- At least one enabled display.
- Display dimensions and refresh rates.
- Control domain coverage.
- Sensor declarations.
- Bus mapping completeness.

## Reference Profile

`createReferenceSuvProfile()` provides a simulator-ready reference SUV profile for OEM adapter development and future validation suites.

## Boundary Rule

Vehicle profiles must not change AURA Core. They configure how an OEM adapter and vehicle model connect to the stable AURA Core v1.0 interfaces.
