declare module "virtual:buildinfo" {
  /** Build time */
  export const time: Date

  /** The current branch */
  export const branch: string

  /** SHA of the current commit */
  export const sha: string

  /** The first 10 chars of the current SHA */
  export const abbreviatedSha: string

  /** Package name */
  export const name: string

  /** Package version */
  export const version: string
}

declare module "virtual:config" {
  /** Application mode */
  export const mode: "development" | "production"
}
