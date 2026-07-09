# Deploy

Boronix writes `.boronix/manifest.json` with:

```bash
boronix build
```

Start production mode with:

```bash
boronix start
```

Production bundling and non-Bun adapters are intentionally deferred.

Node runtime can be selected with:

```bash
boronix build --runtime node
boronix start --runtime node
```
