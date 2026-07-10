import path from "node:path"
import type { ResolvedBoronixConfig } from "./types"
import { BoronixUserError } from "../core/errors"
import { detectSessionUsage } from "../utils/session-usage"

export function validateProductionConfig(
  root: string,
  config: ResolvedBoronixConfig,
  currentRuntime: "bun" | "node" | "deno"
): void {
  // Validate port
  const port = config.server.port
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new BoronixUserError(`Port config is invalid: ${port}. Must be an integer between 1 and 65535.`, {
      code: "KQ_PORT_INVALID",
      hint: "Change server.port in boronix.config.ts to a valid port number."
    })
  }

  // Validate host
  const host = config.server.host
  if (typeof host !== "string" || host.trim() === "") {
    throw new BoronixUserError(`Host config is invalid: "${host}". Must be a non-empty string.`, {
      code: "KQ_HOST_INVALID",
      hint: "Change server.host in boronix.config.ts to a valid host like '0.0.0.0'."
    })
  }

  // Validate runtime mismatch
  if (config.runtime !== currentRuntime) {
    throw new BoronixUserError(`Runtime mismatch: config specifies "${config.runtime}" but running on "${currentRuntime}".`, {
      code: "KQ_RUNTIME_MISMATCH",
      hint: `Change runtime in boronix.config.ts to "${currentRuntime}" or run using the correct runtime.`
    })
  }

  // Validate session secret when session is used
  if (detectSessionUsage(root)) {
    if (!config.session.secret || config.session.secret === "boronix-dev-session-secret") {
      throw new BoronixUserError(
        "A session secret is required in production.\nSet session.secret in boronix.config.ts or provide BORONIX_SESSION_SECRET.",
        {
          code: "KQ_SESSION_SECRET_MISSING",
          hint: "Set session.secret in boronix.config.ts or provide BORONIX_SESSION_SECRET."
        }
      )
    }
  }

  // Validate paths do not escape project root
  const resolvedRoot = path.resolve(root)

  // Validate app root
  const appRootResolved = path.resolve(resolvedRoot, config.app.root)
  const relativeApp = path.relative(resolvedRoot, appRootResolved)
  if (relativeApp.startsWith("..") || path.isAbsolute(relativeApp)) {
    throw new BoronixUserError(`App root directory "${config.app.root}" cannot be outside of the project root.`, {
      code: "KQ_PRODUCTION_CONFIG_INVALID",
      hint: "Change app.root in boronix.config.ts to be inside the project root."
    })
  }

  // Validate public directory
  const publicDirResolved = path.resolve(resolvedRoot, config.app.publicDir)
  const relativePublic = path.relative(resolvedRoot, publicDirResolved)
  if (relativePublic.startsWith("..") || path.isAbsolute(relativePublic)) {
    throw new BoronixUserError(`Public directory "${config.app.publicDir}" cannot be outside of the project root.`, {
      code: "KQ_PRODUCTION_CONFIG_INVALID",
      hint: "Change app.publicDir in boronix.config.ts to be inside the project root."
    })
  }

  // Validate routes directory
  const routesDirResolved = path.resolve(resolvedRoot, config.app.routesDir)
  const relativeRoutes = path.relative(resolvedRoot, routesDirResolved)
  if (relativeRoutes.startsWith("..") || path.isAbsolute(relativeRoutes)) {
    throw new BoronixUserError(`Routes directory "${config.app.routesDir}" cannot be outside of the project root.`, {
      code: "KQ_PRODUCTION_CONFIG_INVALID",
      hint: "Change app.routesDir in boronix.config.ts to be inside the project root."
    })
  }
}
