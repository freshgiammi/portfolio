export type TypographyAttributesProps = {
  /**
   * Font size
   */
  size?: "xxx-small" | "xx-small" | "x-small" | "small" | "medium" | "large" | "x-large" | "xx-large"
  /**
   * Font weight
   */
  weight?: "light" | "regular" | "medium" | "semibold" | "bold"
  /**
   * Font family
   */
  family?: "sans" | "serif" | "mono"
  /**
   * Truncate text. Allows for a max number of lines to be displayed.
   *
   * @default false
   */
  truncate?: boolean | number
}

/**
 * Generates type-safe data attributes for setting font-styles. Supports parent inheritance for unspecified values.
 *
 * An unset value is left out of the object rather than emitted as `undefined`. React drops either
 * one, but a key holding `undefined` still counts as a value when these attributes are merged onto
 * an element that already carries some, and would clear them.
 */
export function getTypographyAttributes(props: TypographyAttributesProps) {
  const { size, weight, family, truncate } = props
  return {
    "data-font": "",
    ...(size !== undefined && { "data-font-size": size }),
    ...(weight !== undefined && { "data-font-weight": weight }),
    ...(family !== undefined && { "data-font-family": family }),
    ...(truncate !== undefined && truncate !== false && { "data-truncate": truncate })
  }
}
