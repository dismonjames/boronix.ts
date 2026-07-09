import type { BaseContext } from "../core/context"
import type { BodyReader } from "../core/request"

export type ApiContext = BaseContext & {
  body: BodyReader
}

export type ApiHandler = (context: ApiContext) => Response | Promise<Response>

export function api(handler: ApiHandler): ApiHandler {
  return handler
}
