// Appearance settings for the mobile shell. The shell only renders the
// controls; the host owns storage (localStorage on the phone, deliberately
// separate from the desktop app's settings) and applies the theme.

export type MobileThemePreference = "system" | "light" | "dark";

export interface MobileAppearance {
  /** Preference at mount time; the settings view tracks changes locally. */
  theme: MobileThemePreference;
  onThemeChange: (theme: MobileThemePreference) => void;
}
