export default theme => ({
  content_wrap: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    position: 'fixed',
    display: 'grid',
    placeItems: 'center',
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
    backgroundBlendMode: 'soft-light'
  },
  content: {
    margin: 'auto',
    maxWidth: '90%',
    width: '100%',
    [theme.breakpoints.up('md')]: {
      maxWidth: '70%'
    }
  },
  field: {
    width: '80%',
    marginBottom: theme.spacing(5)
  },
  button: {
    marginBottom: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    '&:hover': {
      backgroundColor: theme.palette.action.hover
    }
  },
  themeButton: {
    width: 120,
    height: 120,
    borderRadius: 10,
    transition: theme.transitions.create(['box-shadow', 'background-color'], {
      duration: theme.transitions.duration.standard,
    }),
    '&.selected': {
      boxShadow: `0px 0px 8px 2px ${theme.palette.secondary.main}`,
    },
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    }
  },
  currencyButton: {
    padding: '0.5em 1em',
    transition: theme.transitions.create(['box-shadow', 'background-color', 'color'], {
      duration: theme.transitions.duration.standard,
    }),
    '&.selected': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
      boxShadow: `0px 0px 8px 2px ${theme.palette.secondary.main}`,
    },
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    }
  }
});
