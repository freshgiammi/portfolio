import fs from "fs"
import path from "path"

export function loadTsConfigPaths(cwd) {
  try {
    const tsconfigPath = path.join(cwd, "tsconfig.json")
    const tsconfigContent = fs.readFileSync(tsconfigPath, "utf8")
    const jsonContent = tsconfigContent.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "")
    const tsconfig = JSON.parse(jsonContent)

    const baseUrl = tsconfig.compilerOptions?.baseUrl || "."
    const paths = tsconfig.compilerOptions?.paths || {}

    return { baseUrl, paths }
  } catch (error) {
    return { baseUrl: ".", paths: {} }
  }
}

export function resolvePathAlias(importPath, cwd, tsConfigPaths) {
  const { baseUrl, paths } = tsConfigPaths

  for (const [alias, targets] of Object.entries(paths)) {
    const aliasPattern = alias.replace(/\*/g, "(.*)")
    const regex = new RegExp(`^${aliasPattern.replace(/\//g, "\\/")}$`)
    const match = importPath.match(regex)

    if (match) {
      const target = targets[0]
      const resolvedPath = target.replace(/\*/g, match[1] || "")
      return path.join(cwd, baseUrl, resolvedPath)
    }
  }

  return null
}
