export default theme => ({
  content_wrap: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    position: 'fixed',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
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
    borderRadius: theme.shape.borderRadius * 2,
    border: `1px solid ${theme.palette.divider}`,
    transition: theme.transitions.create(['box-shadow', 'background-color', 'border-color'], {
      duration: theme.transitions.duration.standard,
    }),
    '&.selected': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
    },
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      borderColor: theme.palette.primary.main,
    }
  },
  currencyButton: {
    padding: theme.spacing(2, 3),
    borderRadius: theme.shape.borderRadius,
    transition: theme.transitions.create(['box-shadow', 'background-color', 'border-color'], {
      duration: theme.transitions.duration.standard,
    }),
    '&.selected': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      borderColor: theme.palette.primary.main,
    },
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      borderColor: theme.palette.primary.main,
    }
  }
});
