// ----------------------------------------------------------------------

import { alpha } from '@mui/material/styles';
import { grey, primary, secondary, info, success, warning, error } from './palette';

// ----------------------------------------------------------------------

export default function customShadows(themeMode) {
  const isLight = themeMode === 'light';

  const transparent = isLight ? 'rgba(0, 0, 0, 0.16)' : 'rgba(0, 0, 0, 0.24)';

  const primaryColor = isLight ? primary.main : primary.dark;
  const secondaryColor = isLight ? secondary.main : secondary.dark;
  const infoColor = isLight ? info.main : info.dark;
  const successColor = isLight ? success.main : success.dark;
  const warningColor = isLight ? warning.main : warning.dark;
  const errorColor = isLight ? error.main : error.dark;

  return {
    z1: `0 1px 2px 0 ${transparent}`,
    z8: `0 8px 16px 0 ${transparent}`,
    z12: `0 12px 24px -4px ${transparent}`,
    z16: `0 16px 32px -4px ${transparent}`,
    z20: `0 20px 40px -4px ${transparent}`,
    z24: `0 24px 48px 0 ${transparent}`,
    //
    primary: `0 8px 16px 0 ${alpha(primaryColor, 0.24)}`,
    secondary: `0 8px 16px 0 ${alpha(secondaryColor, 0.24)}`,
    info: `0 8px 16px 0 ${alpha(infoColor, 0.24)}`,
    success: `0 8px 16px 0 ${alpha(successColor, 0.24)}`,
    warning: `0 8px 16px 0 ${alpha(warningColor, 0.24)}`,
    error: `0 8px 16px 0 ${alpha(errorColor, 0.24)}`,
    //
    card: `0 0 2px 0 ${alpha(grey[500], 0.08)}, 0 12px 24px -4px ${alpha(grey[500], 0.08)}`,
    dialog: `-40px 40px 80px -8px ${alpha(grey[500], 0.24)}`,
    dropdown: `0 0 2px 0 ${alpha(grey[500], 0.24)}, -20px 20px 40px -4px ${alpha(grey[500], 0.24)}`,
  };
}
