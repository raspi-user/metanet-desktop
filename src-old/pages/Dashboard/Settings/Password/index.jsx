import React, { useState, useContext } from 'react'
import style from './style'
import {
  Typography,
  Button,
  TextField,
  CircularProgress
} from '@mui/material'
import { makeStyles } from '@mui/styles'
import { toast } from 'react-toastify'
import UIContext from '../../../../UIContext'

const useStyles = makeStyles(style, { name: 'PasswordSettings' })

const PasswordSettings = ({ history }) => {
  const { saveLocalSnapshot } = useContext(UIContext)
  const classes = useStyles()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmitPassword = async e => {
    e.preventDefault()
    try {
      setLoading(true)
      const result = await window.CWI.changePassword(password, confirmPassword)
      if (result === true) {
        await saveLocalSnapshot()
        toast.dark('Password changed!')
        setPassword('')
        setConfirmPassword('')
      }
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Typography variant='h2' color='textPrimary' paragraph>Change Password</Typography>
      <Typography variant='body' color='textSecondary'>
        You will be prompted to enter your old password to confirm the change.
      </Typography>
      <form onSubmit={handleSubmitPassword}>
        <TextField
          style={{ marginTop: '1.5em' }}
          onChange={e => setPassword(e.target.value)}
          placeholder='New password'
          fullWidth
          type='password'
        />
        <br />
        <br />
        <TextField
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder='Retype password'
          fullWidth
          type='password'
        />
        <br />
        <br />
        <div className={classes.button_grid}>
          <Button
            color='primary'
            onClick={() => history.push('/recovery/lost-password')}
          >
            Forgot Password?
          </Button>
          <div />
          {loading
            ? <CircularProgress />
            : (
              <Button
                color='primary'
                variant='contained'
                type='submit'
              >
                Change
              </Button>
              )}
        </div>
      </form>
      <br />
      <br />
    </div>
  )
}

export default PasswordSettings
