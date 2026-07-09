export type KumquatErrorOptions = {
  code?: string
  file?: string
  expected?: string
  hint?: string
  cause?: unknown
}

export class KumquatError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "KumquatError"
  }
}

export class KumquatUserError extends KumquatError {
  readonly code?: string | undefined
  readonly file?: string | undefined
  readonly expected?: string | undefined
  readonly hint?: string | undefined

  constructor(message: string, options: KumquatErrorOptions = {}) {
    super(message)
    this.name = "KumquatUserError"
    this.code = options.code
    this.file = options.file
    this.expected = options.expected
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

export function formatKumquatError(error: unknown): string {
  // We can delegate to CLI formatting, or keep a fallback here.
  // To keep core clean, we'll let cli/main.ts handle the formatting, 
  // but keep a simple default string representation here if accessed elsewhere.
  if (error instanceof KumquatUserError) {
    const lines = [`Kumquat error: ${error.message}`]
    if (error.file) lines.push("", "File:", `  ${error.file}`)
    if (error.hint) lines.push("", "Hint:", `  ${error.hint}`)
    return lines.join("\n")
  }
  if (error instanceof Error) {
    return `Kumquat error: ${error.message}`
  }
  return `Kumquat error: ${String(error)}`
}

