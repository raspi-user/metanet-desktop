import React, { useState, useEffect } from 'react'
import {
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox
} from '@mui/material'
import CustomDialog from './CustomDialog/index.jsx'
import LockIcon from '@mui/icons-material/Lock'
import DownloadIcon from '@mui/icons-material/Download'
import exportDataToFile from '../utils/exportDataToFile.js'

const RecoveryKeyHandler = () => {
  const [open, setOpen] = useState(false)
  const [recoveryKey, setRecoveryKey] = useState('')
  const [myResponsibility, setMyResponsibility] = useState(false)
  const [atLeastTwo, setAtLeastTwo] = useState(false)

  useEffect(() => {
    let id
    (async () => {
      id = await window.CWI.bindCallback(
        'onRecoveryKeyNeedsSaving',
        keyToSave => {
          setRecoveryKey(keyToSave)
          setOpen(true)
        }
      )
    })()
    return () => {
      if (id) {
        window.CWI.unbindCallback('onRecoveryKeyNeedsSaving', id)
      }
    }
  }, [])

  const onKeySaved = async () => {
    await window.CWI.saveRecoveryKey()
    setOpen(false)
  }

  const handleDownload = async () => {
    const recoveryKeyData = `MetaNet Recovery Key:\n\n${recoveryKey}\n\nSaved: ${new Date()}`
    exportDataToFile({
      data: recoveryKeyData,
      filename: 'MetaNet Recovery Key.txt',
      type: 'text/plain'
    })
  }

  return (
    <CustomDialog
      open={open}
      title='Save Your MetaNet Recovery Key'
    >
      <DialogContent>
        <DialogContentText>
          The security of your MetaNet identity depends on saving your recovery key in case you lose your phone or password:
        </DialogContentText>
        <br />
        <DialogContentText>
          <b
            style={{
              userSelect: 'all',
              wordWrap: 'break-word'
            }}
          >
            {recoveryKey}
          </b>
        </DialogContentText>
        <DialogContentText>
          <ul>
            <li>Take a screenshot</li>
            <li>Email it to yourself</li>
            <li>Write it down and put it in a safe</li>
          </ul>
        </DialogContentText>
        <center style={{ marginBottom: '0.5em' }}>
          <Button
            color='primary'
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
          >
            Download Local File
          </Button>
        </center>
        <DialogContentText>
          You need <b>at least two</b> of your phone, password and recovery key to log into your MetaNet identity. No one can help you if you lose access.
        </DialogContentText>
        <FormControlLabel
          control={<Checkbox
            checked={myResponsibility}
            onChange={() => setMyResponsibility(x => !x)}
          />}
          label='My Responsibility'
        />
        <br />
        <FormControlLabel
          control={<Checkbox
            checked={atLeastTwo}
            onChange={() => setAtLeastTwo(x => !x)}
          />}
          label='...at least two...'
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            window.CWI.abortRecoveryKey()
            setRecoveryKey('')
            setOpen(false)
          }}
          color='secondary'
        >
          Abort & Cancel
        </Button>
        <Button
          onClick={onKeySaved}
          color='primary'
          endIcon={<LockIcon />}
          disabled={(!myResponsibility) || (!atLeastTwo)}
        >
          Securely Saved
        </Button>
      </DialogActions>
    </CustomDialog>
  )
}

export default RecoveryKeyHandler
