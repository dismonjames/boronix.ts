import { existsSync } from "node:fs"
import path from "node:path"
import { readTextFile } from "../utils/fs"
import { renderTemplate } from "./template"

export function renderPageView(pageHtmlPath: string, appRoot: string, data: Record<string, unknown>): string {
  const pageHtml = readTextFile(pageHtmlPath)
  const renderedPage = renderTemplate(pageHtml, data)
  const layoutPath = path.join(appRoot, "layout.html")

  if (!existsSync(layoutPath)) {
    return renderedPage
  }

  return renderTemplate(readTextFile(layoutPath), { ...data, body: renderedPage }, { rawKeys: new Set(["body"]) })
}
