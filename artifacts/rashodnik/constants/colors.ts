/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: '#16251E',
    tint: '#1E6F50',
    background: '#F5F7F2',
    foreground: '#16251E',
    card: '#FFFFFF',
    cardForeground: '#16251E',
    primary: '#1E6F50',
    primaryForeground: '#FFFFFF',
    secondary: '#E8F0E7',
    secondaryForeground: '#1E6F50',
    muted: '#EDF1EB',
    mutedForeground: '#7A887F',
    accent: '#F4C96B',
    accentForeground: '#624919',
    destructive: '#C95252',
    destructiveForeground: '#FFFFFF',
    border: '#DCE5DC',
    input: '#E3EAE2',
    income: '#238A62',
    expense: '#C95252',
    navy: '#244E5B',
    softGold: '#FFF2D1',
  },
  dark: {
    text: '#F1F6F0',
    tint: '#82D1A6',
    background: '#111A16',
    foreground: '#F1F6F0',
    card: '#1B2821',
    cardForeground: '#F1F6F0',
    primary: '#82D1A6',
    primaryForeground: '#132119',
    secondary: '#24372D',
    secondaryForeground: '#BFEACD',
    muted: '#233229',
    mutedForeground: '#9BAEA1',
    accent: '#F4C96B',
    accentForeground: '#3E2E0F',
    destructive: '#E47A7A',
    destructiveForeground: '#291313',
    border: '#304339',
    input: '#2A3B31',
    income: '#82D1A6',
    expense: '#E47A7A',
    navy: '#8FC8D4',
    softGold: '#40351D',
  },
  radius: 22,
};

export default colors;
