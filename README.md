# AURA DCOS

AURA DCOS is the software foundation for the AURA Digital Cabin Operating System.

The project combines:

- Digital Cabin Operating System architecture
- Engineering documentation
- Modular software packages
- Digital surface orchestration
- Hardware abstraction for prototype displays, projectors and future vehicle hardware

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

Windows helper:

```bat
software\scripts\run-studio-windows.bat
```

macOS helper:

```bash
bash software/scripts/run-studio-mac.sh
```

Open output windows from the Studio controller, or directly use:

```text
?output=dashboard
?output=roof
?output=projection
?output=floor
?output=calibration
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

## AURA Director

AURA Director provides a cabin-map control panel inside Studio. It can select surfaces such as windshield, dashboard, roof, projection and floor, then update energy and state. Updates are broadcast through the existing Studio shared-state channel so output windows can react.

## AURA Companion

The companion engine evaluates driver workload and safety state to choose visual, assistive, voice-only or emergency behaviour. Studio can send the selected companion state to the AURA projection output.

## AURA Brain

AURA Brain evaluates intent, driver workload, vehicle state, risk and available surfaces. It recommends safe output actions and blocks distracting or unsafe actions such as driver-visible entertainment while driving.

## Voice and LLM Integration

Phase M provides the first complete voice and LLM integration path for the prototype:

- `@aura-dcos/voice-bridge` defines speech-to-text, text-to-speech and language-model adapter contracts.
- The default language-model adapter is a deterministic mock provider so the repo runs without API keys.
- Studio supports typed prompts and browser push-to-talk voice input where the browser exposes `SpeechRecognition` / `webkitSpeechRecognition`.
- Safe responses are spoken with browser text-to-speech when available.
- All LLM responses pass through the AURA safety gate before updating Companion or Projection state.
- Driving mode blocks distracting entertainment prompts and converts responses to concise voice-first output.
- Critical mode overrides model output with emergency-oriented spoken guidance.

For best browser voice support, run Studio in Chrome or Edge on localhost and allow microphone permission when prompted.

## Layout Profiles

Studio can save and restore cabin layout profiles in browser storage. A saved profile currently includes the cabin context and surface configuration.

## Release readiness

See `docs/software/phase-k-release-checklist.md` before prototype demonstrations.

## Known limitations

See `docs/software/known-limitations.md` for current prototype limitations.

## Cleanup status

Completed cleanup:

- Removed unused `scene-engine` package files.
- Confirmed `@aura-dcos/scenes` is the active scene package.
- Added tests for scenes, cabin sync, display router, animation engine and output manager.
- Updated package list to reflect the current architecture.

## Hardware guide

See `docs/software/phase-g-hardware-run-guide.md` for laptop, monitor, projector and calibration setup.

## Project Principle

Every digital surface must either improve safety, reduce cognitive load, increase comfort, provide useful information, create a memorable experience, or disappear.

## Next Phase

Phase N should add real provider adapters for cloud and edge LLM services while keeping AURA Brain and Voice Bridge as safety gates before responses reach cabin outputs.
