import LINK_IMAGES from "virtual:link-images"

/** A url that resolved to a real image at build time — see `previewUrl`. Still a plain string; the
    name is only for a reader, not a runtime guarantee. */
export type OGImage = string

/**
 * The `og:image` a page declared, read at build time by scanning the source tree for exactly this
 * call and resolving each url found this way once — see `config/vite-plugins/link-previews`.
 * `undefined` for a page that declared none, or was never reached.
 *
 * Kept apart from the plugin's own `index.ts`, which the app never imports: that file pulls in
 * `node:fs`, `node:path`, and Vite's own plugin types, none of which belong in a client bundle. This
 * one only reads the virtual module the plugin already resolved, so it's safe wherever a preview is
 * used.
 */
export function previewUrl(url: string): OGImage | undefined {
  return LINK_IMAGES[url]
}
