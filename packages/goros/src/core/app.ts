import { pathToFileURL } from "node:url"
import path from "node:path"
import { GorosUserError } from "./errors"
import { createBodyReader, readFormData } from "./request"
import { htmlResponse, isFailResult, notFound } from "./response"
import { matchRoute } from "./router"
import { createAuth, type Auth } from "./auth"
import { createFlash, type Flash } from "./flash"
import { commitSession, createSession, type Session } from "./session"
import { createActionForm } from "../route/action"
import { renderPageView } from "../render/view"
import type { RouteManifest } from "../scanner/route-manifest"
import { scanRoutes } from "../scanner/scan-routes"
import { servePublic } from "../static/serve-public"
import { resolvePath } from "../utils/path"
import type { ResolvedGorosConfig } from "../config/types"

import { logRequest, isStaticAsset } from "../cli/ui/activity"

export type GorosAppOptions = {
  root: string
  config: ResolvedGorosConfig
  manifest?: RouteManifest | undefined
  dev?: boolean | undefined
  quiet?: boolean | undefined
  verbose?: boolean | undefined
  plain?: boolean | undefined
}

export function createGorosApp(options: GorosAppOptions): { fetch(req: Request): Promise<Response> } {
  return {
    async fetch(req: Request): Promise<Response> {
      const url = new URL(req.url)
      const session = createSession(req, options.config.session)
      const auth = createAuth(session)
      const flash = createFlash(session)
      const manifest = options.dev ? scanRoutes(resolvePath(options.root, options.config.app.routesDir)) : options.manifest ?? []

      const startTime = performance.now()
      let status = 200
      let kind: "serve" | "render" | "api" | "action" | "miss" | "error" = "serve"
      let extra = ""
      let response: Response | null = null

      try {
        const publicResponse = await servePublic(resolvePath(options.root, options.config.app.publicDir), url)
        if (publicResponse) {
          response = publicResponse
          kind = "serve"
        } else {
          if (url.pathname.startsWith("/api/")) {
            kind = "api"
            const matched = matchRoute(manifest, url.pathname, "api")
            if (!matched) {
              kind = "miss"
            }
            response = await handleApi(req, url, manifest, session, auth, flash)
          } else {
            const matched = matchRoute(manifest, url.pathname, "page")
            if (!matched) {
              kind = "miss"
            } else {
              if (req.method === "POST" && url.search.startsWith("?/")) {
                kind = "action"
              } else {
                kind = matched.item.pageModule ? "render" : "serve"
              }
            }
            response = await handlePage(req, url, manifest, options, session, auth, flash)
          }
        }

        status = response.status
        if (status >= 300 && status < 400) {
          extra = response.headers.get("location") ?? ""
        } else if (status >= 400 && status < 500) {
          if (kind === "action") {
            extra = "fail"
          } else if (kind === "miss") {
            extra = ""
          }
        }

        const finalResponse = commitSession(response, session)
        return finalResponse
      } catch (err: any) {
        status = 500
        kind = "error"
        extra = err.message || ""
        throw err
      } finally {
        const duration = Math.round(performance.now() - startTime)
        const configLog = options.config.cli.requestLog
        const isCliRunning = options.quiet !== undefined || options.verbose !== undefined || options.plain !== undefined || options.dev
        
        if (configLog && isCliRunning) {
          const isStatic = isStaticAsset(url.pathname)
          const isQuiet = options.quiet === true
          const isVerbose = options.verbose === true
          
          if (isStatic && !isVerbose) {
            // skip static logs
          } else if (isQuiet && status < 500) {
            // skip normal logs in quiet mode
          } else {
            logRequest(req.method, url.pathname + url.search, status, kind, duration, extra, options.dev)
          }
        }
      }
    }
  }
}

async function handleApi(req: Request, url: URL, manifest: RouteManifest, session: Session, auth: Auth, flash: Flash): Promise<Response> {
  const match = matchRoute(manifest, url.pathname, "api")
  if (!match?.item.apiModule) {
    return notFound()
  }

  const module = await importFresh(match.item.apiModule)
  const handler = module[req.method]

  if (typeof handler !== "function") {
    return new Response("Method Not Allowed", { status: 405 })
  }

  return handler({
    req,
    url,
    params: match.params,
    query: url.searchParams,
    session,
    auth,
    flash,
    body: createBodyReader(req)
  })
}

async function handlePage(
  req: Request,
  url: URL,
  manifest: RouteManifest,
  options: GorosAppOptions,
  session: Session,
  auth: Auth,
  flash: Flash
): Promise<Response> {
  const match = matchRoute(manifest, url.pathname, "page")
  if (!match?.item.pageHtml) {
    return notFound()
  }

  if (req.method === "POST" && url.search.startsWith("?/")) {
    return handleAction(req, url, match, options, session, auth, flash)
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    return new Response("Method Not Allowed", { status: 405 })
  }

  return renderPage(req, url, match, options, session, auth, flash)
}

async function handleAction(
  req: Request,
  url: URL,
  match: NonNullable<ReturnType<typeof matchRoute>>,
  options: GorosAppOptions,
  session: Session,
  auth: Auth,
  flash: Flash
): Promise<Response> {
  const actionName = decodeURIComponent(url.search.slice(2))

  if (!actionName || !match.item.actionsModule) {
    return notFound()
  }

  const module = await importFresh(match.item.actionsModule)
  const handler = module[actionName]

  if (typeof handler !== "function") {
    const foundActions = Object.keys(module).filter(k => k !== "default" && typeof module[k] === "function")
    throw new GorosUserError(`Action \`${actionName}\` was not found.`, {
      code: "KQ_ACTION_NOT_FOUND",
      file: path.relative(options.root, match.item.actionsModule),
      expected: `export const ${actionName} = action(...)`,
      found: foundActions.length > 0 ? foundActions.join(", ") : "none",
      hint: "Rename the export or update the form action."
    })
  }

  const result = await handler({
    req,
    url,
    params: match.params,
    query: url.searchParams,
    session,
    auth,
    flash,
    form: createActionForm(await readFormData(req))
  })

  if (isFailResult(result)) {
    return renderPage(req, url, match, options, session, auth, flash, result.data, result.status)
  }

  return result
}

async function renderPage(
  req: Request,
  url: URL,
  match: NonNullable<ReturnType<typeof matchRoute>>,
  options: GorosAppOptions,
  session: Session,
  auth: Auth,
  flash: Flash,
  extraData: Record<string, unknown> = {},
  status = 200
): Promise<Response> {
  let data: Record<string, unknown> = {}

  if (match.item.pageModule) {
    const module = await importFresh(match.item.pageModule)
    const handler = module.default

    if (typeof handler === "function") {
      const result = await handler({
        req,
        url,
        params: match.params,
        query: url.searchParams,
        session,
        auth,
        flash,
        user: null
      })

      if (result instanceof Response) {
        return result
      }

      if (isRecord(result)) {
        data = result
      }
    }
  }

  const html = renderPageView({
    pageHtmlPath: match.item.pageHtml ?? "",
    appRoot: resolvePath(options.root, options.config.app.root),
    routesDir: resolvePath(options.root, options.config.app.routesDir),
    routeDir: match.item.routeDir,
    data: { ...data, ...extraData, flash: flash.consume() }
  })

  return htmlResponse(html, { status })
}

async function importFresh(filePath: string): Promise<Record<string, unknown>> {
  return import(`${pathToFileURL(filePath).href}?t=${Date.now()}`) as Promise<Record<string, unknown>>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}
