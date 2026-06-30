# Phase G - Hardware Run Guide

Phase G prepares AURA Studio for laptop, monitor and projector testing.

## Requirements

- Node.js 20+
- npm 10+
- Laptop with HDMI/USB-C display output
- External monitor, TV or projector
- Chrome, Edge or another modern browser

## Start AURA Studio

From repository root:

```bash
npm install
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

## Output Routes

Open AURA Studio and use the Output Manager panel, or open routes directly:

```text
http://localhost:5173/?output=dashboard
http://localhost:5173/?output=roof
http://localhost:5173/?output=projection
http://localhost:5173/?output=floor
http://localhost:5173/?output=calibration
```

## Projector Calibration

1. Connect projector to laptop.
2. Extend display rather than mirror.
3. Open `?output=calibration`.
4. Drag the calibration browser window to the projector display.
5. Make the browser full-screen.
6. Adjust projector position, focus and keystone until the white border and grid align with the projection surface.

## Suggested Prototype Mapping

| Output | Hardware |
|---|---|
| Controller | Laptop screen |
| Dashboard | External monitor or TV |
| Roof | Projector aimed at ceiling or white board |
| Projection | Projector or second browser window |
| Floor | Projector aimed at floor or white board |
| Calibration | Any projector/monitor under setup |

## Notes

This phase does not yet auto-detect monitors. Browser windows are manually moved to the required display. Future phases can add Electron or native launcher support for automatic monitor placement.
