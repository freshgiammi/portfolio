import { Image as UnpicImage } from "@unpic/react"
import { cx } from "cva"
import type { ComponentProps, ReactNode } from "react"
import { useState } from "react"

import { Icon } from "@/components/primitives/icons"
import { Skeleton } from "@/components/primitives/skeleton"
import { Typography } from "@/components/primitives/typography"

import styles from "./index.module.scss"

// `width` and `height` are omitted rather than forwarded: the box is the caller's to size, through
// `className` on the frame. A size on the image itself is either ignored or a contradiction.
type ImageProps = Omit<ComponentProps<"img">, "src" | "alt" | "width" | "height"> & {
  /** Optional, because "there is no image" is a state this renders rather than a caller's problem. */
  src?: string
  alt: string
  /** Shown in place of the image when there is none. Defaults to a placeholder icon. */
  fallback?: ReactNode
  /** Off for an image in a box that is not reserved, where a placeholder has nothing to fill. */
  skeleton?: boolean
  /**
   * `fill` for a box the caller reserved and the picture is cropped into; `intrinsic` when the
   * picture's own proportions are what decide the height.
   */
  layout?: "fill" | "intrinsic"
}

/**
 * `unknown` is the state before anything has been measured, and the one the server renders in: it
 * shows the image and no skeleton. Everything else is decided in the browser, where the answer is
 * knowable.
 */
type Status = "unknown" | "loading" | "loaded" | "missing"

/**
 * An image that accounts for not being there: a skeleton while it loads, the image once it lands,
 * a placeholder if it never does. The box holds its size throughout and never reflows.
 *
 * `className` lands on the box, not the `img` — the box is what a caller lays out and crops via
 * `--image-fit`. Loading itself is `@unpic/react`; this adds the states and the box around it.
 *
 * The server always renders "unknown" (no skeleton): it can't know what the browser has cached, and
 * guessing "loading" would paint a skeleton over an already-cached image until hydration corrects it.
 */
export function Image({ src, alt, fallback, skeleton = true, layout = "fill", className, ...rest }: ImageProps) {
  const [status, setStatus] = useState<Status>(src ? "unknown" : "missing")

  return (
    <span className={cx(styles.Image, className)} data-layout={layout} data-status={status}>
      {/* Skeleton clones its child rather than overlaying it; the extra span is that child, leaving the image below its own ref. */}
      <Skeleton isLoading={Boolean(skeleton && src && status === "loading")}>
        <span className={styles.Image__frame}>
          {src && status !== "missing" && (
            <UnpicImage
              src={src}
              alt={alt}
              // The only layout that doesn't also pin its own size; height comes from the stylesheet.
              layout="fullWidth"
              loading="lazy"
              // Some preview hosts 403 a referrer that isn't their own.
              referrerPolicy="no-referrer"
              {...rest}
              className={styles.Image__img}
              onLoad={() => setStatus("loaded")}
              onError={() => setStatus("missing")}
              // `complete` catches a cached image whose `onLoad` will never fire; `naturalWidth`
              // tells decoded from failed.
              ref={node => {
                if (!node) return
                if (!node.complete) setStatus("loading")
                else setStatus(node.naturalWidth > 0 ? "loaded" : "missing")
              }}
            />
          )}
        </span>
      </Skeleton>

      {/* Wrapped so the box's centring rule (stretch to fill) applies; a bare icon at fixed size won't stretch. */}
      {status === "missing" &&
        (fallback ?? (
          <span>
            <Icon.ImageBrokenIcon size={20} />
            {alt && (
              <Typography
                size="xxx-small"
                family="mono"
                truncate={2}
                render={<span />}
                className={styles.Image__fallbackText}>
                {alt}
              </Typography>
            )}
          </span>
        ))}
    </span>
  )
}

export declare namespace Image {
  export type Props = ImageProps
}
