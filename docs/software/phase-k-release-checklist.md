# Phase K - Release Checklist

Use this checklist before demonstrating AURA DCOS on laptop, monitor or projector hardware.

## Local validation

Run from the repository root:

```bash
npm install
npm run validate
npm run health
npm run typecheck
npm test
npm run build
```

Or run the combined release check:

```bash
npm run release:check
```

## Hardware validation

- Laptop display works as Studio controller.
- External monitor/projector is connected.
- Display mode is set to extend, not mirror.
- `?output=calibration` opens and grid aligns correctly.
- `?output=dashboard` opens on dashboard target.
- `?output=roof` opens on roof/projector target.
- `?output=projection` opens for AURA companion target.
- `?output=floor` opens on floor/projector target.

## Functional validation

- Scenario buttons update output windows.
- AURA Director changes surface state and energy.
- Layout profiles can be saved and loaded.
- Companion modes switch between visual, assistive, voice-only and emergency.
- Emergency mode reduces visual distraction.
- Calibration grid is usable for projector alignment.

## Release readiness

- CI passing on `main`.
- README phase status is current.
- Hardware guide is current.
- Known limitations are documented.
- Demo machine has Node.js 20+ and npm 10+.

## Known limitations

- Browser windows are manually moved to displays.
- No automatic monitor detection yet.
- Companion is state-based only; no real voice or LLM integration yet.
- Projection calibration is visual/manual, not mathematically stored yet.
