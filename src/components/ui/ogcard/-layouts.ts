type ShapeRegion = "corner" | "scatter" | "band"

export type ShapeLayout = {
  cell: number
  gap: number
  maxOpacity: number
  region: ShapeRegion
}

export const CORNER_LAYOUT: ShapeLayout = { cell: 56, gap: 4, maxOpacity: 0.28, region: "corner" }
export const SCATTER_LAYOUT: ShapeLayout = { cell: 72, gap: 6, maxOpacity: 0.16, region: "scatter" }
export const BAND_LAYOUT: ShapeLayout = { cell: 56, gap: 4, maxOpacity: 0.22, region: "band" }
