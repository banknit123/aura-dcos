# AURA Studio

AURA Studio is the first runnable application for AURA DCOS.

It demonstrates:

- Digital Twin cabin context
- Surface Energy
- Safety envelope behaviour
- Runtime event log
- Scenario switching
- Multi-screen output windows
- Synchronized cabin state across outputs

## Run

From the repository root:

```bash
npm install
npm run dev --workspace @aura-dcos/studio
```

Then open the local Vite URL shown in the terminal.

## Phase E Output Routes

- Controller: `/`
- Dashboard: `/?output=dashboard`
- Roof: `/?output=roof`
- AURA Projection: `/?output=projection`
- Floor: `/?output=floor`

## How To Test Synchronization

1. Start AURA Studio.
2. Open the controller page.
3. Open each output window using the controller buttons.
4. Move output windows to separate monitors or projector screens.
5. Click scenario buttons such as Welcome / Family, Commute, Business + Rain, or Emergency Safety.
6. Each output should update from the same shared cabin state.

## Current Limitations

The synchronization layer is browser-based. It is suitable for laptop, browser window, multi-monitor and projector testing. Future phases should add dedicated hardware adapters and fullscreen display assignment.
