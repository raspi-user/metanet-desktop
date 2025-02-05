import React, { useState, useEffect } from 'react'
import {
  DialogActions,
  DialogContent,
  Button,
  DialogContentText,
  TextField,
  CircularProgress
} from '@mui/material'
import CustomDialog from './CustomDialog/index.jsx'
import { toast } from 'react-toastify'

const CodeHandler = () => {
  const [open, setOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [reason, setReason] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let id
    (async () => {
      id = await window.CWI.bindCallback('onCodeRequired', ({ phone, reason }) => {
        setPhone(phone)
        setReason(reason)
        setOpen(true)
      })
    })()
    return () => {
      if (id) {
        window.CWI.unbindCallback('onCodeRequired', id)
      }
    }
  }, [])

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const success = await window.CWI.submitCode(code)
      if (success) {
        setOpen(false)
      }
    } catch (e) {
      toast.success(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <CustomDialog
      open={open}
      onClose={() => {
        window.CWI.abortCode()
        setOpen(false)
      }}
      title='Code Sent'
    >
      <DialogContent>
        <DialogContentText>
          We just sent a 6-digit code to {phone} as a text message.
        </DialogContentText>
        <DialogContentText>
          {reason}.
        </DialogContentText>
        <br />
        <br />
        <center>
          <TextField
            label='Enter Code'
            onChange={e => setCode(e.target.value)}
            disabled={loading}
          />
        </center>
      </DialogContent>
      <DialogActions>
        {loading && <CircularProgress />}
        {!loading && <Button
          color='primary'
          onClick={handleSubmit}
        >
          submit
        </Button>}
      </DialogActions>
    </CustomDialog>
  )
}

export default CodeHandler
