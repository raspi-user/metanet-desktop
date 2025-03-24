import { useMemo } from 'react';
import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

// theme
import palette from './palette';
import typography from './typography';
import shadows from './shadows';
import customShadows from './custom-shadows';
import componentsOverride from './components';

// ----------------------------------------------------------------------

export default function ThemeProvider({ children }) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const themeMode = prefersDarkMode ? 'dark' : 'light';

  const theme = useMemo(() => {
    const currentPalette = palette(themeMode);

    const theme = createTheme({
      palette: currentPalette,
      typography,
      shape: { borderRadius: 8 },
      shadows: shadows(themeMode),
      customShadows: customShadows(themeMode),
      templates: {
        page_wrap: {
          maxWidth: 'min(1440px, 100vw)',
          margin: 'auto',
          boxSizing: 'border-box',
          padding: '56px',
        },
        subheading: {
          textTransform: 'uppercase',
          letterSpacing: '6px',
          fontWeight: '700',
        },
        boxOfChips: {
          display: 'flex',
          justifyContent: 'left',
          flexWrap: 'wrap',
          gap: '8px',
        },
        chip: ({ size, backgroundColor }) => ({
          height: `${size * 32}px`,
          minHeight: `${size * 32}px`,
          backgroundColor: backgroundColor || 'transparent',
          borderRadius: '16px',
          padding: '8px',
          margin: '4px'
        })
      },
    });

    theme.components = componentsOverride(theme);

    return theme;
  }, [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

// ----------------------------------------------------------------------

// Define custom theme types
declare module '@mui/material/styles' {
  interface Theme {
    customShadows: {
      z1: string;
      z8: string;
      z12: string;
      z16: string;
      z20: string;
      z24: string;
      primary: string;
      secondary: string;
      info: string;
      success: string;
      warning: string;
      error: string;
      card: string;
      dialog: string;
      dropdown: string;
    };
    templates: {
      page_wrap: {
        maxWidth: string;
        margin: string;
        boxSizing: string;
        padding: string | number;
      };
      subheading: {
        textTransform: string;
        letterSpacing: string;
        fontWeight: string;
      };
      boxOfChips: {
        display: string;
        justifyContent: string;
        flexWrap: string;
        gap: string | number;
      };
      chip: (props: { size: number; backgroundColor: string }) => {
        height: string | number;
        minHeight: string | number;
        backgroundColor: string;
        borderRadius: string;
        padding: string | number;
        margin: string | number;
      };
    }
  }
  interface ThemeOptions {
    customShadows?: {
      z1?: string;
      z8?: string;
      z12?: string;
      z16?: string;
      z20?: string;
      z24?: string;
      primary?: string;
      secondary?: string;
      info?: string;
      success?: string;
      warning?: string;
      error?: string;
      card?: string;
      dialog?: string;
      dropdown?: string;
    };
    templates?: {
      page_wrap?: {
        maxWidth?: string;
        margin?: string;
        boxSizing?: string;
        padding?: string | number;
      };
      subheading?: {
        textTransform?: string;
        letterSpacing?: string;
        fontWeight?: string;
      };
      boxOfChips?: {
        display?: string;
        justifyContent?: string;
        flexWrap?: string;
        gap?: string | number;
      };
      chip?: (props: { size: number; backgroundColor: string }) => {
        height?: string | number;
        minHeight?: string | number;
        backgroundColor?: string;
        borderRadius?: string;
        padding?: string | number;
        margin?: string | number;
      };
    }
  }
}
