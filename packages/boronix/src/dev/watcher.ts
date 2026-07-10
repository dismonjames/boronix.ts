import chokidar from "chokidar"
import path from "node:path"
import { isIgnoredPath } from "./change-classifier"
import type { DevFileChangeEvent, DevFileChange } from "./types"

export type WatcherOptions = {
  root: string
  watchPaths: string[]
  debounceMs?: number | undefined
  onChange: (changes: DevFileChange[]) => void
  debug?: boolean | undefined
}

export type FileWatcher = {
  close(): void
}

export function createFileWatcher(options: WatcherOptions): FileWatcher {
  const debounceMs = options.debounceMs ?? 50
  const root = options.root
  let pending = new Map<string, { event: DevFileChangeEvent; timestamp: number }>()
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let closed = false

  function scheduleFlush(): void {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      flush()
    }, debounceMs)
  }

  function flush(): void {
    debounceTimer = null
    if (closed) return
    if (pending.size === 0) return

    const changes: DevFileChange[] = []
    const events = [...pending.entries()]
    pending.clear()

    for (const [absolutePath, evt] of events) {
      const relativePath = path.relative(root, absolutePath).split(path.sep).join("/")
      if (isIgnoredPath(relativePath)) continue

      changes.push({
        event: evt.event,
        kind: "unknown",
        absolutePath,
        relativePath,
        detectedAt: evt.timestamp
      })
    }

    if (changes.length > 0) {
      if (options.debug) {
        for (const c of changes) {
          console.log(`watch ${c.event} ${c.relativePath}`)
        }
      }
      try {
        options.onChange(changes)
      } catch {}
    }
  }

  function handleEvent(eventName: DevFileChangeEvent, absolutePath: string): void {
    if (closed) return
    const resolvedPath = path.resolve(absolutePath)
    const relativePath = path.relative(root, resolvedPath).split(path.sep).join("/")
    if (isIgnoredPath(relativePath)) return

    pending.set(resolvedPath, { event: eventName, timestamp: Date.now() })
    scheduleFlush()
  }

  const watcher = chokidar.watch(options.watchPaths, {
    ignored: (p: string) => {
      const rel = path.relative(root, p).split(path.sep).join("/")
      if (rel === "") return false
      return isIgnoredPath(rel)
    },
    ignoreInitial: true,
    persistent: true
  })

  watcher.on("add", (p: string) => handleEvent("create", p))
  watcher.on("change", (p: string) => handleEvent("modify", p))
  watcher.on("unlink", (p: string) => handleEvent("remove", p))
  watcher.on("addDir", (p: string) => handleEvent("create", p))
  watcher.on("unlinkDir", (p: string) => handleEvent("remove", p))
  watcher.on("error", () => {})

  return {
    close(): void {
      closed = true
      if (debounceTimer) {
        clearTimeout(debounceTimer)
        debounceTimer = null
      }
      pending.clear()
      void watcher.close()
    }
  }
}
