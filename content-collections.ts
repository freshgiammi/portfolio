import { execSync } from "node:child_process"
import { statSync } from "node:fs"

import type { CollectionContext, Meta } from "@content-collections/core"
import { defineCollection, defineConfig } from "@content-collections/core"
import { array, boolean, object, optional, string } from "valibot"

import { extractHeadings } from "./src/utils/markdown"

interface TransformData {
  content: string
  title: string
  published: string
  updated?: string
  description?: string
  image?: string
  draft?: boolean
  _meta: Meta
}

interface ThoughtTransformData {
  content: string
  published: string
  title: string
  tags?: Array<string>
  draft?: boolean
  _meta: Meta
}

/** Strips the handful of markdown constructs short-form thoughts actually use, for excerpts/SEO. */
function toPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[*_~#>]+/g, "")
    .replace(/\r?\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/** A draft only builds in dev, where it's still being read and edited; it never reaches a build. */
const IS_DEV = process.env.NODE_ENV === "development"

function getLastModified(filePath: string): string | undefined {
  try {
    const out = execSync(`git log -1 --format=%cI -- "${filePath}"`, {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"]
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

const POSTS_DIRECTORY = "src/content/posts"
const THOUGHTS_DIRECTORY = "src/content/thoughts"

const posts = defineCollection({
  name: "posts",
  directory: `./${POSTS_DIRECTORY}`,
  include: "*.mdx",
  schema: object({
    title: string(),
    published: string(),
    updated: optional(string()),
    description: optional(string()),
    image: optional(string()),
    draft: optional(boolean()),
    content: string()
  }),
  transform: async (data: TransformData, { skip }: CollectionContext<TransformData>) => {
    if (data.draft && !IS_DEV) return skip("draft")

    const updated = data.updated ?? getLastModified(data._meta.filePath)
    const text = data.content
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const readingTime = Math.max(1, Math.round(words / 200))
    const headings = await extractHeadings(data.content)

    return {
      slug: data._meta.path,
      title: data.title,
      published: data.published,
      updated,
      description: data.description,
      image: data.image,
      words,
      readingTime,
      headings
    }
  }
})

const thoughts = defineCollection({
  name: "thoughts",
  directory: `./${THOUGHTS_DIRECTORY}`,
  include: "*.mdx",
  schema: object({
    published: string(),
    title: string(),
    tags: optional(array(string())),
    draft: optional(boolean()),
    content: string()
  }),
  transform: (data: ThoughtTransformData, { skip }: CollectionContext<ThoughtTransformData>) => {
    if (data.draft && !IS_DEV) return skip("draft")

    return {
      slug: data._meta.path,
      published: data.published,
      title: data.title,
      tags: data.tags ?? [],
      excerpt: toPlainText(data.content)
    }
  }
})

export default defineConfig({
  content: [posts, thoughts]
})
