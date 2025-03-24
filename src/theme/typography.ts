// ----------------------------------------------------------------------

export default function typography() {
  return {
    fontFamily: '"Helvetica", "Arial", sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      '@media (max-width:900px)': {
        fontSize: '1.8rem',
      },
    },
    h2: {
      fontWeight: 700,
      fontSize: '1.7rem',
      lineHeight: 1.3,
      '@media (max-width:900px)': {
        fontSize: '1.6rem',
      },
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.4rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.1rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    subtitle1: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    subtitle2: {
      fontWeight: 600,
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.57,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
    },
    overline: {
      fontWeight: 700,
      lineHeight: 1.5,
      fontSize: '0.75rem',
      textTransform: 'uppercase',
    },
    button: {
      fontWeight: 700,
      lineHeight: 24 / 14,
      fontSize: '0.875rem',
      textTransform: 'none',
    },
  };
}
