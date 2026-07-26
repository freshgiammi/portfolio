import { Dialog } from "@base-ui/react/dialog"
import { NavigationMenu } from "@base-ui/react/navigation-menu"
import { Link, useMatchRoute } from "@tanstack/react-router"
import { cx } from "cva"
import { type ComponentProps, Fragment, useState } from "react"

import { Menu } from "@/components/primitives/menu"
import { Icon } from "@/components/ui/icons"
import { Typography } from "@/components/ui/typography"
import type { TypographyAttributesProps } from "@/utils/typography"
import { getTypographyAttributes } from "@/utils/typography"

import { BuildInfoFooter } from "./-components/buildinfo-footer"
import { ThemeSwitcher } from "./-components/theme-switcher"
import styles from "./index.module.scss"
import type { NavGroup } from "./nav"
import { flattenNav, isGroup, NAV_ITEMS } from "./nav"

type LinkComponentProps = ComponentProps<typeof Link> & {
  fuzzy?: boolean
  size?: TypographyAttributesProps["size"]
}

type MainLayoutProps = {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className={styles.Layout}>
      <div className={styles.Header} style={{ viewTransitionName: "header" }}>
        <div className={styles.Header__identity}>
          <span className={styles.Brand} role="img" aria-label="Developer">
            <span className={styles.BrandIcon} aria-hidden="true">
              👨🏻‍💻
            </span>
          </span>
          <CurrentPageLabel />
        </div>
        <WideNav />
        <div className={styles["Header__theme"]}>
          <ThemeSwitcher />
        </div>
        <NarrowNav />
      </div>

      <div className={styles.Layout__content}>{children}</div>
      <BuildInfoFooter />
    </div>
  )
}

export declare namespace MainLayout {
  export type Props = MainLayoutProps
}

/**
 * Narrow-viewport stand-in for the header nav: with the destinations behind a panel, this is the
 * only thing telling you which page you are on. Falls back to the wordmark off-nav (a 404, say).
 */
/*
 * ==========================================
 * Internal components
 * ==========================================
 */

function CurrentPageLabel() {
  const match = useMatchRoute()
  const current = flattenNav().find(link => match({ to: link.to, fuzzy: link.fuzzy }))

  return (
    <Typography size="small" family="serif" className={styles.Header__current}>
      {current?.label ?? "freshgiammi"}
    </Typography>
  )
}

/**
 * Top level only: everything below it lives in a menu, so the row never grows.
 *
 * Built on NavigationMenu rather than a menu per group, so the groups open on hover and one
 * popup moves between them instead of each opening its own.
 */
function WideNav() {
  return (
    <NavigationMenu.Root
      className={cx(styles.Header__nav, styles["Header__nav--wide"])}
      render={<nav aria-label="Main" />}>
      <NavigationMenu.List className={styles.Header__navList}>
        {NAV_ITEMS.map((item, index) => (
          <Fragment key={isGroup(item) ? item.label : item.to}>
            {index > 0 && <NavSeparator />}
            {isGroup(item) ? (
              <NavGroupItem group={item} />
            ) : (
              <NavigationMenu.Item>
                <LinkComponent to={item.to} fuzzy={item.fuzzy}>
                  {item.label}
                </LinkComponent>
              </NavigationMenu.Item>
            )}
          </Fragment>
        ))}
      </NavigationMenu.List>

      <NavigationMenu.Portal>
        <NavigationMenu.Positioner sideOffset={4} align="start" className={styles.NavPositioner}>
          <Menu.Popup render={<NavigationMenu.Popup />}>
            <NavigationMenu.Viewport className={styles.NavViewport} />
          </Menu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  )
}

/** One group: a trigger in the row, and the links it holds inside the shared popup. */
function NavGroupItem({ group }: { group: NavGroup }) {
  const match = useMatchRoute()
  const isActive = group.children.some(child => match({ to: child.to, fuzzy: true }))

  return (
    // A stable value per group, so the open item is addressable rather than an internal id.
    <NavigationMenu.Item value={group.label}>
      <NavigationMenu.Trigger className={cx(styles.DropdownTrigger, isActive && styles["DropdownTrigger--active"])}>
        <span {...getTypographyAttributes({ family: "sans", size: "x-small", weight: isActive ? "bold" : "medium" })}>
          {group.label}
        </span>
        <Icon.CaretDownIcon size={13} weight="bold" className={styles["DropdownTrigger__caret"]} />
      </NavigationMenu.Trigger>

      <NavigationMenu.Content className={styles.NavContent}>
        {group.children.map(child => (
          <Menu.Item
            key={child.to}
            render={
              <NavigationMenu.Link
                render={<Link to={child.to} />}
                {...getTypographyAttributes({ weight: match({ to: child.to, fuzzy: true }) ? "bold" : "medium" })}
              />
            }>
            {child.label}
          </Menu.Item>
        ))}
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  )
}

/**
 * Menu panel holding every destination, so the header itself stays a fixed size no matter how
 * many pages exist.
 *
 * Every destination is one tap from the open panel: groups are printed as plain headings above
 * their links rather than as collapsibles, which is what previously made reaching a sub-page cost
 * two taps. Built on Dialog for the focus trap, Escape handling and background scroll lock.
 */
function NarrowNav() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        className={cx(styles.MenuButton, open && styles["MenuButton--open"])}
        aria-label={open ? "Close menu" : "Open menu"}>
        <span className={styles.MenuButton__bar} />
        <span className={styles.MenuButton__bar} />
        <span className={styles.MenuButton__bar} />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className={styles.Backdrop} />
        <Dialog.Popup className={styles.Panel} aria-label="Main">
          <nav className={styles.Panel__nav}>
            {NAV_ITEMS.map(item =>
              isGroup(item) ? (
                <div key={item.label} className={styles.Panel__group}>
                  <Typography
                    size="xxx-small"
                    family="mono"
                    weight="medium"
                    className={styles.Panel__groupLabel}
                    render={<h2 />}>
                    {item.label}
                  </Typography>
                  {item.children.map(child => (
                    <LinkComponent
                      key={child.to}
                      to={child.to}
                      fuzzy={child.fuzzy}
                      size="small"
                      className={styles.Panel__link}
                      onClick={() => setOpen(false)}>
                      {child.label}
                    </LinkComponent>
                  ))}
                </div>
              ) : (
                <LinkComponent
                  key={item.to}
                  to={item.to}
                  fuzzy={item.fuzzy}
                  size="small"
                  className={cx(styles.Panel__link, styles["Panel__link--standalone"])}
                  onClick={() => setOpen(false)}>
                  {item.label}
                </LinkComponent>
              )
            )}
          </nav>

          <div className={styles.Panel__footer}>
            <ThemeSwitcher />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function NavSeparator() {
  return (
    <li
      aria-hidden="true"
      className={styles.NavSeparator}
      {...getTypographyAttributes({ family: "sans", size: "x-small", weight: "regular" })}>
      /
    </li>
  )
}

function LinkComponent({ className, onClick, fuzzy, size = "x-small", ...rest }: LinkComponentProps) {
  const match = useMatchRoute()

  return (
    <Link
      className={cx(styles.Link, className)}
      onClick={onClick}
      {...rest}
      {...getTypographyAttributes({
        family: "sans",
        size,
        weight: match({ to: rest.to, fuzzy }) ? "bold" : "medium"
      })}
    />
  )
}
