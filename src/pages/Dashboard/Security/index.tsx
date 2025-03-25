import React, { useContext, useState } from 'react'
import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material/styles'
import { 
  Typography, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material'
import { useHistory } from 'react-router-dom'
import { WalletContext } from '../../../UserInterface'
import ChangePassword from '../Settings/Password'
import RecoveryKey from '../Settings/RecoveryKey'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(3),
    maxWidth: '800px',
    margin: '0 auto'
  },
  section: {
    marginBottom: theme.spacing(4)
  },
  key: {
    userSelect: 'all',
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: '1.1em',
    padding: theme.spacing(2),
    background: theme.palette.action.hover,
    borderRadius: theme.shape.borderRadius,
    textAlign: 'center'
  }
}))

const Security: React.FC = () => {
  const classes = useStyles()
  const history = useHistory()
  const [showKeyDialog, setShowKeyDialog] = useState(false)
  const [recoveryKey, setRecoveryKey] = useState('')

  const handleViewKey = (key: string) => {
    setRecoveryKey(key)
    setShowKeyDialog(true)
  }

  const handleCloseDialog = () => {
    setShowKeyDialog(false)
    setRecoveryKey('')
  }

  return (
    <div className={classes.root}>
      <Typography variant='h1' color='textPrimary' paddingBottom='0.5em'>
        Security
      </Typography>
      <Typography variant='body1' color='textSecondary' paragraph>
        Manage your password and recovery key settings.
      </Typography>

      <div className={classes.section}>
        <ChangePassword history={history} />
      </div>

      <div className={classes.section}>
        <RecoveryKey history={history} onViewKey={handleViewKey} />
      </div>

      <Dialog
        open={showKeyDialog}
        onClose={handleCloseDialog}
        aria-labelledby="recovery-key-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="recovery-key-dialog-title">
          Your Recovery Key
        </DialogTitle>
        <DialogContent>
          <DialogContentText color="textSecondary" paragraph>
            Please save this key in a secure location. You will need it to recover your account if you forget your password.
          </DialogContentText>
          <Typography className={classes.key}>
            {recoveryKey}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default Security
