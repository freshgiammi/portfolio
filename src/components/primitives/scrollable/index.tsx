import { ScrollArea } from "@base-ui/react/scroll-area"
import { cx } from "cva"
import type { ComponentProps, CSSProperties, Ref, RefObject } from "react"
import { useLayoutEffect, useRef } from "react"

import { useMergeRefs } from "@/hooks/useMergeRefs"

import styles from "./index.module.scss"

/**
 * Overflow smaller than this is treated as none. `scrollHeight` and `clientHeight` are rounded to
 * integers from fractional layout, so a box that fits exactly can still report a pixel or two of
 * overflow — enough to scroll past where there is nothing left to reach.
 */
const OVERFLOW_EPSILON = 4

/** Where along an axis the content starts out. Named for the axis, not for an edge, so the same
    word means the same thing whichever of the two it is given to. */
type ScrollAnchor = "start" | "center" | "end"

/** One axis of the box: how far it can scroll, and, when scrolling to a node, where that node sits
    along it and how much of the view it leaves over. */
type Axis = { distance: number; offset?: number; slack?: number }

/**
 * Where to leave an axis so its anchor is satisfied. Without a node the anchor is about the content
 * as a whole and lands on an edge; with one it is about where in the box that node comes to rest,
 * which is the same three words meaning the same three placements.
 */
const anchorOffset = (anchor: ScrollAnchor, axis: Axis): number => {
  const { distance, offset, slack } = axis

  if (offset === undefined || slack === undefined) {
    if (anchor === "end") return distance
    return anchor === "center" ? distance / 2 : 0
  }

  // How much of the leftover view sits before the node: none of it at the start, all of it at the
  // end. A node near either edge cannot be centred, and the box stops rather than pretend otherwise.
  const before = anchorOffset(anchor, { distance: slack })
  return Math.min(Math.max(offset - before, 0), distance)
}

/*
 * ====================================================================================
 * Scrollable
 * ====================================================================================
 */

type ScrollableProps = ComponentProps<"div"> & {
  /**
   * Maximum height of the scrollable container. Left off, the container is unbounded and never
   * scrolls vertically, so the vertical fades never appear.
   */
  maxHeight?: number | "inherit"
  /**
   * Maximum width of the scrollable container. Left off, the container takes the width it is given,
   * which is what a horizontal rail wants: the content overflows, not the box.
   */
  maxWidth?: number | "inherit"
  /**
   * Maximum strength of the edge fades (between 0 and 1), as a fraction of the fade's reach.
   * @default 0.7
   */
  maxFade?: number
  /**
   * Where each axis sits when it first has something to scroll: `{ x: "end" }` for a rail whose
   * newest entry is its last, `{ y: "end" }` for a log, `{ x: "center" }` for content built out
   * from the middle. An axis that is left out keeps the browser's own position.
   *
   * Given a `target`, the anchors are about that node rather than the content as a whole:
   * `{ target: todayRef, x: "center" }` opens with that cell in the middle of the rail. The node
   * has to be inside this container; anything else scrolls to wherever it happens to overlap.
   *
   * Applied once per axis, the first time that axis overflows, so it never takes a scroll position
   * back off the reader once they have moved it. Hand-measured rather than handed to
   * `scrollIntoView`, which walks up the tree and would scroll the page to this component as well.
   */
  initialScroll?: { x?: ScrollAnchor; y?: ScrollAnchor; target?: RefObject<HTMLElement | null> }
  /**
   * Callback fired when the inner scrollable content is scrolled.
   */
  onInnerScroll?: (e: React.UIEvent<HTMLDivElement>) => void
  /** Additional class name for the inner content container. */
  contentClassName?: string
  /**
   * The element that actually scrolls, which is the inner one rather than the box `ref` lands on.
   * For a caller that has to read or drive the scroll itself, a virtualizer above all.
   */
  contentRef?: Ref<HTMLDivElement>
  /**
   * A thin draggable scrollbar for whichever axes overflow. The browser's own is always hidden,
   * since it would paint inside the same box the edge fade masks and a mask has no way to exclude
   * just the scrollbar from its effect.
   *
   * `"invisible"` draws no affordance at all. `"hover"` draws one that's transparent until the
   * container is hovered or actively scrolling. `"always"` keeps it dimly visible throughout.
   * @default "invisible"
   */
  scrollbar?: "invisible" | "hover" | "always"
}

/**
 * Scrollable container that fades its content into whatever's behind it at whichever edges still
 * have more to scroll. Automatically detects and handles vertical, horizontal, or 2D scrolling.
 *
 * @example
 * ```tsx
 * <Scrollable maxHeight={500} maxFade={0.7}>
 *   <div>scrollable content</div>
 * </Scrollable>
 * ```
 */
export function Scrollable({
  className,
  style,
  maxHeight,
  maxWidth,
  maxFade = 0.7,
  children,
  initialScroll,
  onInnerScroll,
  contentClassName,
  contentRef: contentRefProp,
  scrollbar = "invisible",
  ref,
  ...rest
}: ScrollableProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const mergedViewportRefs = useMergeRefs([viewportRef, contentRefProp])
  const pinned = useRef({ x: false, y: false })

  // The edge fade (see the stylesheet) reads Base UI's own `--scroll-area-overflow-*` variables,
  // which it only sets once its resize observer has actually measured this box — a beat after this
  // first paints with nothing yet to go on. Revealing the viewport (rather than animating the mask's
  // own inputs) only once that write has landed is what turns "wrong fade, then corrected" into
  // "nothing, then the real thing": a `MutationObserver` is the only way to know that moment
  // happened at all, since Base UI exposes no event or callback for it.
  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return undefined

    const reveal = () => {
      viewport.dataset.measured = "true"
    }

    // Already true on a later mount in the same session (this component remounting, not a fresh page
    // load) — Base UI's own effect can beat this one to the first measurement.
    if (viewport.style.cssText.includes("--scroll-area-overflow")) {
      reveal()
      return undefined
    }

    const observer = new MutationObserver(reveal)
    observer.observe(viewport, { attributes: true, attributeFilter: ["style"] })
    return () => observer.disconnect()
  }, [])

  // Read off the prop rather than depended on whole: `initialScroll` is an object literal at most
  // call sites, and a fresh one every render would re-run the effect below on every render.
  const initialX = initialScroll?.x
  const initialY = initialScroll?.y
  const initialTarget = initialScroll?.target

  // Initialize scroll position once the content has overflow to anchor against. Watched via a
  // `ResizeObserver` on the viewport rather than a `children` dependency, since content can grow
  // (an image loading in, a virtualizer settling) without `children`'s own identity ever changing.
  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return undefined

    // Each axis waits for its own overflow: a rail can be scrollable sideways for a while before it is
    // ever scrollable down, and the anchor for one should not be spent on the other.
    const pinInitialScroll = () => {
      // Measured against the scrolling box rather than the viewport, and with the current scroll
      // added back, so what comes out is the node's position in the content itself.
      const node = initialTarget?.current
      const box = node ? viewport.getBoundingClientRect() : undefined
      const rect = node && box ? node.getBoundingClientRect() : undefined

      const distanceX = viewport.scrollWidth - viewport.clientWidth
      if (initialX && !pinned.current.x && distanceX > OVERFLOW_EPSILON) {
        viewport.scrollLeft = anchorOffset(initialX, {
          distance: distanceX,
          ...(rect &&
            box && { offset: rect.left - box.left + viewport.scrollLeft, slack: viewport.clientWidth - rect.width })
        })
        pinned.current.x = true
      }

      const distanceY = viewport.scrollHeight - viewport.clientHeight
      if (initialY && !pinned.current.y && distanceY > OVERFLOW_EPSILON) {
        viewport.scrollTop = anchorOffset(initialY, {
          distance: distanceY,
          ...(rect &&
            box && {
              offset: rect.top - box.top + viewport.scrollTop,
              slack: viewport.clientHeight - rect.height
            })
        })
        pinned.current.y = true
      }
    }

    // Layout has to settle before scrollWidth/scrollHeight reflect real overflow.
    const frame = requestAnimationFrame(pinInitialScroll)

    const observer = new ResizeObserver(pinInitialScroll)
    observer.observe(viewport)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [initialTarget, initialX, initialY])

  const sizeStyles = {
    ...(maxHeight !== undefined && {
      maxHeight: maxHeight === "inherit" ? "inherit" : `${maxHeight}px`
    }),
    ...(maxWidth !== undefined && {
      maxWidth: maxWidth === "inherit" ? "inherit" : `${maxWidth}px`
    })
  }

  return (
    <ScrollArea.Root
      className={cx(styles.Scrollable, className)}
      style={{ ...sizeStyles, ...style }}
      data-scrollbar={scrollbar}
      {...rest}
      ref={ref}>
      <ScrollArea.Viewport
        className={styles["Scrollable-viewport"]}
        style={{ "--scrollable-max-fade": maxFade } as CSSProperties}
        onScroll={onInnerScroll}
        ref={mergedViewportRefs}>
        <ScrollArea.Content className={contentClassName}>{children}</ScrollArea.Content>
      </ScrollArea.Viewport>
      {/* Both siblings of the viewport rather than nested inside it: Base UI's own layout keeps the
          scrollbar out of the same box the edge fade masks, so the thumb it draws never fades along
          with the content the way a native scrollbar painted inside that box would. */}
      {scrollbar !== "invisible" && (
        <>
          <ScrollArea.Scrollbar orientation="vertical" className={styles["Scrollable-scrollbar"]}>
            <ScrollArea.Thumb className={styles["Scrollable-thumb"]} />
          </ScrollArea.Scrollbar>
          <ScrollArea.Scrollbar orientation="horizontal" className={styles["Scrollable-scrollbar"]}>
            <ScrollArea.Thumb className={styles["Scrollable-thumb"]} />
          </ScrollArea.Scrollbar>
        </>
      )}
    </ScrollArea.Root>
  )
}

export declare namespace Scrollable {
  type Props = ScrollableProps
}
