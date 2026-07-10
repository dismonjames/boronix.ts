import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

export type BoronixErrorOptions = {
  code?: string | undefined
  file?: string | undefined
  expected?: string | undefined
  found?: string | undefined
  hint?: string | undefined
  cause?: unknown
}

export class BoronixError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "BoronixError"
  }
}

export class BoronixUserError extends BoronixError {
  readonly code?: string | undefined
  readonly file?: string | undefined
  readonly expected?: string | undefined
  readonly found?: string | undefined
  readonly hint?: string | undefined

  constructor(message: string, options: BoronixErrorOptions = {}) {
    super(message)
    this.name = "BoronixUserError"
    this.code = options.code
    this.file = options.file
    this.expected = options.expected
    this.found = options.found
    this.hint = options.hint
    this.cause = options.cause
  }

  get details(): { file?: string | undefined; hint?: string | undefined } {
    return {
      file: this.file,
      hint: this.hint
    }
  }
}

export type BoronixErrorPhase =
  | "config"
  | "middleware"
  | "layout"
  | "page-loader"
  | "page-render"
  | "api"
  | "action"
  | "static"
  | "router"
  | "unknown"

export type BoronixDiagnostic = {
  phase: BoronixErrorPhase
  route?: string | undefined
  pattern?: string | undefined
  file?: string | undefined
  action?: string | undefined
  method?: string | undefined
  status?: number | undefined
  message: string
  stack?: string | undefined
  codeFrame?: string | undefined
  hints?: string[] | undefined
}

export function parseStackTrace(stack: string, rootDir: string): { file?: string | undefined; line?: number | undefined; column?: number | undefined; cleanStack: string } {
  const lines = stack.split("\n")
  const frames: string[] = []
  let firstUserFrame: { file: string; line: number; column: number } | undefined

  for (const line of lines) {
    const match = line.match(/(?:at\s+)?(?:(.*?)\s+\()?([^()\s]+):(\d+):(\d+)\)?$/)
    if (match) {
      let filePath = match[2]!
      const lineNum = parseInt(match[3]!, 10)
      const colNum = parseInt(match[4]!, 10)

      if (filePath.startsWith("file://")) {
        try {
          filePath = fileURLToPath(filePath)
        } catch {
          filePath = filePath.replace(/^file:\/\//, "")
        }
      }

      let relativePath = filePath
      if (path.isAbsolute(filePath)) {
        relativePath = path.relative(rootDir, filePath)
      }

      const isInternal = relativePath.includes("node_modules") || relativePath.includes("packages/boronix")
      const isUser = !isInternal && (relativePath.startsWith("app") || relativePath.startsWith("./app") || !relativePath.startsWith(".."))

      if (isUser && !firstUserFrame) {
        firstUserFrame = { file: relativePath, line: lineNum, column: colNum }
      }

      const cleanLine = line.replace(match[2]!, relativePath)
      frames.push(cleanLine)
    } else {
      frames.push(line)
    }
  }

  return {
    file: firstUserFrame?.file,
    line: firstUserFrame?.line,
    column: firstUserFrame?.column,
    cleanStack: frames.join("\n")
  }
}

export function generateCodeFrame(filePath: string, line: number, column?: number): string {
  if (!existsSync(filePath)) return ""
  try {
    const content = readFileSync(filePath, "utf8")
    const lines = content.split(/\r?\n/)
    const start = Math.max(0, line - 3)
    const end = Math.min(lines.length, line + 2)

    const maxLength = String(end).length
    const frameLines: string[] = []

    for (let i = start; i < end; i++) {
      const currentLineNum = i + 1
      const isTarget = currentLineNum === line
      const lineContent = lines[i]!
      
      const prefix = isTarget 
        ? `> ${String(currentLineNum).padStart(maxLength)} | `
        : `  ${String(currentLineNum).padStart(maxLength)} | `
        
      frameLines.push(`${prefix}${lineContent}`)

      if (isTarget && column !== undefined && column > 0) {
        const caretPrefix = `    | `
        const caretPadding = " ".repeat(column - 1)
        frameLines.push(`${caretPrefix}${caretPadding}^`)
      }
    }
    return frameLines.join("\n")
  } catch {
    return ""
  }
}

export function diagnoseError(
  error: unknown,
  root: string,
  defaultPhase: BoronixErrorPhase = "unknown"
): BoronixDiagnostic {
  let phase: BoronixErrorPhase = defaultPhase
  let message = "Unknown error"
  let stack = ""
  let file: string | undefined
  let expected: string | undefined
  let found: string | undefined
  let hint: string | undefined
  let hints: string[] = []

  if (error && typeof error === "object") {
    const errObj = error as any
    if (errObj.phase) {
      phase = errObj.phase
    }
    if (errObj.code) {
      hints.push(`Code: ${errObj.code}`)
    }
  }

  if (error instanceof BoronixUserError) {
    message = error.message
    file = error.file
    expected = error.expected
    found = error.found
    hint = error.hint
    if (error.stack) {
      stack = error.stack
    }
  } else if (error instanceof Error) {
    message = error.message
    if (error.stack) {
      stack = error.stack
    }
  } else {
    message = String(error)
  }

  let cleanStack = stack
  let codeFrame = ""
  if (stack) {
    const parsed = parseStackTrace(stack, root)
    cleanStack = parsed.cleanStack
    if (!file && parsed.file) {
      file = parsed.file
    }
    if (file && parsed.line !== undefined) {
      const fullPath = path.isAbsolute(file) ? file : path.resolve(root, file)
      codeFrame = generateCodeFrame(fullPath, parsed.line, parsed.column)
    }
  }

  if (expected || found) {
    let shapeHint = ""
    if (expected) shapeHint += `Expected export:\n${expected}\n`
    if (found) shapeHint += `Found:\n${found}`
    if (shapeHint) hints.push(shapeHint)
  }

  if (hint) {
    hints.push(hint)
  }

  if (message.includes("Cannot read properties of undefined") || message.includes("is not defined")) {
    hints.push("Check if the variable/property is defined before accessing it.")
  }

  return {
    phase,
    file: file || undefined,
    message,
    stack: cleanStack || undefined,
    codeFrame: codeFrame || undefined,
    hints: hints.length > 0 ? hints : undefined
  }
}

export function formatBoronixError(error: unknown): string {
  if (error instanceof BoronixUserError) {
    const lines = [`Boronix error: ${error.message}`]
    if (error.file) lines.push("", "File:", `  ${error.file}`)
    if (error.hint) lines.push("", "Hint:", `  ${error.hint}`)
    return lines.join("\n")
  }
  if (error instanceof Error) {
    return `Boronix error: ${error.message}`
  }
  return `Boronix error: ${String(error)}`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export function renderDevErrorPage(diagnostic: BoronixDiagnostic): string {
  const hintsList = (diagnostic.hints ?? []).map(h => `<li>${escapeHtml(h)}</li>`).join("")
  const hintsHtml = (diagnostic.hints && diagnostic.hints.length > 0)
    ? `<div class="hints">
        <h3>Suggestions / Hints</h3>
        <ul>${hintsList}</ul>
       </div>`
    : ""

  const codeFrameHtml = diagnostic.codeFrame
    ? `<div class="code-frame">
        <div class="code-frame-title">${escapeHtml(diagnostic.file ?? "")}</div>
        <pre><code>${escapeHtml(diagnostic.codeFrame)}</code></pre>
       </div>`
    : ""

  const matchedPatternHtml = diagnostic.pattern
    ? `<div class="meta-item"><span class="meta-label">Pattern:</span> <code class="meta-val">${escapeHtml(diagnostic.pattern)}</code></div>`
    : ""

  const sourceFileHtml = diagnostic.file
    ? `<div class="meta-item"><span class="meta-label">Source File:</span> <code class="meta-val">${escapeHtml(diagnostic.file)}</code></div>`
    : ""

  const actionHtml = diagnostic.action
    ? `<div class="meta-item"><span class="meta-label">Action:</span> <code class="meta-val">${escapeHtml(diagnostic.action)}</code></div>`
    : ""

  const stackHtml = diagnostic.stack
    ? `<div class="stack-trace">
        <h3>Stack Trace</h3>
        <pre><code>${escapeHtml(diagnostic.stack)}</code></pre>
       </div>`
    : ""

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Boronix Error</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #0f172a;
      color: #f1f5f9;
      margin: 0;
      padding: 40px;
      box-sizing: border-box;
      line-height: 1.5;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
    }
    .header {
      border-bottom: 2px solid #f43f5e;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .brand {
      color: #f43f5e;
      font-weight: 700;
      font-size: 1.1rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 8px;
    }
    h1 {
      margin: 0;
      font-size: 2.2rem;
      color: #fff;
      font-weight: 800;
      word-break: break-word;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 15px;
      background: #1e293b;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
      border: 1px solid #334155;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
    }
    .meta-label {
      color: #94a3b8;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
    }
    .meta-val {
      color: #e2e8f0;
      font-size: 0.95rem;
      font-weight: 600;
    }
    code.meta-val {
      background: #0f172a;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.85em;
      color: #38bdf8;
      align-self: flex-start;
      word-break: break-all;
    }
    .code-frame {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 8px;
      margin-bottom: 30px;
      overflow: hidden;
    }
    .code-frame-title {
      background: #1e293b;
      padding: 10px 20px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.85rem;
      border-bottom: 1px solid #334155;
      color: #cbd5e1;
    }
    pre {
      margin: 0;
      padding: 20px;
      overflow-x: auto;
    }
    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.9rem;
    }
    .code-frame code {
      color: #e2e8f0;
    }
    .code-frame pre {
      background: #0f172a;
    }
    .hints {
      background: #172554;
      border: 1px solid #1e3a8a;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .hints h3 {
      margin-top: 0;
      color: #60a5fa;
      font-size: 1.1rem;
    }
    .hints ul {
      margin: 0;
      padding-left: 20px;
      color: #93c5fd;
    }
    .hints li {
      margin-bottom: 8px;
    }
    .stack-trace {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 20px;
    }
    .stack-trace h3 {
      margin-top: 0;
      color: #cbd5e1;
      border-bottom: 1px solid #334155;
      padding-bottom: 10px;
    }
    .stack-trace code {
      color: #f1f5f9;
      font-size: 0.85rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">Boronix Dev Error</div>
      <h1>${escapeHtml(diagnostic.message)}</h1>
    </div>

    <div class="meta-grid">
      <div class="meta-item"><span class="meta-label">Route:</span> <code class="meta-val">${escapeHtml(diagnostic.route ?? "")}</code></div>
      ${matchedPatternHtml}
      <div class="meta-item"><span class="meta-label">Phase:</span> <code class="meta-val">${escapeHtml(diagnostic.phase)}</code></div>
      ${sourceFileHtml}
      ${actionHtml}
    </div>

    ${hintsHtml}
    ${codeFrameHtml}
    ${stackHtml}
  </div>
</body>
</html>
  `
}
