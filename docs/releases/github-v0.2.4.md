# Goros v0.2.4

This release focuses on publish readiness.

## Highlights
- Package metadata cleanup
- Package-level README/LICENSE
- Release check script
- Tarball smoke test script
- create-goros non-interactive smoke flow
- Publishing docs

## Verify
```bash
bun run release:check
bun run smoke:pack
```

## Notes

Goros is still alpha. APIs may change before 1.0.
