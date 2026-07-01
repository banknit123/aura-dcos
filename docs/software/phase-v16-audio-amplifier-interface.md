# Phase V16 — Audio Amplifier Interface

The `@aura-dcos/audio-amplifier` package provides audio-zone gain, mute and voice-ducking control.

## Scope

- Audio zone state.
- Gain range validation.
- Voice ducking validation.
- Simulator adapter.

## Production Notes

OEM implementations should implement `AmplifierAdapter`. Voice, alert and cinematic audio logic can use this package without knowing amplifier hardware details.
