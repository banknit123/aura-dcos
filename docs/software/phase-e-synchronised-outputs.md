# Phase E - Synchronized Multi-Screen Outputs

Phase E turns AURA Studio from independent display windows into a synchronized digital cabin demo.

## What Phase E Adds

- Shared cabin state across browser windows
- Controller-driven scenario changes
- Live dashboard output updates
- Live digital roof output updates
- Live AURA projection output updates
- Live digital floor output updates
- Local state persistence using browser storage
- Cross-window synchronization using BroadcastChannel
- Storage-event fallback for additional browser window updates

## Output Routes

Run AURA Studio and open these routes:

- Controller: `/`
- Dashboard: `/?output=dashboard`
- Roof: `/?output=roof`
- AURA Projection: `/?output=projection`
- Floor: `/?output=floor`

## User Flow

1. Start AURA Studio.
2. Open the controller window.
3. Use the output buttons to open dashboard, roof, projection and floor windows.
4. Move each output window to the required monitor or projector.
5. Press scenario buttons from the controller.
6. All output windows update from the same shared cabin state.

## Current Scenario Buttons

- Welcome / Family
- Commute
- Business + Rain
- Emergency Safety
- Increase Roof Energy

## Technical Notes

The synchronization layer currently runs in the browser using:

- `localStorage` for durable shared state
- `BroadcastChannel` for real-time same-origin window messaging
- `storage` events as a secondary update path

This is sufficient for laptop + multiple browser windows + projector testing.

## Next Phase

Phase F should introduce hardware and installation support:

- Dedicated output assignment guide
- Fullscreen display guidance
- Projector calibration view
- Touchscreen interaction options
- Simple hardware adapter service
