import { createElement, isValidElement, type ReactElement } from "react"

/**
 * Ensures that strings and images are wrapped in a span element, for the callers that need a box
 * able to carry a pseudo-element — which neither a text node nor an `img` can.
 *
 * The wrapper takes the child's own `className`, since it stands in for the child as the flex item,
 * sized box, and rounded corner. Without it a wrapped avatar loses its circle and a wrapped thumbnail
 * loses its dimensions, and whatever is painted over them comes out the wrong shape.
 */
export function ensureSpan(children: React.ReactNode, checkType?: ReactElement["type"][]) {
  if (typeof children === "string") return createElement("span", null, children)

  if (isValidElement<{ className?: string }>(children) && checkType?.includes(children.type)) {
    return createElement("span", { className: children.props.className }, children)
  }

  return children
}
