# AURA Studio v2 Sprint 1

Sprint 1 introduces the premium immersive demonstration shell for AURA Studio while preserving the existing engineering dashboard.

## Access

Start Studio:

```bash
npm run dev --workspace @aura-dcos/studio
```

Open the existing engineering dashboard:

```text
http://localhost:5173/
```

Open the new premium Studio v2 shell:

```text
http://localhost:5173/studio-v2.html
```

## Purpose

Studio v1 remains the engineering control center. Studio v2 becomes the premium presentation layer for OEM, investor and product demonstrations.

## Sprint 1 Deliverables

- Premium dark automotive visual identity.
- Immersive app shell.
- Left navigation.
- Hero landing screen.
- Live vehicle preview placeholder.
- Right system status rail.
- Companion presence orb.
- Bottom demonstration timeline.
- Switch back to Engineering Mode.
- Responsive presentation layout.

## Deferred to Later Sprints

- Interactive 3D vehicle.
- Live surface animation connected to runtime state.
- Companion creator UI.
- Vehicle integration visualizer.
- Scenario presentation mode.

## Notes

The v2 shell is served as a static asset by the existing Vite Studio app. This keeps Sprint 1 low-risk and avoids disturbing the working engineering dashboard.
