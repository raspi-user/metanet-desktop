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

const KernelConfigurator = () => {
  const [open, setOpen] = useState(false)
  const [confederacyHost, setConfederacyHost] = useState('')
  const [secretServerURL, setSecretServerURL] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const settings = await window.CWI.getSettings()
      setConfederacyHost(settings.confederacyHost)
      setSecretServerURL(settings.secretServerURL)
      setLoading(false)
    })()
  }, [])

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const success = await window.CWI.setSettings({
        confederacyHost,
        secretServerURL
      })
      if (success) {
        setOpen(false)
      }
    } catch (e) {
      toast.success(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Resets back to what's in the kernel
  const handleCancel = async () => {
    setOpen(false)
    const settings = await window.CWI.getSettings()
    setConfederacyHost(settings.confederacyHost)
    setSecretServerURL(settings.secretServerURL)
    setLoading(false)
  }

  return (
    <>
      <CustomDialog
        open={open}
        onClose={handleCancel}
        title='MetaNet Kernel Settings (Advanced)'
      >
        <DialogContent>
          <DialogContentText>
            Set the desired URLs for the Confederacy overlay host (used to track user account tokens), and the secret server URL (used for phone number authentication).
          </DialogContentText>
          <br />
          <br />
          <TextField
            label='Confederacy Host'
            onChange={e => setConfederacyHost(e.target.value)}
            value={confederacyHost}
            disabled={loading}
            fullWidth
          />
          <br />
          <br />
          <TextField
            label='Secret Server URL'
            onChange={e => setSecretServerURL(e.target.value)}
            value={secretServerURL}
            disabled={loading}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          {loading && <CircularProgress />}
          {!loading && <Button
            onClick={handleCancel}
          >
            Cancel
          </Button>}
          {!loading && <Button
            color='primary'
            onClick={handleSubmit}
          >
            Submit
          </Button>}
        </DialogActions>
      </CustomDialog>
      <Button onClick={() => setOpen(true)}>Advanced Kernel Options</Button>
    </>
  )
}

export default KernelConfigurator
