import { mergeProps } from "@base-ui/react"
import type { ComponentProps, ReactNode } from "react"
import { cloneElement, isValidElement, useCallback, useMemo, useRef } from "react"

import { ensureSpan } from "./ensureSpan"
import styles from "./index.module.scss"

/*
 * ====================================================================================
 * Skeleton
 * ====================================================================================
 */

// No element of its own to forward to: the rest is merged into the child it clones, which is the
// only DOM this renders.
type SkeletonProps = ComponentProps<"div"> & {
  isLoading?: boolean
}

/** Only what this reads off a child, which is whether the child is a lone run of text. */
type TextChild = { children?: ReactNode }

/**
 * A skeleton that wraps an element and shows a loading state by placing a skeleton over the element.
 *
 * Implemented from a demo by Devon Govett, and it keeps the argument with it: don't build fake boxes
 * at all, cover the real components. A skeleton made of separate grey rectangles is a second layout
 * to maintain, and it drifts from the real one the moment either changes.
 *
 * The child has to be able to receive what is handed to it. Covering works by cloning it with a
 * class, a `data-` attribute and a ref, so a component that accepts only some of those is covered
 * only that far — one that drops the ref renders the fill but never animates, since the sweep is
 * started on the element itself. A host element always works; a component has to forward its props.
 *
 * @see https://x.com/devongovett/status/2040470520878313570
 */
export function Skeleton({ children, isLoading = true, ...rest }: SkeletonProps) {
  const needsDirectAccess = useMemo(
    // `isValidElement` alone leaves `props` as `unknown`, so the shape being read has to be named.
    () =>
      (isValidElement<TextChild>(children) && typeof children.props.children === "string") ||
      typeof children === "string",
    [children]
  )

  /** Animation reference. */
  const animationRef = useRef<Animation | null>(null)

  /**
   * Started from the ref rather than an effect, so the animation exists by the time the element is
   * first painted. The ref is written and read only here, never during render.
   */
  const animate = useCallback(
    (element: HTMLElement | null) => {
      if (
        isLoading &&
        !animationRef.current &&
        element &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        animationRef.current = element.animate([{ backgroundPosition: "100%" }, { backgroundPosition: "0%" }], {
          duration: 2000,
          iterations: Infinity,
          easing: "ease-in-out",
          pseudoElement: needsDirectAccess ? undefined : "::after"
        })
        // Ensure all skeleton are synchronized.
        animationRef.current.startTime = 0
      } else if ((!isLoading && animationRef.current) || (animationRef.current && !element)) {
        animationRef.current.cancel()
        animationRef.current = null
      }
    },
    [isLoading, needsDirectAccess]
  )

  if (!isLoading) return children

  const wrappedChildren = ensureSpan(children, ["img", "svg"])

  const element = isValidElement<Record<string, unknown>>(wrappedChildren) ? (
    wrappedChildren
  ) : (
    <span>{wrappedChildren}</span>
  )

  // TODO: https://github.com/facebook/react/issues/34775
  // oxlint-disable-next-line react/refs
  return cloneElement(element, {
    ...mergeProps(element.props, rest, {
      className: styles.Skeleton,
      // Accessibility: make skeletons non-focusable.
      tabIndex: -1,
      // Disable pointer events to allow interactions with elements behind the skeleton.
      style: { pointerEvents: "none" },
      "data-direct": needsDirectAccess
    }),
    ref: animate
  })
}

export declare namespace Skeleton {
  type Props = SkeletonProps
}
