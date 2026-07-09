export type BoronixErrorOptions = {
  code?: string
  file?: string
  expected?: string
  found?: string
  hint?: string
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

export function formatBoronixError(error: unknown): string {
  // We can delegate to CLI formatting, or keep a fallback here.
  // To keep core clean, we'll let cli/main.ts handle the formatting, 
  // but keep a simple default string representation here if accessed elsewhere.
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

