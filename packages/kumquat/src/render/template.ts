import { escapeHtml } from "./escape"

type TemplateContext = Record<string, unknown>

type RenderOptions = {
  rawKeys?: Set<string>
}

export function renderTemplate(template: string, data: TemplateContext = {}, options: RenderOptions = {}): string {
  const withEach = renderEachBlocks(template, data, options)
  const withIf = renderIfBlocks(withEach, data, options)

  return withIf.replace(/\{\{\s*([A-Za-z0-9_.]+)\s*\}\}/g, (_match, key: string) => {
    const value = readPath(data, key)
    if (value == null) return ""
    if (options.rawKeys?.has(key)) return String(value)
    return escapeHtml(value)
  })
}

function renderIfBlocks(template: string, data: TemplateContext, options: RenderOptions): string {
  return template.replace(/\{\{#if\s+([A-Za-z0-9_.]+)\s*\}\}([\s\S]*?)\{\{\/if\}\}/g, (_match, key: string, body: string) => {
    const value = readPath(data, key)
    return value ? renderTemplate(body, data, options) : ""
  })
}

function renderEachBlocks(template: string, data: TemplateContext, options: RenderOptions): string {
  return template.replace(/\{\{#each\s+([A-Za-z0-9_.]+)\s*\}\}([\s\S]*?)\{\{\/each\}\}/g, (_match, key: string, body: string) => {
    const value = readPath(data, key)
    if (!Array.isArray(value)) return ""

    return value
      .map((item) => {
        const itemContext = isRecord(item) ? { ...data, ...item } : { ...data, this: item }
        return renderTemplate(body, itemContext, options)
      })
      .join("")
  })
}

export function readPath(data: TemplateContext, key: string): unknown {
  return key.split(".").reduce<unknown>((current, part) => {
    if (!isRecord(current)) return undefined
    return current[part]
  }, data)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}
