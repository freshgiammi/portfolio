declare module "virtual:link-images" {
  /**
   * A linked page's url to the `og:image` read from it at build time. Only the pages that answered
   * appear, so a missing key means the page declared none — see `config/vite-plugins/link-previews`.
   */
  const images: Record<string, string>

  export default images
}
