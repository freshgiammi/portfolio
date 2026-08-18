import { readFileSync } from "node:fs"
import path from "node:path"

import type { Code, Root } from "mdast"
import { visit } from "unist-util-visit"
import type { VFile } from "vfile"

/** `file="../relative/path.ts"` anywhere in a fenced code block's meta string. */
const FILE_META = /(?:^|\s)file="([^"]+)"/

/**
 * A fenced code block whose meta references a real file on disk shows that file's own content
 * instead of whatever's written between the fences:
 *
 * ````
 * ```js file="../../../config/oxlint/rules/no-private-folder-import.mjs"
 * ```
 * ````
 *
 * so the post always shows the current file rather than a pasted copy that can drift from it.
 * Resolved relative to the document doing the embedding, and run before the block reaches Shiki, so
 * highlighting sees the real content rather than an empty body.
 */
export function remarkFileEmbed() {
  return (tree: Root, file: VFile) => {
    visit(tree, "code", (node: Code) => {
      const match = FILE_META.exec(node.meta ?? "")
      if (!match) return

      const referencedPath = path.resolve(path.dirname(file.path), match[1]!)
      Object.assign(node, { value: readFileSync(referencedPath, "utf8").replace(/\n$/, "") })
    })
  }
}
