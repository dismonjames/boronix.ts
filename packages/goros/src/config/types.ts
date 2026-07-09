export type GorosConfig = {
  runtime?: "bun" | "node" | "deno"
  server?: {
    port?: number
    host?: string
  }
  session?: {
    name?: string
    secret?: string
    maxAge?: number
    sameSite?: "lax" | "strict" | "none"
    secure?: boolean
  }
  app?: {
    root?: string
    routesDir?: string
    publicDir?: string
  }
  cli?: {
    color?: boolean
    unicode?: boolean
    requestLog?: boolean
    groupRoutes?: boolean
  }
}

export type ResolvedGorosConfig = {
  runtime: "bun" | "node" | "deno"
  server: {
    port: number
    host: string
  }
  session: {
    name: string
    secret: string
    maxAge: number
    sameSite: "lax" | "strict" | "none"
    secure: boolean
  }
  app: {
    root: string
    routesDir: string
    publicDir: string
  }
  cli: {
    color: boolean
    unicode: boolean
    requestLog: boolean
    groupRoutes: boolean
  }
}

export const defaultConfig: ResolvedGorosConfig = {
  runtime: "bun",
  server: {
    port: 3000,
    host: "0.0.0.0"
  },
  session: {
    name: "kq_session",
    secret: "goros-dev-session-secret",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
    secure: false
  },
  app: {
    root: "app",
    routesDir: "app/routes",
    publicDir: "public"
  },
  cli: {
    color: true,
    unicode: true,
    requestLog: true,
    groupRoutes: true
  }
}
