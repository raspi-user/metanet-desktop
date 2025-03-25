import React, { ReactNode } from 'react';
import {
  Dialog,
  DialogTitle,
  Typography,
  useMediaQuery,
  DialogProps,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import Logo from '../Logo';
import style from './style';

const useStyles = makeStyles(style, { name: 'CustomDialog' });

interface CustomDialogProps extends DialogProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  minWidth?: string;
}

const CustomDialog: React.FC<CustomDialogProps> = ({ 
  title, 
  children, 
  actions,
  className = '',
  ...props 
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const isFullscreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      maxWidth={isFullscreen ? undefined : 'sm'}
      fullWidth={!isFullscreen}
      fullScreen={isFullscreen}
      className={`${classes.root} ${className}`}
      {...props}
    >
      <DialogTitle component="div" className={classes.title}>
        <Typography variant="h6">{title}</Typography>
      </DialogTitle>
      
      <DialogContent className={classes.content}>
        {children}
      </DialogContent>

      {actions && (
        <DialogActions className={classes.actions}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default CustomDialog;
