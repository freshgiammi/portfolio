import { createFileRoute } from "@tanstack/react-router"
import { allPosts } from "content-collections"

import { getSiteUrl } from "@/utils/seo"

type FeedPost = { slug: string; title: string; published: string; description?: string }

function escapeXml(value: string) {
  const replacements: Record<string, string> = {
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;"
  }
  return value.replace(/[<>&'"]/g, character => replacements[character]!)
}

export const Route = createFileRoute("/feed.xml")({
  server: {
    handlers: {
      GET: () => {
        const site = getSiteUrl()
        const posts = (allPosts as Array<FeedPost>)
          .sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime())
          .map(post => {
            const url = new URL(`/blog/${post.slug}`, site || "https://freshgiammi.dev").toString()
            return [
              "    <item>",
              `      <title>${escapeXml(post.title)}</title>`,
              `      <link>${escapeXml(url)}</link>`,
              `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
              `      <pubDate>${new Date(post.published).toUTCString()}</pubDate>`,
              post.description ? `      <description>${escapeXml(post.description)}</description>` : undefined,
              "    </item>"
            ]
              .filter(line => line !== undefined)
              .join("\n")
          })
          .join("\n")

        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
          "  <channel>",
          "    <title>freshgiammi</title>",
          `    <link>${escapeXml(site || "https://freshgiammi.dev")}/blog</link>`,
          "    <description>Writeups of whatever I've been building and figuring out lately.</description>",
          '    <atom:link href="' +
            escapeXml(new URL("/feed.xml", site || "https://freshgiammi.dev").toString()) +
            '" rel="self" type="application/rss+xml" />',
          posts,
          "  </channel>",
          "</rss>"
        ].join("\n")

        return new Response(xml, {
          headers: { "content-type": "application/rss+xml; charset=utf-8" }
        })
      }
    }
  }
})
