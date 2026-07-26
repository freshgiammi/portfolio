import { cx } from "cva"
import { useEffect, useRef, useState } from "react"

import { Icon } from "@/components/ui/icons"
import { Typography } from "@/components/ui/typography"

import styles from "./index.module.scss"

type ShareProps = {
  /** Absolute url, so the copied link and the share intents point at the live page. */
  url: string
  title: string
  className?: string
}

export function Share({ url, title, className }: ShareProps) {
  const [copied, setCopied] = useState(false)
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timeout.current), [])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      return
    }
    setCopied(true)
    clearTimeout(timeout.current)
    timeout.current = setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cx(styles.Share, className)}>
      <Typography size="xx-small" weight="semibold" render={<span />} className={styles.Share__label}>
        Share
      </Typography>

      <div className={styles.Share__actions}>
        <button
          type="button"
          onClick={copyLink}
          data-done={copied || undefined}
          className={styles.Share__action}
          aria-label={copied ? "Link copied" : "Copy link"}
          title={copied ? "Link copied" : "Copy link"}>
          {copied ? <Icon.CheckIcon size={16} /> : <Icon.LinkIcon size={16} />}
        </button>

        <ShareLink href={`https://x.com/intent/post?${intentParams({ url, text: title })}`} label="Share on X">
          <Icon.XLogoIcon size={16} />
        </ShareLink>

        <ShareLink
          href={`https://www.linkedin.com/sharing/share-offsite/?${intentParams({ url })}`}
          label="Share on LinkedIn">
          <Icon.LinkedinLogoIcon size={16} />
        </ShareLink>

        <ShareLink href={`mailto:?${intentParams({ subject: title, body: url })}`} label="Share by email">
          <Icon.EnvelopeSimpleIcon size={16} />
        </ShareLink>
      </div>
    </div>
  )
}

export declare namespace Share {
  export type Props = ShareProps
}

/*
 * ==========================================
 * Internal utilities
 * ==========================================
 */

function intentParams(params: Record<string, string>) {
  return new URLSearchParams(params).toString()
}

/*
 * ==========================================
 * Internal components
 * ==========================================
 */

type ShareLinkProps = {
  href: string
  label: string
  children: React.ReactNode
}

function ShareLink({ href, label, children }: ShareLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={styles.Share__action}
      aria-label={label}
      title={label}>
      {children}
    </a>
  )
}
