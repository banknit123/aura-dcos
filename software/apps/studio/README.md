# AURA Studio

AURA Studio is the first runnable application for AURA DCOS.

It demonstrates:

- Digital Twin cabin context
- Surface Energy
- Safety envelope behaviour
- Runtime event log
- Scenario switching

## Run

From the repository root:

```bash
npm install
npm run dev --workspace @aura-dcos/studio
```

Then open the local Vite URL shown in the terminal.

## Current Limitations

This app currently contains local UI wiring and mirrors the intended DCOS concepts. In the next iteration, it should import and use the monorepo packages directly.
