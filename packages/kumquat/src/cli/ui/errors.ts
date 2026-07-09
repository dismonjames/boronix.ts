import { symbols } from "./symbols"
import { colors } from "./colors"
import { KumquatUserError } from "../../core/errors"

export function formatCliError(error: unknown): string {
  if (error instanceof KumquatUserError) {
    const errSymbol = symbols.error()
    const errSymbolColored = colors.error(errSymbol)
    const errTitle = colors.bold("Kumquat error")
    const errCode = error.code ? " " + colors.error(error.code) : ""
    
    const lines = [`${errSymbolColored} ${errTitle}${errCode}`, ""]
    
    lines.push(error.message)
    lines.push("")

    if (error.file) {
      lines.push(colors.bold("File:"), `  ${colors.path(error.file)}`, "")
    }

    if (error.expected) {
      lines.push(colors.bold("Expected:"), `  ${error.expected}`, "")
    }

    if (error.found) {
      lines.push(colors.bold("Found:"), `  ${error.found}`, "")
    }

    if (error.hint) {
      lines.push(colors.bold("Hint:"), `  ${error.hint}`, "")
    }

    // remove trailing empty line if any
    while (lines.length > 0 && lines[lines.length - 1] === "") {
      lines.pop()
    }

    return lines.join("\n")
  }

  if (error instanceof Error) {
    const errSymbolColored = colors.error(symbols.error())
    const errTitle = colors.bold("Kumquat error")
    
    let message = error.message
    let hint = ""
    let code = "KQ_ERROR"
    if (
      message.includes("EADDRINUSE") || 
      message.includes("address already in use") || 
      message.includes("port in use") || 
      (message.includes("Port ") && message.includes("in use"))
    ) {
      code = "KQ_PORT_IN_USE"
      const portMatch = message.match(/\b\d{4,5}\b/)
      const port = portMatch ? portMatch[0] : "3000"
      message = `Port ${port} is already in use.`
      hint = `Try \`kumquat dev --port ${parseInt(port) + 1}\`.`
      
      const lines = [
        `${errSymbolColored} ${errTitle} ${colors.error(code)}`,
        "",
        message,
        "",
        colors.bold("Hint:"),
        `  ${hint}`
      ]
      return lines.join("\n")
    }

    return `${errSymbolColored} ${errTitle}\n\n${message}`
  }

  const errSymbolColored = colors.error(symbols.error())
  return `${errSymbolColored} ${colors.bold("Kumquat error")}\n\n${String(error)}`
}
