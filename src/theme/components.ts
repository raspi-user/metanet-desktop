// ----------------------------------------------------------------------

export default function componentsOverride(theme) {
  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: theme.palette.background.default,
          backgroundImage: theme.palette.mode === 'light' 
            ? `linear-gradient(45deg, rgba(27, 54, 93, 0.05), rgba(44, 82, 130, 0.05))`
            : `linear-gradient(45deg, rgba(27, 54, 93, 0.1), rgba(44, 82, 130, 0.1))`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          position: 'relative',
          boxShadow: theme.customShadows.card,
          borderRadius: 12,
          zIndex: 0,
          border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'}`,
        },
      },
    },
    MuiCardHeader: {
      defaultProps: {
        titleTypographyProps: { variant: 'h6' },
        subheaderTypographyProps: { variant: 'body2' },
      },
      styleOverrides: {
        root: {
          padding: theme.spacing(3, 3, 0),
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: theme.spacing(3),
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          backgroundColor: theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.primary.main,
          color: theme.palette.mode === 'light' ? theme.palette.primary.contrastText : theme.palette.primary.dark,
          '&:hover': {
            backgroundColor: theme.palette.mode === 'light' ? theme.palette.primary.dark : theme.palette.grey[100],
          },
        },
        outlined: {
          borderColor: theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.primary.main,
          color: theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.primary.main,
          '&:hover': {
            backgroundColor: theme.palette.mode === 'light' ? 'rgba(27, 54, 93, 0.04)' : 'rgba(255, 255, 255, 0.08)',
            borderColor: theme.palette.mode === 'light' ? theme.palette.primary.dark : theme.palette.grey[100],
          },
        },
        sizeLarge: {
          height: 48,
        },
        // contained & fab
        containedInherit: {
          color: theme.palette.grey[800],
          boxShadow: theme.customShadows.z8,
          '&:hover': {
            backgroundColor: theme.palette.grey[400],
          },
        },
        containedPrimary: {
          boxShadow: theme.customShadows.primary,
        },
        containedSecondary: {
          boxShadow: theme.customShadows.secondary,
        },
        containedInfo: {
          boxShadow: theme.customShadows.info,
        },
        containedSuccess: {
          boxShadow: theme.customShadows.success,
        },
        containedWarning: {
          boxShadow: theme.customShadows.warning,
        },
        containedError: {
          boxShadow: theme.customShadows.error,
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: false,
      },
    },
    MuiLink: {
      defaultProps: {
        underline: 'hover',
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: theme.shape.borderRadius,
          backgroundColor: theme.palette.mode === 'light' ? theme.palette.common.white : theme.palette.background.paper,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: theme.palette.text.secondary,
          backgroundColor: theme.palette.background.neutral,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: theme.palette.action.selected,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          },
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          borderTop: `solid 1px ${theme.palette.divider}`,
        },
        toolbar: {
          height: 64,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.background.paper,
          color: theme.palette.mode === 'light' ? theme.palette.common.white : theme.palette.text.primary,
          boxShadow: theme.customShadows.z8,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: theme.palette.background.default,
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: theme.palette.grey[800],
        },
        arrow: {
          color: theme.palette.grey[800],
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.MuiChip-filled': {
            backgroundColor: theme.palette.grey[300],
            color: theme.palette.grey[800],
          },
          '&.MuiChip-outlined': {
            borderColor: theme.palette.grey[500_32],
          },
        },
        label: {
          fontWeight: 500,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: 18,
          fontWeight: 600,
          paddingTop: theme.spacing(3),
          paddingBottom: theme.spacing(1),
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          '&::placeholder': {
            opacity: 0.8,
            color: theme.palette.text.disabled,
          },
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: theme.palette.grey[500_8],
          '&:hover': {
            backgroundColor: theme.palette.grey[500_16],
          },
          '&.Mui-focused': {
            backgroundColor: theme.palette.action.focus,
          },
          '&.Mui-disabled': {
            backgroundColor: theme.palette.action.disabledBackground,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: theme.shape.borderRadius,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.grey[500_32],
          },
          '&.Mui-disabled': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.action.disabledBackground,
            },
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          padding: 0,
          fontWeight: 600,
          borderTopLeftRadius: theme.shape.borderRadius,
          borderTopRightRadius: theme.shape.borderRadius,
          textTransform: 'none',
          '&.Mui-selected': {
            color: theme.palette.text.primary,
          },
        },
      },
    },
    MuiList: {
      styleOverrides: {
        padding: {
          paddingTop: 4,
          paddingBottom: 4,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          paddingTop: 8,
          paddingBottom: 8,
          borderRadius: theme.shape.borderRadius,
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 24,
          marginRight: 16,
          '& svg': {
            fontSize: 20,
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          boxShadow: theme.customShadows.z8,
          backgroundColor: theme.palette.grey[500_24],
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          '&.Mui-expanded': {
            margin: 0,
            '&:before': {
              opacity: 0,
            },
          },
          '&.Mui-disabled': {
            backgroundColor: 'transparent',
          },
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: theme.palette.grey[800_30],
          backdropFilter: 'blur(6px)',
        },
        invisible: {
          background: 'transparent',
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          boxShadow: theme.customShadows.dropdown,
        },
        listbox: {
          padding: theme.spacing(1, 0),
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          boxShadow: theme.customShadows.dialog,
          borderRadius: 16,
        },
      },
    },
  };
}
