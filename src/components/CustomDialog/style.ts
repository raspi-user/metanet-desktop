import { Theme } from '@mui/material/styles';

export default (theme: Theme) => ({
  root: {
    '& .MuiDialog-paper': {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      borderRadius: theme.shape.borderRadius,
      [theme.breakpoints.up('sm')]: {
        minWidth: '400px'
      }
    }
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.mode === 'light' ? '#1B365D' : theme.palette.background.default,
    color: theme.palette.mode === 'light' ? '#FFFFFF' : theme.palette.text.primary,
    '& img': {
      width: '32px',
      height: '32px'
    }
  },
  content: {
    padding: theme.spacing(3),
    '& .MuiDialogContent-root': {
      padding: 0
    }
  },
  actions: {
    padding: theme.spacing(2),
    gap: theme.spacing(1),
    '& .MuiButton-root': {
      minWidth: '100px'
    }
  }
});
