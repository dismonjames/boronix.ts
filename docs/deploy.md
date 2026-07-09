# Deploy

Goros writes `.goros/manifest.json` with:

```bash
goros build
```

Start production mode with:

```bash
goros start
```

Production bundling and non-Bun adapters are intentionally deferred.

Node runtime can be selected with:

```bash
goros build --runtime node
goros start --runtime node
```
