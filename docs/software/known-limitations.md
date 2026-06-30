# Known Limitations

This document tracks current prototype constraints.

## Display and hardware

- AURA Studio currently uses browser windows for outputs.
- Windows must be manually moved to monitors/projectors.
- There is no native automatic display placement yet.
- Kiosk/fullscreen mode is controlled by the browser/user.

## Calibration

- Calibration uses a visual grid only.
- Keystone, warp and projection mapping values are not saved yet.
- There is no camera-based auto-calibration.

## Companion

- AURA Companion is state-driven.
- There is no live speech recognition, text-to-speech or LLM connection yet.
- Driver workload is simulated through UI controls.

## Vehicle integration

- No CAN, LIN, automotive Ethernet or real sensor integration yet.
- Digital Twin context is simulated.
- Safety behaviour is prototype logic and not production certified.

## Data persistence

- Layout profiles are saved in browser local storage.
- Profiles are not synced across devices.
- There is no backend database yet.
