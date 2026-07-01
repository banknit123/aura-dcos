# Phase STU — AURA Experience Platform

Phase STU turns AURA from a feature demo into a coordinated customer experience.

## STU-1 Experience Director

Package: `@aura-dcos/experience-director`

Provides a timeline-driven scene engine for the AURA demo.

Core capabilities:

- Start, pause, resume, stop, next, previous and jump-to-scene controls.
- Data-driven scenes.
- Narration cues.
- Presenter cues.
- Surface directives.
- Companion directives.
- Vehicle and cabin context directives.

## STU-2 Cinematic Experience Engine

Package: `@aura-dcos/cinematic-engine`

Generates visual plans for cinematic cabin themes.

Included themes:

- Ocean Serenity
- Aurora Drive
- Galaxy Lounge
- Rain Safety
- Executive Calm
- Family Glow
- Forest Zen
- Night City

The engine evaluates:

- Surface role.
- Vehicle state.
- Speed.
- Weather.
- Driver workload.
- Cabin risk.

It returns:

- Theme plan.
- Surface-specific motion level.
- Brightness.
- Driver-safety notes.
- Pattern language.
- CSS class naming for future visual rendering.

## STU-3 Emotion and Wellness Engine

Package: `@aura-dcos/emotion-engine`

Infers the cabin emotional state and wellness plan.

Supported states:

- Calm
- Focused
- Stressed
- Fatigued
- Family
- Alert
- Celebration

Outputs include:

- Recommended theme.
- Companion mood.
- Companion tone.
- Wellness actions.
- Surface energy limits.
- Driver-friendly message.

## STU-4 Keynote Mode

Package: `@aura-dcos/keynote-mode`

Provides demo scoring and readiness checks for customer presentations.

Key checks:

- Scene coverage.
- Output window coverage.
- Safety checks.
- Voice checks.
- Vehicle Integration Framework scan.
- Reliability score.

## STU-5 Demo Hardening

Before a customer demo, run:

```powershell
git pull
npm.cmd install
npm.cmd run release:check
npm.cmd run dev --workspace @aura-dcos/studio
```

Open Studio, then open these outputs:

```text
Dashboard
Roof
Projection
Floor
```

Recommended demo flow:

1. Open all outputs.
2. Click Start AURA Experience.
3. Advance scene by scene.
4. Use Voice Bridge during Voice With Context.
5. Run Emergency Safety.
6. Run Vehicle Integration Framework scan.
7. Show Cinematic Experience Engine plans.
8. Close with Future Mobility Vision.

## Demo positioning

Use this positioning during presentation:

> AURA is not an infotainment system. AURA is an intelligent experience layer that coordinates every digital surface, companion interaction, safety policy and vehicle-integration signal inside the future mobility cabin.

## Current limitations

- Cinematic visuals are currently theme plans and CSS-ready directives; full procedural visual rendering is planned next.
- Emotion inference is rule-based for prototype reliability.
- Keynote Mode scoring is package-ready but not fully surfaced in Studio yet.
- Production vehicle use still requires OEM adapters, certified safety gateways and cybersecurity work.
