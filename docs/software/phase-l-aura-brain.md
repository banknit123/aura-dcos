# Phase L - AURA Brain

AURA Brain is the reasoning layer for AURA DCOS.

It evaluates cabin context, driver workload, safety risk, companion state and available display surfaces before recommending actions.

## Purpose

AURA Brain exists to prevent the cabin from becoming a collection of disconnected displays. It acts as the central decision layer that determines what should happen, what should be blocked and why.

## Inputs

- User or system intent
- Cabin risk level
- Driver attention/workload
- Vehicle state
- Child presence
- Available display surfaces

## Outputs

A Brain decision contains:

- selected intent
- current risk
- confidence score
- summary
- recommended actions
- blocked actions

## Safety behaviour

Critical states force safety-first behaviour:

- companion switches to emergency mode
- distracting visual motion is reduced
- dashboard prioritises emergency information
- projection visuals are disabled
- entertainment is blocked

Elevated workload states switch to reduced visual demand:

- companion moves to voice-only mode
- projection motion is reduced
- roof stays ambient
- non-critical dashboard messages are blocked

Normal states allow richer interaction within surface constraints.

## Studio integration

AURA Studio includes a Brain panel that can:

- select intent
- show current decision
- show confidence score
- show recommended actions
- show blocked actions
- apply Brain recommendations to shared Studio state

When a Brain decision is applied, Studio updates relevant surfaces and companion behaviour, then broadcasts the shared state to output windows.

## Current scope

This phase is deterministic and safety-rule based. It does not yet call an LLM or external AI model.

## Next step

Phase M should add AURA Voice and LLM integration behind the Brain safety layer, so external AI recommendations can be filtered by AURA Brain before reaching cabin outputs.
