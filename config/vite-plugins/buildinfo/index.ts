import fs from "node:fs"
import path from "node:path"
import process from "node:process"

import { createLogger, type Plugin } from "vite"

import { getRepoInfo } from "./git"

const modules = {
  BuildInfo: `virtual:buildinfo`,
  Config: `virtual:config`
}

const logger = createLogger("info", {
  prefix: "[buildinfo]"
})

export function buildInfo({ mode }: { mode: "development" | "production" }): Plugin {
  let now: Date

  const root = path.resolve(process.cwd())

  return {
    name: "buildinfo",
    enforce: "pre",
    buildStart() {
      logger.info(`🚀 Preparing buildinfo modules...`, { timestamp: true })
      // Client and SSR builds run as separate Vite "environment" passes, each triggering
      // buildStart independently. Without this, they'd each capture their own `new Date()`,
      // embedding two different timestamps in the client vs server bundles and causing a
      // hydration text mismatch. Both passes share the same process, so cache it there.
      const cached = process.env.__BUILD_TIME
      if (cached) {
        now = new Date(Number(cached))
      } else {
        now = new Date()
        process.env.__BUILD_TIME = String(now.getTime())
      }
    },
    resolveId(id) {
      if (Object.values(modules).includes(id)) {
        return `\0${id}`
      }
      return null
    },
    async load(id) {
      if (!id.startsWith("\0")) return null

      const moduleName = id.slice(1)

      if (moduleName === modules.BuildInfo) {
        const gitInfo = await extrapolateGitInfo(root)
        const pkgInfo = extrapolatePackageInfo(root)

        // Concatenate the modules
        return `${gitInfo}\n${pkgInfo}\nexport const time = new Date(${now.getTime()})`
      }

      if (moduleName === modules.Config) {
        return `export const mode = ${JSON.stringify(mode)}`
      }

      return null
    },
    handleHotUpdate({ file, server }) {
      // HMR: package.json
      if (file === normalizePath(path.resolve(root, "package.json"))) {
        const module = server.moduleGraph.getModuleById(`\0${modules.BuildInfo}`)
        if (module) {
          // Invalidate module for reloading
          server.moduleGraph.invalidateModule(module)

          // Reload client
          server.ws.send({
            type: "full-reload"
          })
        }
      }
    }
  }
}

function normalizePath(f: string) {
  return f.split(path.win32.sep).join(path.posix.sep)
}

/**
 * Generate the git info module
 */
async function extrapolateGitInfo(root: string) {
  const info = await getRepoInfo(root)

  if (!info) {
    logger.warn(`🚀 No git repository found. Skipping git info...`, { timestamp: true })
    throw new Error("No git repository found")
  }

  const keys = [...new Set(Object.keys(info))] as Array<keyof typeof info>
  const gen = (key: keyof typeof info) => `export const ${key} = ${JSON.stringify(info[key])}`

  return [``, ...keys.map(key => gen(key))].join("\n")
}

/**
 * Generate the package info module
 */
function extrapolatePackageInfo(root: string) {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf-8")) as {
    name?: string
    version?: string
  }
  const keys = new Set(["name", "version"] as const)
  const resolved: Record<string, string> = {
    name: "",
    version: "0.0.0",
    ...pkg
  }
  const entries = [...keys].map(key => [key, resolved[key]] as const)
  return entries.map(([key, value]) => `export const ${key} = ${JSON.stringify(value, null, 2)};`).join("\n")
}
