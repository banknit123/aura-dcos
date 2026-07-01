# Phase V8 — Camera Abstraction

The `@aura-dcos/camera` package provides a hardware-neutral camera endpoint model.

## Scope

- Camera descriptors with position, resolution, FPS, format and health.
- Calibration metadata seam.
- Frame-reference capture model, avoiding raw image transport inside control APIs.
- Simulator provider for local tests.

## Architecture

```text
OEM camera provider / simulator
        ↓
CameraManager
        ↓
Perception, Digital Twin, Studio and future AI Cabin Intelligence
```

## Production Notes

Raw camera buffers, GStreamer pipelines, RTSP streams and vendor SDK handles should remain behind `CameraProvider`. AURA higher-level services consume frame references and metadata instead of binding to one camera stack.
