import { symbols } from "./symbols"
import { colors } from "./colors"

export function formatRootHelp(): string {
  return `${colors.bold("Kumquat.ts")}

${colors.bold("Usage")}
  kumquat <command> [options]

${colors.bold("Commands")}
  dev       Start development server
  build     Build production manifest
  start     Start production server
  info      Print environment information
  doctor    Check project health
  typegen   Generate route types

${colors.bold("Options")}
  -h, --help       Show help
  -v, --version    Show version`
}

export function formatCommandHelp(command: string): string {
  let usage = `kumquat ${command} [options]`
  let options = ""

  if (command === "dev") {
    options = `  --root <dir>        Project root
  --runtime <name>    bun | node
  -p, --port <port>   Server port
  -H, --host <host>   Server host
  --plain             Disable colors, unicode, and spinner
  --no-color          Disable colors`
  } else if (command === "start") {
    options = `  --root <dir>        Project root
  --runtime <name>    bun | node
  -p, --port <port>   Server port
  -H, --host <host>   Server host
  --plain             Disable colors, unicode, and spinner
  --no-color          Disable colors`
  } else if (command === "build") {
    options = `  --root <dir>        Project root
  --runtime <name>    bun | node
  --plain             Disable colors, unicode, and spinner
  --no-color          Disable colors`
  } else {
    options = `  --root <dir>        Project root
  --plain             Disable colors, unicode, and spinner
  --no-color          Disable colors`
  }

  return `${colors.bold("Usage")}
  ${usage}

${colors.bold("Options")}
${options}`
}

export function formatHeader(commandName: string, isPlainMode: boolean): string {
  if (isPlainMode) {
    return `Kumquat ${commandName}`
  }
  return `${colors.brand(symbols.header())} ${colors.bold(`Kumquat ${commandName}`)}`
}
