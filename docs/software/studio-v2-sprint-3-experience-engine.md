# Studio v2 Sprint 3 – Experience Engine

Studio v2 Sprint 3 adds the production Experience Engine layer while preserving the existing engineering-mode panels and multi-output flow.

## Delivered modules

- Experience Engine orchestration API
- Theme Registry
- Theme State Manager
- Theme Transition Engine
- Surface Synchronization Engine
- Experience Timeline generation
- Experience Selector UI
- Live Preview model and Studio panel
- Production theme catalogue
- Sprint tests

## Production themes

The theme registry includes the Sprint 3 immersive modes:

1. Ocean Serenity
2. Galaxy Lounge
3. Forest Retreat
4. Cinema Mode
5. Productivity Mode
6. Family Adventure
7. Wellness Mode
8. Night Drive

The registry also keeps existing AURA themes for backwards compatibility: Family Glow, Aurora Drive, Rain Safety and Executive Calm.

## Safety behavior

Passenger-only themes such as Galaxy Lounge, Cinema Mode and Family Adventure are allowed as rich immersive themes while parked. When requested while driving, the synchronization engine protects driver-visible surfaces by forcing dashboard, windshield and projection behavior into low-motion or ambient states.

Critical safety contexts force Rain Safety visual language and reduce or disable unsafe projection surfaces.

## Studio integration

The Studio `ExperienceDirectorPanel` now contains a Studio v2 Sprint 3 selector. Selecting a theme produces live preview data showing:

- transition easing and duration
- transition steps
- safety notes
- synchronized surface energy values
- theme palette

Applying a theme broadcasts the generated scene into the existing shared Studio state, so dashboard, roof, floor, projection, companion and engineering panels remain synchronized.

## Validation

Sprint 3 tests cover:

- required theme registration
- live preview generation
- surface synchronization
- safety-cut transitions
- timeline navigation compatibility

Run:

```bash
npm test --workspace @aura-dcos/experience-director
npm run typecheck --workspace @aura-dcos/experience-director
npm run typecheck --workspace @aura-dcos/studio
```
