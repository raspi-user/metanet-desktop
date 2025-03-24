// ----------------------------------------------------------------------

export const grey = {
  0: '#FFFFFF',
  100: '#F9FAFB',
  200: '#F4F6F8',
  300: '#DFE3E8',
  400: '#C4CDD5',
  500: '#919EAB',
  600: '#637381',
  700: '#454F5B',
  800: '#212B36',
  900: '#161C24',
};

export const primary = {
  lighter: '#C8FACD',
  light: '#5BE584',
  main: '#1B365D', // Navy from your existing theme
  dark: '#15294A',
  darker: '#0E1B31',
  contrastText: '#FFFFFF',
};

export const secondary = {
  lighter: '#D6E4FF',
  light: '#84A9FF',
  main: '#2C5282', // Teal from your existing theme
  dark: '#1E3A5F',
  darker: '#091A7A',
  contrastText: '#FFFFFF',
};

export const info = {
  lighter: '#D0F2FF',
  light: '#74CAFF',
  main: '#1890FF',
  dark: '#0C53B7',
  darker: '#04297A',
  contrastText: '#FFFFFF',
};

export const success = {
  lighter: '#E9FCD4',
  light: '#AAF27F',
  main: '#54D62C',
  dark: '#229A16',
  darker: '#08660D',
  contrastText: grey[800],
};

export const warning = {
  lighter: '#FFF7CD',
  light: '#FFE16A',
  main: '#FFC107',
  dark: '#B78103',
  darker: '#7A4F01',
  contrastText: grey[800],
};

export const error = {
  lighter: '#FFE7D9',
  light: '#FFA48D',
  main: '#FF4842',
  dark: '#B72136',
  darker: '#7A0C2E',
  contrastText: '#FFFFFF',
};

export const common = {
  black: '#000000',
  white: '#FFFFFF',
};

export default function palette(themeMode) {
  const light = {
    ...common,
    mode: 'light',
    primary: {
      ...primary,
    },
    secondary: {
      ...secondary,
    },
    info: {
      ...info,
    },
    success: {
      ...success,
    },
    warning: {
      ...warning,
    },
    error: {
      ...error,
    },
    grey: {
      ...grey
    },
    text: {
      primary: grey[800],
      secondary: grey[700],
      disabled: grey[500],
    },
    background: {
      paper: '#FFFFFF',
      default: '#FFFFFF',
      neutral: grey[200],
    },
    action: {
      active: grey[600],
      hover: grey[100],
      selected: grey[300],
      disabled: grey[500],
      disabledBackground: grey[300],
      focus: grey[500],
      hoverOpacity: 0.08,
      disabledOpacity: 0.48,
    },
  };

  const dark = {
    ...common,
    mode: 'dark',
    primary: {
      ...primary,
      main: '#FFFFFF', // From your existing dark theme
    },
    secondary: {
      ...secondary,
    },
    info: {
      ...info,
    },
    success: {
      ...success,
    },
    warning: {
      ...warning,
    },
    error: {
      ...error,
    },
    grey: {
      ...grey
    },
    text: {
      primary: '#FFFFFF',
      secondary: grey[500],
      disabled: grey[600],
    },
    background: {
      paper: '#1D2125',
      default: '#1D2125',
      neutral: grey[700],
    },
    action: {
      active: grey[500],
      hover: grey[800],
      selected: grey[700],
      disabled: grey[600],
      disabledBackground: grey[700],
      focus: grey[700],
      hoverOpacity: 0.24,
      disabledOpacity: 0.48,
    },
  };

  return themeMode === 'light' ? light : dark;
}
