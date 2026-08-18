import type { Meta, StoryObj } from "@storybook/tanstack-react"

import { CodeBlock } from "./index"

const meta = {
  title: "Blog/CodeBlock",
  component: CodeBlock
} satisfies Meta<typeof CodeBlock>

export default meta

const CODE = `function greet(name: string) {
  const message = \`Hello, \${name}! Welcome aboard.\`
  console.log(message)
  return message
}

greet("Ada")`

/** The wrap toggle flips `white-space` on long lines; the copy button writes to the clipboard. */
export const WithActions: StoryObj<CodeBlock.Props> = {
  args: {
    children: <code>{CODE}</code>
  },
  render: args => (
    <div style={{ maxWidth: "34rem", padding: "1rem" }}>
      <CodeBlock {...args} />
    </div>
  )
}

/** Long lines overflow horizontally until the wrap toggle is pressed. */
export const LongLines: StoryObj<CodeBlock.Props> = {
  parameters: {
    docs: { description: { story: "Toggle wrap to see the longest line reflow instead of scrolling." } }
  },
  render: () => (
    <div style={{ maxWidth: "30rem", padding: "1rem" }}>
      <CodeBlock>
        <code>{`const veryLongConfigurationKey = fetch("https://api.example.com/v2/configurations?section=rendering&format=json").then(response => response.json())`}</code>
      </CodeBlock>
    </div>
  )
}

/** A header strip: file name on the left, language pill on the right. */
export const WithHeader: StoryObj<CodeBlock.Props> = {
  args: {
    filename: "useParticles.ts",
    language: "ts",
    children: <code>{CODE}</code>
  },
  render: args => (
    <div style={{ maxWidth: "34rem", padding: "1rem" }}>
      <CodeBlock {...args} />
    </div>
  )
}

/** A header with only a file name still renders; the language slot is simply absent. */
export const WithFilenameOnly: StoryObj<CodeBlock.Props> = {
  args: {
    filename: "Dockerfile",
    children: <code>{`FROM node:20-alpine\nRUN pnpm install`}</code>
  },
  render: args => (
    <div style={{ maxWidth: "34rem", padding: "1rem" }}>
      <CodeBlock {...args} />
    </div>
  )
}

/** A header with only a language pill still renders; the file name slot is simply absent. */
export const WithLanguageOnly: StoryObj<CodeBlock.Props> = {
  args: {
    language: "bash",
    children: <code>{`pnpm storybook`}</code>
  },
  render: args => (
    <div style={{ maxWidth: "34rem", padding: "1rem" }}>
      <CodeBlock {...args} />
    </div>
  )
}

/**
 * In MDX, the header is opt-in per fenced block via meta directives — no prop needed:
 *
 * ````md
 * ```ts title="useParticles.ts"
 * // highlighted body
 * ```
 * ````
 *
 * `title="…"` fills the file name; the language pill is taken from the fence info string
 * (`ts` above) unless overridden with `lang="…"`. Blocks without `title` render exactly as
 * before. Verified through the same `pre` → `CodeBlock` override the posts use.
 */
export const FromMdxMeta: StoryObj<CodeBlock.Props> = {
  parameters: {
    docs: {
      description: {
        story:
          "Mirrors the MDX path: Shiki writes `title`/`lang` meta onto the inner `<code>` as `data-*`, which the `pre` override maps to `filename`/`language`."
      }
    }
  },
  render: () => (
    <div style={{ maxWidth: "34rem", padding: "1rem" }}>
      <CodeBlock filename="useParticles.ts" language="ts">
        <code className="shiki">{CODE}</code>
      </CodeBlock>
    </div>
  )
}
