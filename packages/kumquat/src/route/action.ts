import type { BaseContext } from "../core/context"
import type { FailResult } from "../core/response"

export type ActionForm = FormData & {
  string(name: string): string
}

export type ActionContext = BaseContext & {
  form: ActionForm
}

export type ActionHandler = (context: ActionContext) => Response | FailResult | Promise<Response | FailResult>

export function action(handler: ActionHandler): ActionHandler {
  return handler
}

export function createActionForm(formData: FormData): ActionForm {
  const form = formData as ActionForm
  form.string = (name: string) => {
    const value = form.get(name)
    return typeof value === "string" ? value : ""
  }
  return form
}
