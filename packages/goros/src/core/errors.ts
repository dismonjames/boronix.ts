export type GorosErrorOptions = {
  code?: string
  file?: string
  expected?: string
  found?: string
  hint?: string
  cause?: unknown
}

export class GorosError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "GorosError"
  }
}

export class GorosUserError extends GorosError {
  readonly code?: string | undefined
  readonly file?: string | undefined
  readonly expected?: string | undefined
  readonly found?: string | undefined
  readonly hint?: string | undefined

  constructor(message: string, options: GorosErrorOptions = {}) {
    super(message)
    this.name = "GorosUserError"
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

export function formatGorosError(error: unknown): string {
  // We can delegate to CLI formatting, or keep a fallback here.
  // To keep core clean, we'll let cli/main.ts handle the formatting, 
  // but keep a simple default string representation here if accessed elsewhere.
  if (error instanceof GorosUserError) {
    const lines = [`Goros error: ${error.message}`]
    if (error.file) lines.push("", "File:", `  ${error.file}`)
    if (error.hint) lines.push("", "Hint:", `  ${error.hint}`)
    return lines.join("\n")
  }
  if (error instanceof Error) {
    return `Goros error: ${error.message}`
  }
  return `Goros error: ${String(error)}`
}

