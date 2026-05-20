export const Colors = {
  primary: '#1A3D2B', // deep forest green
  primaryLight: '#52B788', // bright green
  primarySurface: '#D8F3DC', // tinted green bg
  bg: '#F8F6F1', // warm off-white page
  surface: '#FFFFFF', // cards
  ink: '#111B14', // body text
  inkSoft: '#4A5C4E', // secondary text
  
  // Logical colors
  success: '#52B788',
  error: '#FF6B35', 
  warning: '#FFD700',
  info: '#20B2AA', // kurukuru teal
  border: '#EBE9E1',
};

export const Radius = {
  borderRadiusBase: 12,
  borderRadiusLarge: 24,
  borderRadiusPill: 9999,
  // Fallbacks
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Shadow = {
  light: {
    shadowColor: '#111B14',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  medium: {
    shadowColor: '#111B14',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  heavy: {
    shadowColor: '#111B14',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
};

export const Fonts = {
  heading: { fontWeight: '700' as const },
  subheading: { fontWeight: '600' as const },
  body: { fontWeight: '400' as const },
  caption: { fontWeight: '500' as const },
};
