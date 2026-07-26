/* eslint-disable react-refresh/only-export-components */
import { Menu as BaseMenu } from "@base-ui/react/menu"

import { Menu } from "@/components/primitives/menu"
import { Icon } from "@/components/ui/icons"
import { useScopedTheme } from "@/theme/context/context"

/*
 * ====================================================================================
 * Root
 * ====================================================================================
 */

function Root(props: BaseMenu.Root.Props) {
  return <BaseMenu.Root {...props} />
}

declare namespace Root {
  type Props = BaseMenu.Root.Props
}

/*
 * ====================================================================================
 * Trigger
 * ====================================================================================
 */

function Trigger(props: BaseMenu.Trigger.Props) {
  return <BaseMenu.Trigger {...props} />
}

declare namespace Trigger {
  type Props = BaseMenu.Trigger.Props
}

/*
 * ====================================================================================
 * Portal
 * ====================================================================================
 */

function Portal(props: BaseMenu.Portal.Props) {
  return <BaseMenu.Portal {...props} />
}

declare namespace Portal {
  type Props = BaseMenu.Portal.Props
}

/*
 * ====================================================================================
 * Positioner
 * ====================================================================================
 */

function Positioner(props: BaseMenu.Positioner.Props) {
  // The outermost portalled node, so the whole popup follows the scope it was opened from rather
  // than the document. Spread first, so a caller can still override it.
  return <BaseMenu.Positioner sideOffset={4} data-theme={useScopedTheme()} {...props} />
}

declare namespace Positioner {
  type Props = BaseMenu.Positioner.Props
}

/*
 * ====================================================================================
 * Popup
 * ====================================================================================
 */

function Popup({ children, ...props }: BaseMenu.Popup.Props) {
  return <Menu.Popup render={<BaseMenu.Popup {...props} />}>{children}</Menu.Popup>
}

declare namespace Popup {
  type Props = BaseMenu.Popup.Props
}

/*
 * ====================================================================================
 * Item
 * ====================================================================================
 */

type ItemProps = BaseMenu.Item.Props & {
  icon?: React.ReactNode
}

function Item({ icon, children, ...props }: ItemProps) {
  return (
    <Menu.Item icon={icon} render={<BaseMenu.Item {...props} />}>
      {children}
    </Menu.Item>
  )
}

declare namespace Item {
  type Props = ItemProps
}

/*
 * ====================================================================================
 * RadioGroup
 * ====================================================================================
 */

function RadioGroup(props: BaseMenu.RadioGroup.Props) {
  return <BaseMenu.RadioGroup {...props} />
}

declare namespace RadioGroup {
  type Props = BaseMenu.RadioGroup.Props
}

/*
 * ====================================================================================
 * RadioItem
 * ====================================================================================
 */

type RadioItemProps = BaseMenu.RadioItem.Props & {
  icon?: React.ReactNode
}

function RadioItem({ icon, children, ...props }: RadioItemProps) {
  return (
    <Menu.Item
      icon={icon}
      indicator={
        <BaseMenu.RadioItemIndicator>
          <Icon.CheckIcon />
        </BaseMenu.RadioItemIndicator>
      }
      render={<BaseMenu.RadioItem {...props} />}>
      {children}
    </Menu.Item>
  )
}

declare namespace RadioItem {
  type Props = RadioItemProps
}

/*
 * ====================================================================================
 * CheckboxItem
 * ====================================================================================
 */

type CheckboxItemProps = BaseMenu.CheckboxItem.Props & {
  icon?: React.ReactNode
}

function CheckboxItem({ icon, children, ...props }: CheckboxItemProps) {
  return (
    <Menu.Item
      icon={icon}
      indicator={
        <BaseMenu.CheckboxItemIndicator>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5L4 7L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </BaseMenu.CheckboxItemIndicator>
      }
      render={<BaseMenu.CheckboxItem {...props} />}>
      {children}
    </Menu.Item>
  )
}

declare namespace CheckboxItem {
  type Props = CheckboxItemProps
}

/*
 * ====================================================================================
 * Group
 * ====================================================================================
 */

function Group(props: BaseMenu.Group.Props) {
  return <BaseMenu.Group {...props} />
}

declare namespace Group {
  type Props = BaseMenu.Group.Props
}

/*
 * ====================================================================================
 * GroupLabel
 * ====================================================================================
 */

function GroupLabel({ children, ...props }: BaseMenu.GroupLabel.Props) {
  return (
    <Menu.GroupLabel render={<BaseMenu.GroupLabel {...props} />}>{children}</Menu.GroupLabel>
  )
}

declare namespace GroupLabel {
  type Props = BaseMenu.GroupLabel.Props
}

/*
 * ====================================================================================
 * Separator
 * ====================================================================================
 */

function Separator(props: BaseMenu.Separator.Props) {
  return <Menu.Separator render={<BaseMenu.Separator {...props} />} />
}

declare namespace Separator {
  type Props = BaseMenu.Separator.Props
}

export const DropdownMenu = {
  Root,
  Trigger,
  Portal,
  Positioner,
  Popup,
  Item,
  RadioGroup,
  RadioItem,
  CheckboxItem,
  Group,
  GroupLabel,
  Separator
}
