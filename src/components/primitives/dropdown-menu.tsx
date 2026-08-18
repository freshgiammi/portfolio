/* eslint-disable react-refresh/only-export-components */
import { Menu as BaseMenu } from "@base-ui/react/menu"

import { Icon } from "@/components/primitives/icons"
import { Menu } from "@/components/primitives/menu"
import { useScopedTheme } from "@/theme/context/context"

/*
 * ====================================================================================
 * Root
 * ====================================================================================
 */

type RootProps = BaseMenu.Root.Props

function Root(props: RootProps) {
  return <BaseMenu.Root {...props} />
}

/*
 * ====================================================================================
 * Trigger
 * ====================================================================================
 */

type TriggerProps = BaseMenu.Trigger.Props

function Trigger(props: TriggerProps) {
  return <BaseMenu.Trigger {...props} />
}

/*
 * ====================================================================================
 * Portal
 * ====================================================================================
 */

type PortalProps = BaseMenu.Portal.Props

function Portal(props: PortalProps) {
  return <BaseMenu.Portal {...props} />
}

/*
 * ====================================================================================
 * Positioner
 * ====================================================================================
 */

type PositionerProps = BaseMenu.Positioner.Props

function Positioner({ side = "bottom", align = "start", ...rest }: PositionerProps) {
  // The outermost portalled node, so the whole popup follows the scope it was opened from rather
  // than the document. Defaults to bottom-start so the menu reads from the trigger's start edge.
  return <BaseMenu.Positioner side={side} align={align} sideOffset={4} data-theme={useScopedTheme()} {...rest} />
}

/*
 * ====================================================================================
 * Popup
 * ====================================================================================
 */

type PopupProps = BaseMenu.Popup.Props

function Popup({ children, ...rest }: PopupProps) {
  return <Menu.Popup render={<BaseMenu.Popup {...rest} />}>{children}</Menu.Popup>
}

/*
 * ====================================================================================
 * Item
 * ====================================================================================
 */

type ItemProps = BaseMenu.Item.Props & {
  icon?: React.ReactNode
}

function Item({ icon, children, ...rest }: ItemProps) {
  return (
    <Menu.Item icon={icon} render={<BaseMenu.Item {...rest} />}>
      {children}
    </Menu.Item>
  )
}

/*
 * ====================================================================================
 * RadioGroup
 * ====================================================================================
 */

type RadioGroupProps = BaseMenu.RadioGroup.Props

function RadioGroup(props: RadioGroupProps) {
  return <BaseMenu.RadioGroup {...props} />
}

/*
 * ====================================================================================
 * RadioItem
 * ====================================================================================
 */

type RadioItemProps = BaseMenu.RadioItem.Props & {
  icon?: React.ReactNode
}

function RadioItem({ icon, children, ...rest }: RadioItemProps) {
  return (
    <Menu.Item
      icon={icon}
      indicator={
        <BaseMenu.RadioItemIndicator>
          <Icon.CheckIcon />
        </BaseMenu.RadioItemIndicator>
      }
      render={<BaseMenu.RadioItem {...rest} />}>
      {children}
    </Menu.Item>
  )
}

/*
 * ====================================================================================
 * CheckboxItem
 * ====================================================================================
 */

type CheckboxItemProps = BaseMenu.CheckboxItem.Props & {
  icon?: React.ReactNode
}

function CheckboxItem({ icon, children, ...rest }: CheckboxItemProps) {
  return (
    <Menu.Item
      icon={icon}
      indicator={
        <BaseMenu.CheckboxItemIndicator>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M2 5L4 7L8 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </BaseMenu.CheckboxItemIndicator>
      }
      render={<BaseMenu.CheckboxItem {...rest} />}>
      {children}
    </Menu.Item>
  )
}

/*
 * ====================================================================================
 * Group
 * ====================================================================================
 */

type GroupProps = BaseMenu.Group.Props

function Group(props: GroupProps) {
  return <BaseMenu.Group {...props} />
}

/*
 * ====================================================================================
 * GroupLabel
 * ====================================================================================
 */

type GroupLabelProps = BaseMenu.GroupLabel.Props

function GroupLabel({ children, ...rest }: GroupLabelProps) {
  return <Menu.GroupLabel render={<BaseMenu.GroupLabel {...rest} />}>{children}</Menu.GroupLabel>
}

/*
 * ====================================================================================
 * Separator
 * ====================================================================================
 */

type SeparatorProps = BaseMenu.Separator.Props

function Separator(props: SeparatorProps) {
  return <Menu.Separator render={<BaseMenu.Separator {...props} />} />
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

// Merged into the parts object so each part carries its own types: `DropdownMenu.Popup.Props`.
export declare namespace DropdownMenu {
  export namespace Root {
    export type Props = RootProps
  }
  export namespace Trigger {
    export type Props = TriggerProps
  }
  export namespace Portal {
    export type Props = PortalProps
  }
  export namespace Positioner {
    export type Props = PositionerProps
  }
  export namespace Popup {
    export type Props = PopupProps
  }
  export namespace Item {
    export type Props = ItemProps
  }
  export namespace RadioGroup {
    export type Props = RadioGroupProps
  }
  export namespace RadioItem {
    export type Props = RadioItemProps
  }
  export namespace CheckboxItem {
    export type Props = CheckboxItemProps
  }
  export namespace Group {
    export type Props = GroupProps
  }
  export namespace GroupLabel {
    export type Props = GroupLabelProps
  }
  export namespace Separator {
    export type Props = SeparatorProps
  }
}
