import fs from "node:fs"
import path from "node:path"

import { parseSync } from "vite"

/**
 * Where the OG generator gets its list of pages: the generated route tree and the route files, read
 * rather than executed.
 *
 * Importing the route tree would mean importing every component behind it, which drags in stylesheets
 * and the virtual modules only the app's own plugins provide, none of which exist in a plain Node
 * runner. Nothing in a route's metadata needs to run, so nothing does. Vite bundles oxc, which parses
 * TypeScript and JSX directly, so the syntax the route is written in is the syntax we read.
 */

export type RouteCard = {
  /** Route path the card belongs to. */
  path: string
  seo?: { title: string; description: string; emoji?: string }
}

/** Minimal structural view of the AST: only the handful of node shapes this reads. */
type Node = {
  type: string
  [key: string]: unknown
}

export function collectRouteCards(root: string): Array<RouteCard> {
  const treePath = path.join(root, "src/routeTree.gen.ts")
  const tree = parseFile(treePath)

  const files = importedRouteFiles(tree, path.dirname(treePath))
  const routes = declaredRoutes(tree)
  const byPath = new Map<string, RouteCard>()

  for (const route of routes) {
    const fullPath = resolveFullPath(route, routes)
    if (!fullPath) continue

    const file = route.importName ? files.get(route.importName) : undefined
    const seo = file ? readRouteSeo(file) : undefined

    // A pathless layout and the index route beneath it resolve to the same path, so the one that
    // actually declared something wins.
    if (byPath.has(fullPath) && !seo) continue

    byPath.set(fullPath, { path: fullPath, ...(seo && { seo }) })
  }

  return [...byPath.values()]
}

/*
 * ==========================================
 * Internal utilities
 * ==========================================
 */

function parseFile(file: string): Array<Node> {
  const source = fs.readFileSync(file, "utf8")
  const result = parseSync(file, source)

  if (result.errors.length > 0) {
    throw new Error(`Failed to parse ${path.basename(file)}: ${result.errors[0]?.message}`)
  }

  return result.program.body as unknown as Array<Node>
}

/** `import { Route as MainAboutIndexRouteImport } from './routes/_main/about/index'` */
function importedRouteFiles(body: Array<Node>, dir: string) {
  const files = new Map<string, string>()

  for (const node of body) {
    if (node.type !== "ImportDeclaration") continue

    const source = asNode(node.source)
    const specifier = typeof source?.value === "string" ? source.value : undefined
    if (!specifier?.startsWith("./routes/")) continue

    for (const raw of (node.specifiers as Array<Node> | undefined) ?? []) {
      const local = asNode(raw.local)
      if (typeof local?.name === "string") {
        files.set(local.name, resolveModuleFile(path.join(dir, specifier)))
      }
    }
  }

  return files
}

/** Route files are always `.ts` or `.tsx`, and the generated import carries no extension. */
function resolveModuleFile(base: string) {
  return [".tsx", ".ts"].map(extension => `${base}${extension}`).find(candidate => fs.existsSync(candidate)) ?? base
}

type DeclaredRoute = {
  name: string
  importName?: string
  routePath?: string
  parent?: string
}

/** `const X = XImport.update({ id, path, getParentRoute: () => Parent } as any)` */
function declaredRoutes(body: Array<Node>): Array<DeclaredRoute> {
  const routes: Array<DeclaredRoute> = []

  for (const node of body) {
    if (node.type !== "VariableDeclaration") continue

    for (const raw of (node.declarations as Array<Node> | undefined) ?? []) {
      const init = asNode(raw.init)
      const callee = asNode(init?.callee)
      const property = asNode(callee?.property)
      if (init?.type !== "CallExpression" || property?.name !== "update") continue

      const name = asNode(raw.id)?.name
      if (typeof name !== "string") continue

      const options = unwrap(asNode((init.arguments as Array<Node> | undefined)?.[0]))
      const parentBody = asNode(readProperty(options, "getParentRoute")?.body)

      routes.push({
        name,
        importName: typeof asNode(callee?.object)?.name === "string" ? String(asNode(callee?.object)?.name) : undefined,
        routePath: readString(options, "path"),
        parent: typeof parentBody?.name === "string" ? parentBody.name : undefined
      })
    }
  }

  return routes
}

/** Absolute paths stand alone; anything else joins onto its parent, the way the router composes them. */
function resolveFullPath(route: DeclaredRoute, routes: Array<DeclaredRoute>): string | undefined {
  const segments: Array<string> = []
  let current: DeclaredRoute | undefined = route

  while (current) {
    if (current.routePath) {
      segments.unshift(current.routePath)
      if (current.routePath.startsWith("/")) break
    }
    current = routes.find(candidate => candidate.name === current?.parent)
  }

  if (segments.length === 0) return undefined

  const joined = segments.join("/").replace(/\/{2,}/g, "/")
  return joined === "/" ? joined : joined.replace(/\/$/, "")
}

/**
 * `staticData: { seo: … }`, either written inline or pointing at a const in the same file. Anything
 * else is a shape this cannot read, and staying quiet about it would mean a wrong card rather than a
 * missing one.
 */
function readRouteSeo(file: string): RouteCard["seo"] {
  const body = parseFile(file)

  // `export const Route = createFileRoute(…)({ … })`: a call whose callee is itself a call.
  const options = body
    .filter(node => node.type === "ExportNamedDeclaration")
    .flatMap(node => (asNode(node.declaration)?.declarations as Array<Node> | undefined) ?? [])
    .map(declaration => asNode(declaration.init))
    .filter(init => init?.type === "CallExpression" && asNode(init.callee)?.type === "CallExpression")
    .map(init => unwrap(asNode((init?.arguments as Array<Node> | undefined)?.[0])))
    .find(Boolean)

  const staticData = unwrap(readProperty(options, "staticData"))
  const seo = unwrap(readProperty(staticData, "seo"))
  if (!seo) return undefined

  const literal = seo.type === "Identifier" ? findConst(body, String(seo.name)) : seo
  const title = readString(literal, "title")
  const description = readString(literal, "description")

  if (!title || !description) {
    throw new Error(
      `Could not read staticData.seo from ${path.basename(path.dirname(file))}/${path.basename(file)}. ` +
        `Write it as an object literal, or as a const in the same file.`
    )
  }

  const emoji = readString(literal, "emoji")
  return { title, description, ...(emoji && { emoji }) }
}

/** `const SEO = { … } satisfies PageSeo` */
function findConst(body: Array<Node>, name: string): Node | undefined {
  for (const node of body) {
    if (node.type !== "VariableDeclaration") continue

    for (const raw of (node.declarations as Array<Node> | undefined) ?? []) {
      if (asNode(raw.id)?.name === name) return unwrap(asNode(raw.init))
    }
  }

  return undefined
}

/** Strips the `satisfies` and `as` wrappers the value may be written behind. */
function unwrap(node: Node | undefined): Node | undefined {
  if (node?.type === "TSSatisfiesExpression" || node?.type === "TSAsExpression") {
    return unwrap(asNode(node.expression))
  }
  return node
}

function readProperty(node: Node | undefined, key: string): Node | undefined {
  const properties = (node?.properties as Array<Node> | undefined) ?? []
  const match = properties.find(property => asNode(property.key)?.name === key)
  return asNode(match?.value)
}

function readString(node: Node | undefined, key: string): string | undefined {
  const value = readProperty(node, key)
  return typeof value?.value === "string" ? value.value : undefined
}

function asNode(value: unknown): Node | undefined {
  return value && typeof value === "object" ? (value as Node) : undefined
}
