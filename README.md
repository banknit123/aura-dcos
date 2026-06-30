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

## Included apps

- `@aura-dcos/studio`

## Commands

Install dependencies:

```bash
npm install
```

Run AURA Studio:

```bash
npm run dev --workspace @aura-dcos/studio
```

Quality and release checks:

```bash
npm run validate
npm run health
npm run typecheck
npm test
npm run build
npm run release:check
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

Studio includes a Vehicle + Sensor Simulator panel with:

- Scenario selector
- Instant replay
- Timed stream playback
- 1x / 2x / 5x replay speed
- Stop control
- Fatigue fault injection
- Last-signal inspection

Simulator output is routed through:

```text
Simulator → Integrations → Autonomy → AURA Brain → Companion / Surfaces
```

This gives the prototype an end-to-end local demonstration path before real CAN, Android Automotive, cloud, edge or sensor-provider integrations are added.

## Hardware guide

See `docs/software/phase-g-hardware-run-guide.md` for laptop, monitor, projector and calibration setup.

## Project Principle

Every digital surface must either improve safety, reduce cognitive load, increase comfort, provide useful information, create a memorable experience, or disappear.

## Next Phase

Phase Q should add richer provider profiles, scenario authoring/import-export, advanced fault injection presets and optional local/edge LLM provider implementations.
