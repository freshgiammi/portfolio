import { execSync } from "node:child_process"
import { statSync } from "node:fs"

import { defineCollection, defineConfig } from "@content-collections/core"
import { object, optional, string } from "valibot"

import { renderMarkdown } from "./src/utils/markdown"

interface TransformData {
  content: string
  title: string
  published: string
  updated?: string
  description?: string
  image?: string
  _meta: {
    filePath: string
    path: string
  }
}

function getLastModified(filePath: string): string | undefined {
  try {
    const out = execSync(`git log -1 --format=%cI -- "${filePath}"`, {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim()
    if (out) return out
  } catch {
    /* git may not be available */
  }

  try {
    const mtime = statSync(filePath).mtime
    return mtime.toISOString()
  } catch {
    /* file may not exist */
  }

  return undefined
}

const posts = defineCollection({
  name: "posts",
  directory: "./src/blog",
  include: "*.md",
  schema: object({
    title: string(),
    published: string(),
    updated: optional(string()),
    description: optional(string()),
    image: optional(string()),
    content: string(),
  }),
  transform: async (data: TransformData) => {
    const rendered = await renderMarkdown(data.content)
    const updated = data.updated ?? getLastModified(data._meta.filePath)
    const text = data.content
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const readingTime = Math.max(1, Math.round(words / 200))
    return {
      slug: data._meta.path,
      title: data.title,
      published: data.published,
      updated,
      description: data.description,
      image: data.image,
      html: rendered.markup,
      headings: rendered.headings,
      words,
      readingTime,
    }
  },
})

export default defineConfig({
  content: [posts],
})
