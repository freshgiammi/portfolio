import { useRender } from "@base-ui/react"
import { forwardRef } from "react"

import type { TypographyAttributesProps } from "@/utils/typography"
import { getTypographyAttributes } from "@/utils/typography"

/*
 * ====================================================================================
 * Typography
 * ====================================================================================
 */

type TypographyProps = useRender.ComponentProps<"div"> & TypographyAttributesProps

/**
 * A component for displaying text. It can be used to set the font size, weight, family, and truncate text.
 *
 * Not providing values will make the text inherit the values from its closest Typography ancestor (or the default values).
 */
export const Typography = forwardRef<HTMLDivElement, TypographyProps>(function Typography(props, ref) {
  const { render, size, weight, family, truncate = false, style, ...rest } = props

  return useRender({
    defaultTagName: "div",
    render,
    ref,
    props: {
      ...getTypographyAttributes({ size, weight, family, truncate }),
      style: {
        ...(truncate && typeof truncate === "number" ? { "--line-clamp": truncate } : {}),
        ...style
      },
      ...rest
    }
  })
})

export declare namespace Typography {
  export type Props = TypographyProps
}
