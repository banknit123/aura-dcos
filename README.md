# AURA DCOS

AURA DCOS is the software foundation for the AURA Digital Cabin Operating System.

The project combines engineering documentation, modular software packages, digital surface orchestration, hardware abstraction and AI-assisted cabin intelligence.

## Current Build

**Phase A: Core Runtime** is complete at foundation level.

**Phase B: Cabin Foundation** includes the first cabin-specific packages.

**Phase C: AURA Studio** includes the first runnable browser app and multi-output routes.

**Phase D: Orchestration Foundation** adds synchronisation, scene, routing and animation packages.

**Phase E: Studio Orchestration** connects Studio to orchestration packages.

**Phase F: Output Planning** adds hardware-aware output profiles and launch planning.

**Phase G: Hardware Run Support** adds calibration mode, projector setup guidance and run scripts.

**Phase H: AURA Director** adds cabin-map controls for selecting surfaces and adjusting state/energy.

**Phase I: Layout Profiles** adds browser-based save/load support for cabin surface layouts.

**Phase J: AURA Companion** adds companion state, driver workload modes and projection behaviour.

**Phase K: Build Hardening** adds validation scripts, health checks, CI hardening and release documentation.

**Phase L: AURA Brain** adds safe intent reasoning and output planning.

**Phase M: Voice and LLM Integration** adds adapter-ready language-model contracts, browser push-to-talk speech recognition, browser text-to-speech output, safety-gated LLM responses and Studio integration with AURA Companion / Projection.

**Phase N: Autonomous Cabin Intelligence** adds an autonomy engine with cabin memory, signal fusion, risk inference, proactive suggestions and AURA Brain gated execution.

**Phase O: Provider and Vehicle Integration Layer** adds a provider registry, local/mock LLM and TTS adapters, a vehicle signal adapter contract and signal mapping into AURA Autonomy.

**Phase P: Vehicle and Sensor Simulator** adds replayable local vehicle/sensor stream scenarios, instant replay, continuous frame playback, replay speed control, fault injection and end-to-end Studio routing through Integrations, Autonomy and AURA Brain.

**Phase Q: Production Vehicle Platform Foundation** adds platform gateway contracts, simulator-backed platform I/O, security policy checks, telemetry buffering and OTA update status primitives.

**Phase R: Vehicle Integration Framework** adds hardware discovery, cabin profiles, display mapping, integration gateway, diagnostics and simulator-backed vehicle integration adapters.

**Phase V: Production Vehicle Integration Framework** is now underway. V1 through V10 add the production HAL, vehicle communication backbone, signal manager, ECU discovery, and camera/radar/LiDAR abstractions.

**Milestone 1: Demo Ready** is the stabilization track for clean local execution and demonstration. See `docs/software/milestone-1-demo-ready.md`.

## Repository Structure

```text
aura-dcos/
├── docs/
│   ├── engineering/
│   └── software/
├── software/
│   ├── apps/
│   ├── packages/
│   ├── scripts/
│   └── tests/
├── assets/
└── .github/workflows/
```

## Included packages

- `@aura-dcos/kernel`
- `@aura-dcos/events`
- `@aura-dcos/logger`
- `@aura-dcos/config`
- `@aura-dcos/runtime`
- `@aura-dcos/surfaces`
- `@aura-dcos/hal`
- `@aura-dcos/can`
- `@aura-dcos/automotive-ethernet`
- `@aura-dcos/lin`
- `@aura-dcos/diagnostics`
- `@aura-dcos/vehicle-signals`
- `@aura-dcos/ecu-discovery`
- `@aura-dcos/camera`
- `@aura-dcos/radar`
- `@aura-dcos/lidar`
- `@aura-dcos/digital-twin`
- `@aura-dcos/capabilities`
- `@aura-dcos/cabin-sync`
- `@aura-dcos/scenes`
- `@aura-dcos/display-router`
- `@aura-dcos/animation-engine`
- `@aura-dcos/output-manager`
- `@aura-dcos/calibration`
- `@aura-dcos/profile-store`
- `@aura-dcos/companion`
- `@aura-dcos/brain`
- `@aura-dcos/voice-bridge`
- `@aura-dcos/ai-adapter`
- `@aura-dcos/autonomy`
- `@aura-dcos/integrations`
- `@aura-dcos/simulator`
- `@aura-dcos/vehicle-platform`
- `@aura-dcos/vehicle-integration`

## Included apps

- `@aura-dcos/studio`

## Quick start

```bash
git clone https://github.com/banknit123/aura-dcos.git
cd aura-dcos
npm install
npm run release:check
npm run dev --workspace @aura-dcos/studio
```

## Quality and release checks

```bash
npm run validate
npm run health
npm run typecheck
npm test
npm run build
npm run release:check
```

## Demo runbook

Use `docs/software/milestone-1-demo-ready.md` to validate the complete local demo flow:

```text
Simulator → Integrations → Autonomy → AURA Brain → Companion / Surfaces
```

## Voice and LLM Integration

Phase M provides the first complete voice and LLM integration path for the prototype:

- `@aura-dcos/voice-bridge` defines speech-to-text, text-to-speech and language-model adapter contracts.
- The default language-model adapter is a deterministic mock provider so the repo runs without API keys.
- Studio supports typed prompts and browser push-to-talk voice input where the browser exposes `SpeechRecognition` / `webkitSpeechRecognition`.
- Safe responses are spoken with browser text-to-speech when available.
- All LLM responses pass through the AURA safety gate before updating Companion or Projection state.

## Autonomous Cabin Intelligence

Phase N introduces the first autonomous AI cabin loop:

- `@aura-dcos/autonomy` accepts cabin snapshots and multimodal-style signals.
- The autonomy engine keeps session memory and profile preference memory.
- It infers cabin risk and likely intent from vehicle, environment, occupant and system signals.
- It creates proactive suggestions such as family welcome, rain comfort mode, fatigue break and safety focus mode.
- Every autonomy cycle routes through AURA Brain before surfaces or Companion are changed.

## Provider and Vehicle Integration Layer

Phase O introduces the integration boundary for real-world providers:

- `@aura-dcos/integrations` centralises provider registration and health status.
- It includes mock and local language-model adapters.
- It includes mock and local text-to-speech adapters.
- It defines a vehicle adapter contract for speed, weather, fatigue, seatbelt, door and battery-style signals.
- Vehicle signals can be converted into `@aura-dcos/autonomy` signals so provider data still flows through Autonomy and AURA Brain before cabin outputs change.

## Vehicle and Sensor Simulator

Phase P adds `@aura-dcos/simulator`, a local simulator for replaying vehicle and sensor-like streams without hardware:

- `parkedFamily` simulates parked entry and seatbelt signals.
- `rainCommute` simulates rain and rising commute speed.
- `fatigueDrive` simulates high-speed driving plus driver fatigue.
- `safetyAlert` simulates a safety-related driving stream.

Studio includes a Vehicle + Sensor Simulator panel with scenario replay, timed stream playback, replay speed control, stop control, fatigue fault injection and last-signal inspection.

## Production Vehicle Platform Foundation

Phase Q adds `@aura-dcos/vehicle-platform`, a prototype-safe boundary for future production integrations:

- Platform gateway contracts for CAN, Automotive Ethernet, ROS 2, Android Automotive and simulator backends.
- Platform commands for display, companion, HVAC, lighting, seats and system actions.
- A safety policy engine that blocks unsafe commands and audits safety-critical commands.
- A telemetry buffer for platform events and diagnostics.
- An OTA status manager for update availability and prototype update state.
- A simulator-backed platform gateway for development before real hardware is connected.

This is not a substitute for full automotive safety certification. It is the software seam where production-grade security, diagnostics, OTA, ECU communication and hardware adapters can be attached.

## Vehicle Integration Framework

Phase R adds `@aura-dcos/vehicle-integration`, the plug-in style integration layer for hardware-adaptive deployments:

- Vehicle adapter manifests.
- Hardware discovery.
- Generated cabin profiles.
- Display route mapping.
- Integration gateway command execution.
- Integration diagnostics.
- Simulator-backed adapter for demo mode.

Phase R makes AURA hardware-adaptive and integration-ready. It does not claim zero-work installation into every production vehicle. Real production deployment still requires OEM adapters, vehicle safety gateways, cybersecurity controls and regional HMI compliance processes.

See `docs/software/phase-r-vehicle-integration-framework.md`.

## Phase V Vehicle Integration Framework

Phase V expands the production vehicle integration foundation:

- `@aura-dcos/hal` now includes production-oriented vehicle bus and endpoint primitives.
- `@aura-dcos/can` provides CAN/CAN-FD frame validation, filtering, arbitration-ready interfaces, signal codec seams and simulator support.
- `@aura-dcos/automotive-ethernet` provides service-oriented Ethernet descriptors, QoS, secure-service metadata and simulator transport.
- `@aura-dcos/lin` provides LIN frame definitions, schedule tables, sleep/wake handling and body electronics simulator support.
- `@aura-dcos/diagnostics` provides UDS/OBD-II-ready diagnostics, ECU identity, session control, security access seams, DTC lifecycle and live data access.
- `@aura-dcos/vehicle-signals` provides a normalized signal store with freshness, quality and subscriptions.
- `@aura-dcos/ecu-discovery` provides ECU discovery, capability and trust-state metadata.
- `@aura-dcos/camera`, `@aura-dcos/radar` and `@aura-dcos/lidar` provide sensor endpoint abstractions for future perception, digital twin and Studio integrations.

See the Phase V documents in `docs/software/phase-v*.md`.

## Hardware guide

See `docs/software/phase-g-hardware-run-guide.md` for laptop, monitor, projector and calibration setup.

## Project Principle

Every digital surface must either improve safety, reduce cognitive load, increase comfort, provide useful information, create a memorable experience, or disappear.
