# Phase M - Voice and LLM Bridge

Phase M adds a safety-gated voice and language-model adapter layer behind AURA Brain.

## Purpose

The voice bridge allows AURA Studio to simulate typed or spoken user prompts and convert them into safe cabin responses. It is designed so future microphone, speech-to-text, text-to-speech and LLM providers can plug in without bypassing AURA safety rules.

## Packages

- `@aura-dcos/voice-bridge` - primary Phase M package.
- `@aura-dcos/ai-adapter` - compatibility alias that re-exports the voice bridge interface.

## Flow

1. User prompt is captured as a `VoiceInput`.
2. AURA Voice Bridge creates a language-model request with a safety mode.
3. A language-model response is received or simulated.
4. The response is gated according to vehicle state, driver workload and risk.
5. Only the safe response is applied to AURA Companion / Projection.

## Safety modes

- `normal` - parked or low driver workload.
- `driverSafe` - driving or high workload; short voice-first output.
- `emergency` - critical state; only emergency-oriented spoken guidance.

## Studio integration

AURA Studio includes a Voice + LLM Bridge panel. It supports:

- typed prompt entry
- simulated LLM response
- safety-gated response
- output mode display
- response safety display
- companion/projection update after gating

## Current scope

This phase does not call a real external LLM yet. It defines the integration boundary and safety-gating behaviour first.

## Next step

Phase N should add provider adapters for real speech-to-text, text-to-speech and LLM services, while continuing to route all responses through the AURA Brain and Voice Bridge safety gates.
