import fs from "node:fs"
import path from "node:path"
import esbuild from "esbuild"
import { BoronixUserError } from "../core/errors"
import { validateBuildManifest } from "./manifest"
import { resolvePath } from "../utils/path"
import type { ResolvedBoronixConfig } from "../config/types"

export function writeBuildOutput(
  root: string,
  config: ResolvedBoronixConfig | any,
  routes?: any[],
  runtimeName?: "bun" | "node"
): Promise<void> | void {
  const tmpDir = path.join(root, ".boronix.tmp")
  const outputDir = path.join(root, ".boronix")

  // Legacy signature support (used in atomic output test)
  if (routes === undefined) {
    const manifest = config
    try {
      if (fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true, force: true })
      }
      fs.mkdirSync(tmpDir, { recursive: true })
      fs.writeFileSync(path.join(tmpDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`)
      
      validateBuildManifest(manifest, manifest.runtime || "node", root)

      const bakDir = path.join(root, ".boronix.bak")
      if (fs.existsSync(bakDir)) {
        fs.rmSync(bakDir, { recursive: true, force: true })
      }
      if (fs.existsSync(outputDir)) {
        fs.renameSync(outputDir, bakDir)
      }
      fs.renameSync(tmpDir, outputDir)
      if (fs.existsSync(bakDir)) {
        fs.rmSync(bakDir, { recursive: true, force: true })
      }
      return
    } catch (err: any) {
      if (fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true, force: true })
      }
      throw new BoronixUserError(`Failed to write build output atomically: ${err.message}`, {
        code: "KQ_BUILD_OUTPUT_WRITE_FAILED",
        cause: err
      })
    }
  }

  // Async compile path
  return (async () => {
    const tmpTemplates = path.join(tmpDir, "templates")
    const tmpPublic = path.join(tmpDir, "public")
    const tmpServer = path.join(tmpDir, "server")

    try {
      // 1. Clean and build to .boronix.tmp
      if (fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true, force: true })
      }
      fs.mkdirSync(tmpDir, { recursive: true })

      // Copy app HTML files recursively to .boronix.tmp/templates
      function copyHtmlFiles(src: string, dest: string) {
        if (!fs.existsSync(src)) return
        fs.mkdirSync(dest, { recursive: true })
        const entries = fs.readdirSync(src, { withFileTypes: true })
        for (const entry of entries) {
          const srcPath = path.join(src, entry.name)
          const destPath = path.join(dest, entry.name)
          if (entry.isDirectory()) {
            copyHtmlFiles(srcPath, destPath)
          } else if (entry.isFile() && entry.name.endsWith(".html")) {
            fs.cpSync(srcPath, destPath)
          }
        }
      }

      const appRootSource = resolvePath(root, config.app.root)
      copyHtmlFiles(appRootSource, tmpTemplates)

      // Copy public directory to .boronix.tmp/public
      const publicSource = resolvePath(root, config.app.publicDir)
      if (fs.existsSync(publicSource)) {
        fs.cpSync(publicSource, tmpPublic, { recursive: true })
      } else {
        fs.mkdirSync(tmpPublic, { recursive: true })
      }

      // Compile JS bundle using esbuild
      fs.mkdirSync(tmpServer, { recursive: true })

      // Generate entry-source.js code
      let entryCode = ""
      let importCounter = 0
      const modulesMap: Record<string, string> = {}

      // config
      const configPath = resolvePath(root, "boronix.config.ts")
      if (fs.existsSync(configPath)) {
        entryCode += `import * as config from ${JSON.stringify(configPath.replace(/\\/g, "/"))};\n`
        modulesMap["config"] = "config"
      } else {
        entryCode += `const config = undefined;\n`
        modulesMap["config"] = "config"
      }

      // middleware
      const middlewarePath = resolvePath(root, "app/middleware.ts")
      if (fs.existsSync(middlewarePath)) {
        entryCode += `import * as middleware from ${JSON.stringify(middlewarePath.replace(/\\/g, "/"))};\n`
        modulesMap["middleware"] = "middleware"
      }

      // routes
      for (const route of routes) {
        if (route.pageModule && fs.existsSync(route.pageModule)) {
          const name = `page_${importCounter++}`
          entryCode += `import * as ${name} from ${JSON.stringify(route.pageModule.replace(/\\/g, "/"))};\n`
          modulesMap[route.pageModule] = name
        }
        if (route.actionsModule && fs.existsSync(route.actionsModule)) {
          const name = `actions_${importCounter++}`
          entryCode += `import * as ${name} from ${JSON.stringify(route.actionsModule.replace(/\\/g, "/"))};\n`
          modulesMap[route.actionsModule] = name
        }
        if (route.apiModule && fs.existsSync(route.apiModule)) {
          const name = `api_${importCounter++}`
          entryCode += `import * as ${name} from ${JSON.stringify(route.apiModule.replace(/\\/g, "/"))};\n`
          modulesMap[route.apiModule] = name
        }
      }

      entryCode += `\nglobalThis.boronixCompiledModules = {\n`
      for (const [key, value] of Object.entries(modulesMap)) {
        const relKey = path.relative(root, key).replace(/\\/g, "/")
        entryCode += `  ${JSON.stringify(relKey)}: ${value},\n`
      }
      entryCode += `};\n`

      const tempEntryFile = path.join(tmpDir, "entry-source.js")
      fs.writeFileSync(tempEntryFile, entryCode, "utf8")

      const pkgPath = path.join(root, "package.json")
      let externals = ["boronix"]
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"))
        externals = [
          ...externals,
          ...Object.keys(pkg.dependencies ?? {}),
          ...Object.keys(pkg.devDependencies ?? {})
        ]
      }

      await esbuild.build({
        entryPoints: [tempEntryFile],
        outfile: path.join(tmpServer, "entry.js"),
        bundle: true,
        platform: "node",
        format: "esm",
        target: "node18",
        external: externals,
        logLevel: "error"
      })

      try {
        fs.unlinkSync(tempEntryFile)
      } catch {}

      // Make route paths relative in manifest
      const relativeRoutes = routes.map(route => {
        const copy = { ...route }
        if (copy.routeDir) copy.routeDir = path.relative(root, copy.routeDir).split(path.sep).join("/")
        if (copy.pageHtml) copy.pageHtml = path.relative(root, copy.pageHtml).split(path.sep).join("/")
        if (copy.pageModule) copy.pageModule = path.relative(root, copy.pageModule).split(path.sep).join("/")
        if (copy.apiModule) copy.apiModule = path.relative(root, copy.apiModule).split(path.sep).join("/")
        if (copy.actionsModule) copy.actionsModule = path.relative(root, copy.actionsModule).split(path.sep).join("/")
        return copy
      })

      // Write manifest to tmpDir
      const manifest = {
        version: 1,
        frameworkVersion: "0.7.0",
        createdAt: new Date().toISOString(),
        runtime: runtimeName,
        mode: "production",
        output: {
          directory: ".boronix",
          serverEntry: ".boronix/server/entry.js",
          templatesDirectory: ".boronix/templates",
          publicDirectory: ".boronix/public"
        },
        routes: relativeRoutes
      }

      const manifestTmpPath = path.join(tmpDir, "manifest.json")
      fs.writeFileSync(manifestTmpPath, `${JSON.stringify(manifest, null, 2)}\n`)

      // 2. Validate output
      const readManifest = JSON.parse(fs.readFileSync(manifestTmpPath, "utf8"))
      validateBuildManifest(readManifest, runtimeName!, tmpDir)

      // 3. Delete or rotate .boronix
      const bakDir = path.join(root, ".boronix.bak")
      if (fs.existsSync(bakDir)) {
        fs.rmSync(bakDir, { recursive: true, force: true })
      }
      if (fs.existsSync(outputDir)) {
        fs.renameSync(outputDir, bakDir)
      }

      // 4. Rename .boronix.tmp to .boronix
      fs.renameSync(tmpDir, outputDir)

      // Delete the bak directory
      if (fs.existsSync(bakDir)) {
        fs.rmSync(bakDir, { recursive: true, force: true })
      }
    } catch (err: any) {
      // 5. Cleanup .boronix.tmp if failed
      if (fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true, force: true })
      }
      throw new BoronixUserError(`Failed to write build output atomically: ${err.message}`, {
        code: "KQ_BUILD_OUTPUT_WRITE_FAILED",
        cause: err
      })
    }
  })()
}
