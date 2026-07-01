# AURA DCOS Master Roadmap

This roadmap is the authoritative checklist for AURA DCOS development across chats, phases and packages.

## Completed foundation

| Phase | Status | Scope |
| --- | --- | --- |
| A | Complete | Core Runtime foundation |
| B | Complete | Cabin Foundation packages |
| C | Complete | AURA Studio browser app and routes |
| D | Complete | Orchestration Foundation |
| E | Complete | Studio Orchestration |
| F | Complete | Output Planning |
| G | Complete | Hardware Run Support |
| H | Complete | AURA Director |
| I | Complete | Layout Profiles |
| J | Complete | AURA Companion |
| K | Complete | Build Hardening |
| L | Complete | AURA Brain |
| M | Complete | Voice and LLM Integration |
| N | Complete | Autonomous Cabin Intelligence |
| O | Complete | Provider and Vehicle Integration Layer |
| P | Complete | Vehicle and Sensor Simulator |
| Q | Complete | Production Vehicle Platform Foundation |
| R | Complete | Vehicle Integration Framework foundation |
| S | Complete | Vehicle platform/studio continuation package |
| T | Complete | Studio and integration continuation package |
| U | Complete | Experience Director and Studio production demo track |
| V | Complete | Production Vehicle Integration Framework |
| W | Complete | Cinematic Graphics Engine |
| X | Complete | AI Cabin Intelligence |
| Y | Complete | OEM Configuration Studio |
| Z | Complete | Production Release |

## Studio production track

| Package | Status | Notes |
| --- | --- | --- |
| STU-1 Experience Director | Complete | One-click Experience Director integrated |
| STU-2 Cinematic Engine | Complete | Cinematic Engine package created |
| STU-3 Emotion Engine | Complete | Emotion Engine package created |
| STU-4 Keynote Mode | Complete | Keynote Mode package created |
| STU-5 Demo Runbook | Complete | Demo runbook completed |

## Phase V - Vehicle Integration Framework

| Order | Package | Status | Deliverables |
| --- | --- | --- | --- |
| V-01 | Hardware Abstraction Layer | Complete | Vehicle HAL contracts, simulator bus, command routing, signal polling, docs, tests |
| V-02 | CAN / CAN-FD | Complete | CAN/CAN-FD frame contracts, filtering, codec seam, simulator driver, tests, docs |
| V-03 | Automotive Ethernet | Complete | Service descriptors, QoS, secure-service metadata, simulator transport, tests, docs |
| V-04 | LIN Bus | Complete | Low-speed body control abstraction, schedule tables, sleep/wake handling, tests, docs |
| V-05 | Diagnostics | Complete | UDS / OBD-II-ready architecture, ECU identity, DTC lifecycle, sessions, tests, docs |
| V-06 | Vehicle Signal Manager | Complete | Normalized signal store, freshness, quality, subscriptions, tests, docs |
| V-07 | ECU Discovery | Complete | ECU identity, capability discovery, trust state, simulator probe, tests, docs |
| V-08 | Camera Abstraction | Complete | Camera endpoint contracts, metadata, frame references, simulator provider, tests, docs |
| V-09 | Radar Abstraction | Complete | Radar object list contracts, endpoint health, simulator provider, tests, docs |
| V-10 | LiDAR Abstraction | Complete | Point-cloud reference contracts, endpoint health, simulator provider, tests, docs |
| V-11 | HVAC Integration | Complete | HVAC controller adapter, safety limits, tests, docs |
| V-12 | Seat Controller | Complete | Seat presets, movement policies, tests, docs |
| V-13 | Door Controller | Complete | Lock, child-lock and ajar abstractions, movement policy, docs |
| V-14 | Window Controller | Complete | Window position commands and obstruction sensor policy, docs |
| V-15 | Ambient Lighting Controller | Complete | Zone lighting adapter, scene policies, docs |
| V-16 | Audio Amplifier Interface | Complete | Amp zones, gain, mute, voice ducking, docs |
| V-17 | OTA Update Manager | Complete | Update campaign lifecycle, parked install policy, tests, docs |
| V-18 | Secure Vehicle Gateway | Complete | Policy enforcement, trusted ECU routing, audit events, tests, docs |
| V-19 | OEM Adapter SDK | Complete | Adapter manifest, validation, checklist, tests, docs |
| V-20 | Vehicle Integration Studio | Complete | Studio panels for discovery, diagnostics, signal watch, command simulation, sensors, OTA and OEM adapters |

## Final production phases

| Phase | Status | Package | Deliverables |
| --- | --- | --- | --- |
| W | Complete | `@aura-dcos/cinematic-graphics` | Graphics surfaces, shader/effect descriptors, particles, cinematic layers/scenes, transitions, frame planning, quality budgets, driver-visible safety checks, docs, tests |
| X | Complete | `@aura-dcos/ai-cabin-intelligence` | Consent-aware memory, emotion inference, personalization actions, safety suggestions, docs, tests |
| Y | Complete | `@aura-dcos/oem-configuration-studio` | OEM themes, surface configuration, feature enablement, certification tracking, exportable profiles, docs, tests |
| Z | Complete | `@aura-dcos/production-release` | Release candidates, artifacts, readiness gates, reports, docs, tests |

## Delivery rules

- Work package-by-package and commit-by-commit.
- Do not redesign completed packages unless required for clean integration.
- Every package must include TypeScript, unit tests, documentation and clean architecture.
- Production-grade seams must be safe-by-default and runnable in simulator mode.
- Real vehicle deployment still requires OEM validation, cybersecurity review, HMI compliance, functional safety analysis and hardware-specific certification.
