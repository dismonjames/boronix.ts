# Node Runtime

Goros v0.2 includes a basic Node runtime adapter.

```ts
export default defineConfig({
  runtime: "node"
})
```

Or override from the CLI:

```bash
goros dev --runtime node
goros start --runtime node
```

The adapter bridges Node `IncomingMessage` and `ServerResponse` to Web `Request` and `Response`.
