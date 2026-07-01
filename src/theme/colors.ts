/**
 * Palette Nanika — Violet Mystique
 *
 * Inspirée du logo (fond noir, yeux cyan, bouche multicolore violet/rose).
 * Principe Duolingo: couleurs vives + variantes 3D (shadow = couleur assombrie).
 *
 * Règles de design:
 * - Chaque couleur d'action a une variante "Dark" pour l'ombre 3D des boutons
 * - Les surfaces suivent une hiérarchie: background < surface < surfaceElevated
 * - Les feedbacks (success/warning/error/info) restent universels light & dark
 * - Les couleurs "Nanika" (chakra/berry/sharingan) sont l'identité du jeu
 */

// ─── Light Theme ────────────────────────────────────────────────────────────────
export const lightColors = {
  // ── Base ──
  primary: '#7C5CE7',
  primaryDark: '#5A3DC7',
  primaryLight: '#A78BFA',
  primaryDisabled: '#C4B5FD',
  background: '#FFFFFF',

  // ── Secondary (turquoise du logo) ──
  secondary: '#00C9B7',
  secondaryDark: '#009E8F',

  // ── Accent (rose de la bouche) ──
  accent: '#FF6B9D',
  accentDark: '#E6527F',

  // ── Textes ──
  text: '#1A1A2E',
  textSecondary: '#4A4A6A',
  textMuted: '#8888A8',
  textOnPrimary: '#FFFFFF',
  textOnDark: '#FFFFFF',

  // ── Surfaces ──
  surface: '#F5F3FF',
  surfaceElevated: '#EDE9FE',
  card: '#FFFFFF',

  // ── Bordures ──
  border: '#E2E0F0',
  borderDark: '#D1CEE6',

  // ── Feedbacks ──
  success: '#4ADE80',
  successDark: '#22C55E',
  warning: '#FFB800',
  warningDark: '#E5A500',
  error: '#FF4B4B',
  errorDark: '#DC2626',
  info: '#38BDF8',
  infoDark: '#0EA5E9',

  // ── Spécifiques Nanika ──
  chakra: '#38BDF8',
  chakraDark: '#0EA5E9',
  berry: '#A855F7',
  berryDark: '#7C3AED',
  sharingan: '#EF4444',
  sharinganDark: '#DC2626',

  // ── Progression par Arcs ──
  arc0: '#4ADE80',
  arc1: '#FFB800',
  arc2: '#FB923C',
  arc3: '#F87171',
  arc4: '#A855F7',
  arc5: '#6366F1',

  // ── Overlay ──
  overlay: 'rgba(13, 10, 26, 0.6)',

  // ── OAuth Providers ──
  google: '#4285F4',
  googleDark: '#3367D6',

  // ── Aliases (rétrocompatibilité) ──
  cta: '#7C5CE7',
  ctaDark: '#5A3DC7',
  danger: '#FF4B4B',
  dangerDark: '#DC2626',
  orange: '#FB923C',
  orangeDark: '#EA580C',
  blue: '#38BDF8',
  blueDark: '#0EA5E9',
};

// ─── Dark Theme ─────────────────────────────────────────────────────────────────
export const darkColors = {
  // ── Base ──
  primary: '#9B7FE8',
  primaryDark: '#7C5CE7',
  primaryLight: '#C4B5FD',
  primaryDisabled: '#4A3A7A',
  background: '#0D0A1A',

  // ── Secondary (cyan néon) ──
  secondary: '#00E5CC',
  secondaryDark: '#00C9B7',

  // ── Accent ──
  accent: '#FF6B9D',
  accentDark: '#E6527F',

  // ── Textes ──
  text: '#F0EEFF',
  textSecondary: '#B8B4D0',
  textMuted: '#6B6790',
  textOnPrimary: '#FFFFFF',
  textOnDark: '#FFFFFF',

  // ── Surfaces ──
  surface: '#1E1537',
  surfaceElevated: '#2A1F4A',
  card: '#1E1537',

  // ── Bordures ──
  border: '#352A5C',
  borderDark: '#2A1F4A',

  // ── Feedbacks ──
  success: '#4ADE80',
  successDark: '#22C55E',
  warning: '#FFB800',
  warningDark: '#E5A500',
  error: '#FF4B4B',
  errorDark: '#DC2626',
  info: '#38BDF8',
  infoDark: '#0EA5E9',

  // ── Spécifiques Nanika ──
  chakra: '#38BDF8',
  chakraDark: '#0EA5E9',
  berry: '#C084FC',
  berryDark: '#A855F7',
  sharingan: '#F87171',
  sharinganDark: '#EF4444',

  // ── Progression par Arcs ──
  arc0: '#4ADE80',
  arc1: '#FFB800',
  arc2: '#FB923C',
  arc3: '#F87171',
  arc4: '#C084FC',
  arc5: '#818CF8',

  // ── Overlay ──
  overlay: 'rgba(0, 0, 0, 0.75)',

  // ── OAuth Providers ──
  google: '#4285F4',
  googleDark: '#3367D6',

  // ── Aliases (rétrocompatibilité) ──
  cta: '#9B7FE8',
  ctaDark: '#7C5CE7',
  danger: '#FF4B4B',
  dangerDark: '#DC2626',
  orange: '#FB923C',
  orangeDark: '#EA580C',
  blue: '#38BDF8',
  blueDark: '#0EA5E9',
};

export type ThemeColors = typeof lightColors;
