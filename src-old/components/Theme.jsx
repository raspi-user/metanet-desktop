import React from 'react'
import { createTheme, ThemeProvider, StyledEngineProvider, adaptV4Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import { ExchangeRateContextProvider } from './AmountDisplay/ExchangeRateContextProvider'

const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

if (prefersDarkScheme.matches) {
  console.log('User prefers a dark theme');
} else {
  console.log('User prefers a light theme');
}

const baseTheme = createTheme(adaptV4Theme({
  spacing: 8,
  maxContentWidth: '1440px',
  typography: {
    h1: {
      fontWeight: 'bold',
      fontSize: '2.5em'
    },
    h2: {
      fontWeight: 'bold',
      fontSize: '1.7em'
    },
    h3: {
      fontSize: '1.4em'
    },
    h4: {
      fontSize: '1.25em'
    },
    h5: {
      fontSize: '1.1em'
    },
    h6: {
      fontSize: '1em'
    }
  },
  palette: {
    primary: {
      main: '#424242'
    },
    secondary: {
      main: '#FC433F'
    }
  },
  overrides: {}
}))

const extendedTheme = theme => ({
  ...theme,
  typography: {
    ...theme.typography,
    h1: {
      ...theme.typography.h1,
      [theme.breakpoints.down('md')]: {
        fontSize: '1.8em'
      }
    },
    h2: {
      ...theme.typography.h2,
      [theme.breakpoints.down('md')]: {
        fontSize: '1.6em'
      }
    }
  },
  templates: {
    page_wrap: {
      maxWidth: `min(${theme.maxContentWidth}, 100vw)`,
      margin: 'auto',
      boxSizing: 'border-box',
      padding: theme.spacing(7),
      [theme.breakpoints.down('lg')]: {
        padding: theme.spacing(5)
      }
    },
    subheading: {
      textTransform: 'uppercase',
      letterSpacing: '6px',
      fontWeight: '700'
    },
    boxOfChips: {
      display: 'flex',
      justifyContent: 'left',
      flexWrap: 'wrap'
    },
    chipContainer: {
      fontSize: '0.95em',
      display: 'flex',
      flexDirection: 'column',
      alignContent: 'center',
      alignItems: 'center',
      '&:hover $expiryHoverText': {
        visibility: 'visible',
        opacity: 1
      },
      marginLeft: '0.4em'
    },
    expiryHoverText: {
      fontSize: '0.95em',
      color: theme.palette.text.color,
      textAlign: 'center',
      visibility: 'hidden',
      opacity: 0,
      transition: 'all 0.3301s'
    },
    chip: ({ size = 1, backgroundColor } = {}) => {
      const base = {
        height: '100%',
        width: '100%',
        paddingTop: `${8 * size}px`,
        paddingBottom: `${8 * size}px`,
        paddingLeft: `${3 * size}px`,
        paddingRight: `${3 * size}px`
      }
      if (typeof backgroundColor === 'string') {
        base.backgroundColor = backgroundColor
      }
      return base
    },
    chipLabel: {
      maxWidth: '40em',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textAlign: 'left'
    },
    chipLabelTitle: ({ size = 1 } = {}) => {
      return {
        fontSize: `${size}em`,
        maxWidth: '49em',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap'
      }
    },
    chipLabelSubtitle: {
      fontSize: '0.9em',
      maxWidth: '49em',
      wordWrap: 'break-word',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textAlign: 'left'
    }
  }
})

const Theme = withStyles({
  '@global html': {
    padding: '0px',
    margin: '0px'
  },
  '@global body': {
    padding: '0px',
    margin: '0px',
    fontFamily: 'helvetica'
  },
  '@global a': {
    textDecoration: 'none',
    color: '#424242'
  },
  '@global h1': {
    fontWeight: 'bold',
    fontSize: '2.5em'
  },
  '@global h2': {
    fontWeight: 'bold',
    fontSize: '1.7em'
  },
  '@global h3': {
    fontSize: '1.4em'
  },
  '@global h4': {
    fontSize: '1.25em'
  },
  '@global h5': {
    fontSize: '1.1em'
  },
  '@global h6': {
    fontSize: '1em'
  }
})(({ children }) => (
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={baseTheme}>
      <ThemeProvider theme={extendedTheme}>
        <ExchangeRateContextProvider>
          {children}
        </ExchangeRateContextProvider>
      </ThemeProvider>
    </ThemeProvider>
  </StyledEngineProvider>
))

export default Theme
