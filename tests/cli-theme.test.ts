import { expect, test } from "bun:test"
import { initUiSettings, isUnicodeEnabled } from "../packages/boronix/src/cli/ui/terminal"
import { symbols } from "../packages/boronix/src/cli/ui/symbols"

test("cli theme overrides disable colors and unicode", () => {
  const oldTerm = process.env.TERM
  process.env.TERM = "xterm-256color"
  
  try {
    // Test with config disabling both
    initUiSettings({}, { color: false, unicode: false })
    expect(isUnicodeEnabled()).toBe(false)
    expect(symbols.header()).toBe("*")

    // Reset to default
    initUiSettings({}, { color: true, unicode: true })
    expect(isUnicodeEnabled()).toBe(true)
    expect(symbols.header()).toBe("◆")
  } finally {
    process.env.TERM = oldTerm
  }
})
