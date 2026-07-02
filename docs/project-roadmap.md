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

## AURA Core Stabilisation and Adaptability Program

| Phase | Status | Package | Deliverables |
| --- | --- | --- | --- |
| 1 | Complete | `@aura-dcos/core-stability` | AURA Core v1.0 freeze manifest, stable API registry, adapter boundaries, compatibility rules, freeze validation, docs, tests |
| 2 | Complete | `@aura-dcos/oem-adapter-toolkit` | Adapter generator, signal mapping templates, ECU scanner templates, diagnostics connector templates, compatibility report, docs, tests |
| 3 | Complete | `@aura-dcos/vehicle-profile-system` | Model/year profiles, display/control/sensor schemas, bus mapping references, validation, reference SUV profile, docs, tests |
| 4 | Complete | `@aura-dcos/validation-suite` | Missing signal detection, unsafe command detection, diagnostics readiness, OTA readiness, safety/cyber checklist, docs, tests |
| 5 | Complete | `@aura-dcos/reference-oem-adapter` | Simulator-backed reference 2032 SUV adapter, ECU topology, CAN-FD/LIN/Ethernet mappings, diagnostics, sensor bindings, docs, tests |
| 6 | Complete | `@aura-dcos/release-packaging` | Core, adapter and vehicle profile bundle manifests, installer manifest, rollback manifest, validation, docs, tests |

## Companion Personalization Track

| Package | Status | Deliverables |
| --- | --- | --- |
| `@aura-dcos/companion-ecosystem` | Complete | Default light-being companion, animal companions, user-personalized profiles, role/personality settings, movement styles, driving safety policies, marketplace-ready metadata, docs, tests |

## Studio v2 Immersive Demonstration Track

| Sprint | Status | Deliverables |
| --- | --- | --- |
| 1 | Complete | Premium immersive shell, left navigation, hero landing screen, live vehicle preview placeholder, right status rail, companion orb, demo timeline, Engineering Mode switch, docs |
| 2 | Complete | Interactive vehicle/front/rear cabin preview, selectable surfaces, transparent/digital windshield toggle, surface detail panel, rear cabin full digital seat-back/floor/roof/rear-wall presentation, docs |
| 3 | Next | Live experience engine controls and animated cabin theme switching |
| 4 | Planned | Companion Studio UI and companion selection/creation preview |
| 5 | Planned | Vehicle integration visualizer and diagnostics presentation layer |
| 6 | Planned | Guided demo mode and presentation timeline |

## Platform v1.0 status

AURA DCOS Platform v1.0 is feature complete at software-platform foundation level. Future work moves from platform construction to OEM-specific integration, real hardware bring-up, certification, HIL testing and commercialization assets.

## Studio production track

| Package | Status | Notes |
| --- | --- | --- |
| STU-1 Experience Director | Complete | One-click Experience Director integrated |
| STU-2 Cinematic Engine | Complete | Cinematic Engine package created |
| STU-3 Emotion Engine | Complete | Emotion Engine package created |
| STU-4 Keynote Mode | Complete | Keynote Mode package created |
| STU-5 Demo Runbook | Complete | Demo runbook completed |

## Delivery rules

- Work package-by-package and commit-by-commit.
- Do not redesign completed packages unless required for clean integration.
- Every package must include TypeScript, unit tests, documentation and clean architecture.
- Production-grade seams must be safe-by-default and runnable in simulator mode.
- Real vehicle deployment still requires OEM validation, cybersecurity review, HMI compliance, functional safety analysis and hardware-specific certification.
