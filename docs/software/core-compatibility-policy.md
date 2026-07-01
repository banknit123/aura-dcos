# AURA Core Compatibility Policy

## Semantic Versioning

AURA Core follows semantic versioning for stable APIs.

- Major version: breaking changes to stable exported contracts.
- Minor version: backward-compatible features or new extension points.
- Patch version: fixes, documentation and non-breaking implementation changes.

## Stable APIs

Stable APIs may be used by OEM adapters and vehicle profiles. Breaking these APIs requires a new major release.

## Adapter Boundaries

Adapter-boundary packages are the official integration seams for OEM-specific vehicle software. Vehicle-specific code should be isolated in adapters, profiles and configuration packages.

## Experimental APIs

Experimental APIs may change without compatibility guarantees and must not be used by production OEM adapters.

## Deprecation

A stable API can be deprecated only when:

1. A replacement API exists.
2. The migration path is documented.
3. The deprecated API remains available until the next major release.

## Validation

The `@aura-dcos/core-stability` package creates and validates the AURA Core freeze manifest.
