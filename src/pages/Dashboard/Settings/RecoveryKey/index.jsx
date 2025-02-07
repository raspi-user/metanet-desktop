import React, { useState, useContext } from 'react'
import {
  Typography, Button, CircularProgress
} from '@mui/material'
import { toast } from 'react-toastify'
import { makeStyles } from '@mui/styles'
import UIContext from '../../../../UIContext'

const useStyles = makeStyles(theme => ({
  key: {
    userSelect: 'all',
    cursor: 'pointer'
  },
  button_grid: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    gridGap: theme.spacing(2)
  }
}), { name: 'RecoveryKey' })

const RecoveryKeySettings = ({ history }) => {
  const { saveLocalSnapshot } = useContext(UIContext)
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
        await window.CWI.getRecoveryKey()
      )
    } finally {
      setShowLoading(false)
    }
  }

  const handleChangeKey = async () => {
    try {
      setChangeLoading(true)
      const success = await window.CWI.changeRecoveryKey()
      if (success === true) {
        setRecoveryKey('')
        await saveLocalSnapshot()
        toast.dark('Recovery key changed!')
      }
    } catch (e) {
      toast.error(e.message)
    } finally {
      setChangeLoading(false)
    }
  }

  return (
    <>
      <Typography variant='h2' color='textPrimary' paragraph>Recovery Key</Typography>
      <Typography variant='body' color='textSecondary'>
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
