import { useRender } from "@base-ui/react"

import type { TypographyAttributesProps } from "@/utils/typography"
import { getTypographyAttributes } from "@/utils/typography"

/*
 * ====================================================================================
 * Typography
 * ====================================================================================
 */

type TypographyProps = useRender.ComponentProps<"div"> & TypographyAttributesProps

/** Unset size/weight/family/truncate inherit from the nearest ancestor `<Typography>`, or the defaults. */
export function Typography({ render, size, weight, family, truncate = false, style, ref, ...rest }: TypographyProps) {
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
}

export declare namespace Typography {
  export type Props = TypographyProps
}
