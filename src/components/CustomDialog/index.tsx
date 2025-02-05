import React, { ReactNode } from 'react';
import {
  Dialog,
  DialogTitle,
  Typography,
  useMediaQuery,
  DialogProps
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import Logo from '../Logo';
import style from './style'

const useStyles = makeStyles(style, { name: 'CustomDialog' });

interface CustomDialogProps extends DialogProps {
  title: string;
  children: ReactNode;
}

const CustomDialog: React.FC<CustomDialogProps> = ({ title, children, ...props }) => {
  const classes = useStyles();
  const theme = useTheme();
  const isFullscreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      maxWidth={isFullscreen ? undefined : 'sm'}
      fullWidth={!isFullscreen}
      fullScreen={isFullscreen}
      {...props}
    >
      <DialogTitle className={classes.title_bg}>
        <Typography className={classes.title} variant="h4">
          {title}
        </Typography>
        <Logo rotate color="white" size="2em" />
      </DialogTitle>
      {children}
    </Dialog>
  );
};

export default CustomDialog;
