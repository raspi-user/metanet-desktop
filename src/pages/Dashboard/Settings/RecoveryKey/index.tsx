import { useState, useContext } from 'react'
import {
  Typography, Button, CircularProgress
} from '@mui/material'
import { toast } from 'react-toastify'
import { makeStyles } from '@mui/styles'
import { WalletContext } from '../../../../UserInterface'
import { Utils } from '@bsv/sdk'

const useStyles = makeStyles(theme => ({
  key: {
    userSelect: 'all',
    cursor: 'pointer'
  },
  button_grid: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    gridGap: (theme as any).spacing(2)
  }
}), { name: 'RecoveryKey' })

const RecoveryKeySettings = ({ history }) => {
  const { managers } = useContext(WalletContext)
  const [recoveryKey, setRecoveryKey] = useState('')
  const [showLoading, setShowLoading] = useState(false)
  const [changeLoading, setChangeLoading] = useState(false)
  const classes = useStyles()

  const handleViewKey = async () => {
    try {
      if (recoveryKey) {
        setRecoveryKey('')
        return
      }
      setShowLoading(true)
      setRecoveryKey(
        Utils.toBase64(await managers.walletManager.getRecoveryKey())
      )
    } finally {
      setShowLoading(false)
    }
  }

  const handleChangeKey = async () => {
    try {
      setChangeLoading(true)
      await managers.walletManager.changeRecoveryKey()
      setRecoveryKey('')
      localStorage.snap = Utils.toBase64(managers.walletManager.saveSnapshot())
      toast.dark('Recovery key changed!')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setChangeLoading(false)
    }
  }

  return (
    <>
      <Typography variant='h2' color='textPrimary' paragraph>Recovery Key</Typography>
      <Typography variant='body1' color='textSecondary'>
        You will need your recovery key if you ever forget your password or lose your phone.
      </Typography>
      <Typography>
        Current recovery key:{' '}
        <b className={classes.key}>{recoveryKey || '••••••••••••'}</b>
      </Typography>
      <br />
      <div className={classes.button_grid}>
        {showLoading
          ? <CircularProgress />
          : (
            <Button
              color='primary'
              onClick={handleViewKey}
            >
              {recoveryKey ? 'Hide' : 'View'}
            </Button>
          )}
        <div />
        {changeLoading
          ? <CircularProgress />
          : (
            <Button
              onClick={handleChangeKey}
              color='primary'
              variant='contained'
            >
              Change
            </Button>
          )}
      </div>
      <br />
      <br />
    </>
  )
}

export default RecoveryKeySettings
