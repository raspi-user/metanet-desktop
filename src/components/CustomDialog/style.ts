import { Theme } from '@mui/material/styles';

export default (theme: Theme) => ({
  title_bg: {
    backgroundColor: '#FFFFFF', //theme.palette.background.default,
    marginBottom: theme.spacing(1),
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gridColumnGap: theme.spacing(2),
    alignItems: 'center',
  },
  title: {
    color: theme.palette.primary.main,
  },
  iconButton: {
    color: theme.palette.text.secondary,
  },
});
