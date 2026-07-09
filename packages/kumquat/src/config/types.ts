export type KumquatConfig = {
  runtime?: "bun" | "node" | "deno"
  server?: {
    port?: number
    host?: string
  }
  app?: {
    root?: string
    routesDir?: string
    publicDir?: string
  }
}

export type ResolvedKumquatConfig = {
  runtime: "bun" | "node" | "deno"
  server: {
    port: number
    host: string
  }
  app: {
    root: string
    routesDir: string
    publicDir: string
  }
}

export const defaultConfig: ResolvedKumquatConfig = {
  runtime: "bun",
  server: {
    port: 3000,
    host: "0.0.0.0"
  },
  app: {
    root: "app",
    routesDir: "app/routes",
    publicDir: "public"
  }
}
