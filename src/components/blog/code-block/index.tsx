import type { ComponentProps } from "react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/primitives/button"
import { Icon } from "@/components/primitives/icons"
import { Scrollable } from "@/components/primitives/scrollable"
import { Tag } from "@/components/primitives/tag"
import { Tooltip } from "@/components/primitives/tooltip"
import { Typography } from "@/components/primitives/typography"

import styles from "./index.module.scss"

/** Past this many pixels a code block scrolls internally instead of growing the page under it. */
const MAX_HEIGHT = 480

type CodeBlockProps = ComponentProps<"pre"> & {
  /** A file name shown on the left of a header strip above the code. Omit for no header. */
  filename?: string
  /** A language label shown on the right of that header as a pill. */
  language?: string
}

export function CodeBlock({ className, children, filename, language, ...rest }: CodeBlockProps) {
  const [wrapped, setWrapped] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timeout.current), [])

  const copyCode = async () => {
    await navigator.clipboard.writeText(ref.current?.querySelector("code")?.textContent ?? "").catch()
    setCopied(true)
    clearTimeout(timeout.current)
    timeout.current = setTimeout(() => setCopied(false), 2000)
  }

  const header = filename ?? language

  return (
    <div className={styles.CodeBlock} data-wrapped={wrapped || undefined} data-header={header || undefined} ref={ref}>
      {header && (
        <div className={styles.CodeBlock__header}>
          {filename && (
            <Typography size="x-small" family="mono" className={styles.CodeBlock__filename}>
              {filename}
            </Typography>
          )}
          {language && <Tag size="small">{language}</Tag>}
        </div>
      )}
      <div className={styles.CodeBlock__body}>
        {/* Shared by both actions so the second tooltip opens without re-waiting its delay. */}
        <Tooltip.Provider delay={0}>
          <div className={styles.CodeBlock__actions}>
            <Tooltip.Root>
              <Tooltip.Trigger
                render={
                  <Button
                    variant="secondary"
                    behaviour={wrapped ? "default" : "neutral"}
                    size="small"
                    icon={wrapped ? <Icon.ArrowsInLineVerticalIcon /> : <Icon.ArrowsOutLineVerticalIcon />}
                    aria-pressed={wrapped}
                    onClick={() => setWrapped(value => !value)}
                    aria-label={wrapped ? "Unwrap lines" : "Wrap long lines"}
                  />
                }
              />
              <Tooltip.Portal>
                <Tooltip.Positioner side="bottom">
                  <Tooltip.Popup>{wrapped ? "Unwrap lines" : "Wrap long lines"}</Tooltip.Popup>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            </Tooltip.Root>

            <Tooltip.Root>
              <Tooltip.Trigger
                render={
                  <Button
                    variant="secondary"
                    behaviour={copied ? "default" : "neutral"}
                    size="small"
                    icon={copied ? <Icon.CheckIcon /> : <Icon.CopyIcon />}
                    aria-pressed={copied}
                    onClick={copyCode}
                    aria-label={copied ? "Copied" : "Copy code"}
                  />
                }
              />
              <Tooltip.Portal>
                <Tooltip.Positioner side="bottom">
                  <Tooltip.Popup>{copied ? "Copied" : "Copy code"}</Tooltip.Popup>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            </Tooltip.Root>
          </div>
        </Tooltip.Provider>
        <pre className={className} {...rest}>
          <Scrollable scrollbar="hover" maxHeight={MAX_HEIGHT}>
            {children}
          </Scrollable>
        </pre>
      </div>
    </div>
  )
}

export declare namespace CodeBlock {
  export type Props = CodeBlockProps
}
