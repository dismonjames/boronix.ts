import { existsSync, statSync, readFileSync } from "node:fs"
import path from "node:path"
import { getMimeType } from "./mime"
import { getBoronixMode } from "../core/mode"

export async function servePublic(publicDir: string, url: URL, req?: Request): Promise<Response | null> {
  const decodedPath = decodeURIComponent(url.pathname)
  const relativePath = decodedPath.replace(/^\/+/, "")
  const filePath = path.resolve(publicDir, relativePath)
  const publicRoot = path.resolve(publicDir)
  const relativeToPublic = path.relative(publicRoot, filePath)

  if (relativeToPublic.startsWith("..") || path.isAbsolute(relativeToPublic)) {
    return new Response("Forbidden", { status: 403 })
  }

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    return null
  }

  const stat = statSync(filePath)
  const etag = `W/"${stat.size}-${stat.mtimeMs}"`
  const lastModified = stat.mtime.toUTCString()

  // Resolve Cache-Control
  const isProd = getBoronixMode() === "production"
  let cacheControl = "no-store"
  if (isProd) {
    const basename = path.basename(filePath)
    const hasHash = /\.[a-f0-9]{8,32}\.[a-z0-9]+$/i.test(basename)
    if (hasHash) {
      cacheControl = "public, max-age=31536000, immutable"
    } else {
      cacheControl = "public, max-age=3600"
    }
  }

  // Handle conditional request
  const ifNoneMatch = req?.headers.get("if-none-match")
  const ifModifiedSince = req?.headers.get("if-modified-since")

  if (ifNoneMatch && ifNoneMatch === etag) {
    return new Response(null, {
      status: 304,
      headers: {
        "etag": etag,
        "last-modified": lastModified,
        "cache-control": cacheControl
      }
    })
  }

  if (ifModifiedSince) {
    try {
      const imsTime = new Date(ifModifiedSince).getTime()
      const mtimeSecs = Math.floor(stat.mtime.getTime() / 1000) * 1000
      if (!isNaN(imsTime) && imsTime >= mtimeSecs) {
        return new Response(null, {
          status: 304,
          headers: {
            "etag": etag,
            "last-modified": lastModified,
            "cache-control": cacheControl
          }
        })
      }
    } catch {}
  }

  const hasBun = typeof Bun !== "undefined"
  const body = hasBun ? (Bun.file(filePath) as any) : readFileSync(filePath)

  return new Response(body, {
    headers: {
      "content-type": getMimeType(filePath),
      "etag": etag,
      "last-modified": lastModified,
      "cache-control": cacheControl
    }
  })
}
