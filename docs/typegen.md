# Boronix Typegen

The `typegen` command scans your routes capsules and automatically generates TypeScript types for routes and parameters under `.boronix/types/routes.d.ts`.

## Usage

```bash
boronix typegen [options]
```

## Generated Outputs

Generates `.boronix/types/routes.d.ts` containing:

- `BoronixRoute`: Union of all route patterns (e.g. `/`, `/login`, `/exercises/[id]`).
- `BoronixRouteParams`: Map of route patterns to their required dynamic parameters.
- `RouteParams<T>`: Helper mapping type.
- `PageRoute`: A union of all static and template literal dynamic page routes.
- `ApiRoute`: A union of all `/api` endpoint routes.
- `ActionRoute`: A union of all named action routes.

### Example Output

```ts
export type BoronixRoute =
  | "/"
  | "/login"
  | "/exercises"
  | "/exercises/[id]"

export type BoronixRouteParams = {
  "/": {}
  "/login": {}
  "/exercises": {}
  "/exercises/[id]": {
    id: string
  }
}

export type RouteParams<T extends BoronixRoute> = BoronixRouteParams[T]
```

## TSConfig Integration
To make the generated types available globally, add `.boronix/types/routes.d.ts` (or the entire `.boronix` folder) to your `tsconfig.json` `include` array:

```json
{
  "include": [
    "app/**/*",
    ".boronix/types/**/*.d.ts"
  ]
}
```
