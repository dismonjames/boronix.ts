export type FailResult = {
  type: "kumquat.fail"
  data: Record<string, unknown>
  status: number
}

export function json(data: unknown, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers)
  headers.set("content-type", "application/json; charset=utf-8")
  return new Response(JSON.stringify(data), { ...init, headers })
}

export function redirect(location: string, status = 303): Response {
  return new Response(null, {
    status,
    headers: {
      location
    }
  })
}

export function notFound(data?: unknown): Response {
  if (data == null) {
    return new Response("Not Found", { status: 404 })
  }

  return json(data, { status: 404 })
}

export function fail(data: Record<string, unknown>, init?: ResponseInit): FailResult {
  return {
    type: "kumquat.fail",
    data,
    status: init?.status ?? 400
  }
}

export function htmlResponse(html: string, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers)
  headers.set("content-type", "text/html; charset=utf-8")
  return new Response(html, { ...init, headers })
}

export function isFailResult(value: unknown): value is FailResult {
  return typeof value === "object" && value !== null && "type" in value && value.type === "kumquat.fail"
}
