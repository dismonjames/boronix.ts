# Node Runtime

Boronix v0.2 includes a basic Node runtime adapter.

```ts
export default defineConfig({
  runtime: "node"
})
```

Or override from the CLI:

```bash
boronix dev --runtime node
boronix start --runtime node
```

The adapter bridges Node `IncomingMessage` and `ServerResponse` to Web `Request` and `Response`.
