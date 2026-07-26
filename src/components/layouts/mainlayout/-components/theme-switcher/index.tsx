import { DropdownMenu } from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icons"
import { type ThemeKey, THEMES } from "@/theme"
import { useTheme } from "@/theme/context/context"

import styles from "./index.module.scss"

const THEME_ICONS: Record<ThemeKey, React.ReactNode> = {
  light: <Icon.SunIcon />,
  dark: <Icon.MoonIcon />,
  system: <Icon.DesktopIcon />
}

type ThemeSwitcherProps = Record<string, never>

export function ThemeSwitcher(_props: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className={styles["ThemeSwitcher__trigger"]} aria-label="Switch theme">
        {THEME_ICONS[theme] ?? <Icon.SunIcon size={14} />}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Positioner align="end">
          <DropdownMenu.Popup>
            <DropdownMenu.RadioGroup value={theme} onValueChange={value => setTheme(value as ThemeKey)}>
              {(Object.entries(THEMES) as [ThemeKey, (typeof THEMES)[ThemeKey]][]).map(([key, t]) => (
                <DropdownMenu.RadioItem key={key} value={key} icon={THEME_ICONS[key]}>
                  {t.label}
                </DropdownMenu.RadioItem>
              ))}
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Popup>
        </DropdownMenu.Positioner>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export declare namespace ThemeSwitcher {
  export type Props = ThemeSwitcherProps
}
