import type { BaseContext } from "../core/context"

export type PageContext = BaseContext & {
  user?: null
}

export type PageResult<TData> = TData | Response

export type PageHandler<TData = Record<string, unknown>> = (
  context: PageContext
) => PageResult<TData> | Promise<PageResult<TData>>

export function page<TData>(handler: PageHandler<TData>): PageHandler<TData> {
  return handler
}
