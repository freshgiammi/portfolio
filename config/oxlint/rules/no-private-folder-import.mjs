import path from "path"

import { loadTsConfigPaths, resolvePathAlias } from "../utils/tsconfig-resolver.mjs"

export default {
  meta: {
    type: "problem",
    docs: {
      description: "disallow importing from hyphen-prefixed folders outside of their parent path",
      category: "Best Practices",
      recommended: true
    },
    schema: []
  },

  create(context) {
    const cwd = context.cwd
    const tsConfigPaths = loadTsConfigPaths(cwd)

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value
        const currentFilePath = context.getFilename()

        if (!importPath.startsWith(".") && !importPath.startsWith("@/")) {
          return
        }

        const currentDir = path.dirname(currentFilePath)
        let resolvedImportPath

        if (importPath.startsWith(".")) {
          resolvedImportPath = path.resolve(currentDir, importPath)
        } else {
          resolvedImportPath = resolvePathAlias(importPath, cwd, tsConfigPaths)
          if (!resolvedImportPath) {
            return
          }
        }

        const normalizedImportPath = path.normalize(resolvedImportPath)
        const normalizedCurrentPath = path.normalize(currentFilePath)

        const importPathSegments = normalizedImportPath.split(path.sep)
        let hyphenFolderIndex = -1
        let hyphenFolder = null

        for (let i = 0; i < importPathSegments.length; i++) {
          if (importPathSegments[i].startsWith("-")) {
            hyphenFolderIndex = i
            hyphenFolder = importPathSegments[i]
            break
          }
        }

        if (hyphenFolderIndex === -1) {
          return
        }

        const parentPath = importPathSegments.slice(0, hyphenFolderIndex).join(path.sep)

        const isWithinParentPath =
          normalizedCurrentPath.startsWith(parentPath + path.sep) || normalizedCurrentPath === parentPath

        if (!isWithinParentPath) {
          const parentFolderName = importPathSegments[hyphenFolderIndex - 1] || "module"

          context.report({
            node,
            message: `Importing from private folder "${hyphenFolder}" is not allowed outside of "${parentFolderName}". Hyphen-prefixed folders are internal to their parent module.`
          })
        }
      }
    }
  }
}
