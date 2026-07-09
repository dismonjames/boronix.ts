import { pathToFileURL } from "node:url"
import { resolvePath } from "../utils/path"
import { defaultConfig, type KumquatConfig, type ResolvedKumquatConfig } from "./types"

export async function loadConfig(root: string): Promise<ResolvedKumquatConfig> {
  const configPath = resolvePath(root, "kumquat.config.ts")
  let userConfig: KumquatConfig = {}

  try {
    const module = await import(`${pathToFileURL(configPath).href}?t=${Date.now()}`)
    userConfig = module.default ?? {}
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("Cannot find module")) {
      throw error
    }
  }

  return {
    runtime: userConfig.runtime ?? defaultConfig.runtime,
    server: {
      port: userConfig.server?.port ?? defaultConfig.server.port,
      host: userConfig.server?.host ?? defaultConfig.server.host
    },
    app: {
      root: userConfig.app?.root ?? defaultConfig.app.root,
      routesDir: userConfig.app?.routesDir ?? defaultConfig.app.routesDir,
      publicDir: userConfig.app?.publicDir ?? defaultConfig.app.publicDir
    }
  }
}
