# Boronix Typegen

The `typegen` command scans your routes capsules and automatically generates TypeScript types for your pages, API endpoints, and action form paths.

## Usage

```bash
boronix typegen [options]
```

## Generated Outputs

Generates `.boronix/types/routes.d.ts` containing:

- `PageRoute`: A union of all static and template literal dynamic page routes.
- `ApiRoute`: A union of all `/api` endpoint routes.
- `ActionRoute`: A union of all named action routes.

### Example Output

```ts
export type PageRoute =
  | "/"
  | "/login"
  | `/exercises/${string}`

export type ApiRoute =
  | "/api/exercises"

export type ActionRoute =
  | "/login?/login"
  | `/exercises/${string}?/submit`
```

Using these types allows compile-time validation of redirects, links, and forms.
