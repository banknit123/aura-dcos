# Milestone 1 — Demo Ready

Milestone 1 converts the AURA DCOS architecture into a locally runnable demonstration build.

## Goal

A developer should be able to clone the repository, install dependencies, run validation, launch AURA Studio and demonstrate the major flows without external hardware.

## Required local environment

- Node.js 20 or newer
- npm 10 or newer
- Chrome or Edge for best browser voice support
- Microphone permission if testing browser voice input

## Fresh clone validation

```bash
git clone https://github.com/banknit123/aura-dcos.git
cd aura-dcos
npm install
npm run validate
npm run typecheck
npm test
npm run build
```

Or run the complete release gate:

```bash
npm run release:check
```

## Launch Studio

```bash
npm run dev --workspace @aura-dcos/studio
```

Open the local Vite URL shown in the terminal.

## Demo outputs

Open these output windows from Studio's Output Manager, or directly from the browser:

```text
?output=dashboard
?output=roof
?output=projection
?output=floor
?output=calibration
```

## Primary demo scenario

1. Start AURA Studio.
2. Open Dashboard, Roof, Projection and Floor output windows.
3. In Studio, run `Welcome / Family`.
4. Open `Vehicle + Sensor Simulator`.
5. Select `rainCommute`.
6. Click `Play Stream`.
7. Confirm speed changes, weather changes, risk changes and cabin surfaces respond.
8. Select `fatigueDrive`.
9. Click `Replay Instant`.
10. Confirm Autonomy and Brain route the system to reduced-distraction assistance.
11. Click `Emergency Safety`.
12. Confirm emergency mode disables projection motion and prioritises dashboard safety.
13. Use Voice + LLM Bridge with a typed prompt.
14. Confirm response updates the Companion / Projection state.

## Pass criteria

- `npm run release:check` exits successfully.
- Studio starts without terminal errors.
- Controller page loads.
- Dashboard output loads.
- Roof output loads.
- Projection output loads.
- Floor output loads.
- Calibration output loads.
- Simulator replay updates Digital Twin context.
- Simulator replay triggers Autonomy and Brain decisions.
- Voice Bridge typed prompt updates Companion state.
- Runtime Event Log records scenario, simulator, autonomy and Brain events.

## Known prototype limitations

- Real CAN, Automotive Ethernet, ROS 2 and Android Automotive adapters are not connected yet.
- Browser speech recognition support depends on browser capabilities.
- Cloud LLM providers are not enabled by default; mock/local adapters keep the demo key-free.
- The simulator is deterministic and designed for demonstration, not certification.

## Troubleshooting

### Dependency install fails

Confirm Node and npm versions:

```bash
node -v
npm -v
```

Use Node 20+ and npm 10+.

### Studio does not launch

Run:

```bash
npm run typecheck
npm run build --workspace @aura-dcos/studio
```

Fix the first TypeScript error shown before moving to the next.

### Voice input does not work

Use typed prompt mode first. For microphone input, use Chrome or Edge and allow microphone permissions.

### Output windows do not sync

Use the same browser profile and origin for all windows. Studio uses local storage and BroadcastChannel for prototype sync.

## Demo release tag target

When all pass criteria succeed, create:

```text
AURA DCOS v0.1 Demo
```
