import type { BaseContext } from "../core/context"
import type { FailResult } from "../core/response"

export type ActionForm = Omit<FormData, "values"> & {
  string(name: string): string
  required(name: string, message: string): string
  email(name: string, message: string): string
  min(name: string, length: number, message: string): string
  number(name: string, message: string): number | null
  boolean(name: string): boolean
  values(): Record<string, string>
  errors(): Record<string, string>
  isValid(): boolean
}

export type ActionContext = BaseContext & {
  form: ActionForm
}

export type ActionHandler = (context: ActionContext) => Response | FailResult | Promise<Response | FailResult>

export function action(handler: ActionHandler): ActionHandler {
  return handler
}

export function createActionForm(formData: FormData): ActionForm {
  const form = formData as unknown as ActionForm
  const errors: Record<string, string> = {}

  form.string = (name: string) => {
    const value = form.get(name)
    return typeof value === "string" ? value : ""
  }
  form.required = (name: string, message: string) => {
    const value = form.string(name).trim()
    if (!value) {
      addError(errors, name, message)
    }
    return value
  }
  form.email = (name: string, message: string) => {
    const value = form.string(name).trim()
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      addError(errors, name, message)
    }
    return value
  }
  form.min = (name: string, length: number, message: string) => {
    const value = form.string(name)
    if (value && value.length < length) {
      addError(errors, name, message)
    }
    return value
  }
  form.number = (name: string, message: string) => {
    const value = form.string(name).trim()
    if (!value) return null

    const parsed = Number(value)
    if (Number.isNaN(parsed)) {
      addError(errors, name, message)
      return null
    }

    return parsed
  }
  form.boolean = (name: string) => {
    const value = form.get(name)
    return value === "on" || value === "true" || value === "1"
  }
  form.values = () => {
    const values: Record<string, string> = {}
    for (const [name, value] of form.entries()) {
      if (typeof value === "string") {
        values[name] = value
      }
    }
    return values
  }
  form.errors = () => ({ ...errors })
  form.isValid = () => Object.keys(errors).length === 0
  return form
}

function addError(errors: Record<string, string>, name: string, message: string): void {
  if (!(name in errors)) {
    errors[name] = message
  }
}
