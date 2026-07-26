/**
 * Single source of truth for the header navigation.
 *
 * Wide viewports render the top level and reach the rest through dropdowns; narrow viewports
 * render the whole thing inside the menu panel, grouped by these same labels. Either way adding a
 * page here costs no header width.
 */

export type NavLink = { to: string; label: string; fuzzy?: boolean }
export type NavGroup = { label: string; children: Array<NavLink> }
export type NavItem = NavLink | NavGroup

export const NAV_ITEMS: Array<NavItem> = [
  { to: "/", label: "Home" },
  {
    label: "About",
    children: [
      { to: "/about", label: "Personal" },
      { to: "/work", label: "Work" }
    ]
  },
  {
    label: "Making",
    children: [
      { to: "/showcase", label: "Showcase" },
      { to: "/projects", label: "Projects" }
    ]
  },
  {
    label: "Writing",
    children: [
      { to: "/blog", label: "Blog", fuzzy: true },
      { to: "/thoughts", label: "Thoughts", fuzzy: true }
    ]
  }
]

export function isGroup(item: NavItem): item is NavGroup {
  return "children" in item && Array.isArray(item.children)
}

/** Every destination in nav order, with the groups' own labels dropped. */
export function flattenNav(items: Array<NavItem> = NAV_ITEMS): Array<NavLink> {
  return items.flatMap(item => (isGroup(item) ? item.children : [item]))
}
