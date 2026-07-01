# Phase X — AI Cabin Intelligence

Phase X introduces consent-aware memory, emotion inference and personalization planning for AURA DCOS.

## Package

`@aura-dcos/ai-cabin-intelligence`

## Scope

- Occupant profile model.
- Consent-aware memory store.
- Cabin context model.
- Emotion inference.
- Personalization actions.
- Safety-first suggestions such as fatigue breaks.

## Safety and Privacy Boundary

Memory is only stored when the occupant profile grants memory consent. Personalized actions can be marked as consent-requiring, while safety actions such as fatigue break suggestions remain available without personalization consent.

## Production Notes

The package is deterministic and adapter-ready. Future LLM or perception providers can feed context into the engine without changing higher-level Studio and cabin orchestration APIs.
