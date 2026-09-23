// Hover treatment shared by the settings cards. The colors come from the
// --psx-highlight-* tokens rather than being named here, because the two hosts
// want different answers: the desktop app owns its palette and uses the blue
// pair these cards were designed around, while VS Code takes user-supplied
// theme colors that can be highly saturated and so keeps the neutral list hover
// with a transparent ring. The border is always present, so hovering changes
// color without shifting the card.
export const catalogCardClass =
  "border border-transparent hover:border-psx-highlight-border hover:bg-psx-highlight-background transition-colors";
