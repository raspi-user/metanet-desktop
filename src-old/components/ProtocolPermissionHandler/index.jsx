import React, { useState, useEffect, useContext } from 'react'
import { DialogContent, DialogContentText, DialogActions, Button } from '@mui/material'
import CustomDialog from '../CustomDialog/index.jsx'
import UIContext from '../../UIContext'
import AppChip from '../AppChip'
import ProtoChip from '../ProtoChip'

const ProtocolPermissionHandler = () => {
  const {
    onFocusRequested,
    onFocusRelinquished,
    isFocused
  } = useContext(UIContext)
  const [wasOriginallyFocused, setWasOriginallyFocused] = useState(false)
  const [open, setOpen] = useState(false)

  const [perms, setPerms] = useState([
    // requestID
    // originator
    // protocolID
    // protocolSecurityLevel
    // counterparty
    // description
    // renewal
  ])

  const handleCancel = () => {
    window.CWI.denyProtocolPermission({ requestID: perms[0].requestID })
    setPerms(p => {
      p.shift()
      if (p.length === 0) {
        setOpen(false)
        if (!wasOriginallyFocused) {
          onFocusRelinquished()
        }
      }
      return [...p]
    })
  }

  const handleGrant = () => {
    window.CWI.grantProtocolPermission({ requestID: perms[0].requestID })
    setPerms(p => {
      p.shift()
      if (p.length === 0) {
        setOpen(false)
        if (!wasOriginallyFocused) {
          onFocusRelinquished()
        }
      }
      return [...p]
    })
  }

  useEffect(() => {
    let id
    (async () => {
      id = await window.CWI.bindCallback(
        'onProtocolPermissionRequested',
        async ({
          requestID,
          protocolSecurityLevel,
          protocolID,
          counterparty,
          originator,
          description,
          renewal
        }) => {
          setOpen(true)
          const wasOriginallyFocused = await isFocused()
          if (!wasOriginallyFocused) {
            await onFocusRequested()
          }
          if (perms.length === 0) {
            setWasOriginallyFocused(wasOriginallyFocused)
          }
          setPerms(p => {
            p.push({
              requestID,
              protocolSecurityLevel,
              protocolID,
              counterparty,
              originator,
              description,
              renewal
            })
            return [...p]
          })
        }
      )
    })()
    return () => {
      if (id) {
        window.CWI.unbindCallback('onProtocolPermissionRequested', id)
      }
    }
  }, [])

  if (typeof perms[0] === 'undefined') {
    return null
  }

  return (
    <CustomDialog
      open={open}
      // onClose={handleCancel}
      title={perms[0].protocolID === 'identity resolution' ? 'Trusted Entities Access Request' : (!perms[0].renewal ? 'Protocol Access Request' : 'Protocol Access Renewal')}
    >
      <DialogContent style={{
        textAlign: 'center',
        padding: '1em',
        flex: 'none'
      }}
      >

        <DialogContentText>
          <br />
          {perms[0].protocolID === 'identity resolution' ? 'An app is requesting access to lookup identity information using the entities you trust.' : 'An app is requesting to talk in a specific language (protocol) using your information.'}
        </DialogContentText>
        <br />
        <center>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gridGap: '0.2em', alignItems: 'center', width: 'min-content', gridGap: '2em' }}>
            <span>app:</span>
            {perms[0].originator && <div>
              <AppChip
                size={2.5}
                showDomain
                label={perms[0].originator}
                clickable={false}
              />
            </div>}
          </div>
          <br />
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gridGap: '0.2em', alignItems: 'center', width: 'min-content', gridGap: '2em' }}>
            <span>protocol:</span>
            <div>
              <ProtoChip
                securityLevel={perms[0].protocolSecurityLevel}
                protocolID={perms[0].protocolID}
                counterparty={perms[0].counterparty}
              />
            </div>
          </div>
          <br />
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gridGap: '0.2em', alignItems: 'center', gridGap: '2em', margin: '0px 1.5em' }}>
            <span>reason:</span>
            <DialogContentText>
              {perms[0].description}
            </DialogContentText>
          </div>
        </center>
      </DialogContent>
      <DialogActions style={{
        justifyContent: 'space-around',
        padding: '1em',
        flex: 'none'
      }}
      >
        <Button
          onClick={handleCancel}
          color='primary'
        >
          Deny
        </Button>
        <Button
          color='primary'
          onClick={handleGrant}
        >
          Grant
        </Button>
      </DialogActions>
    </CustomDialog>
  )
}

export default ProtocolPermissionHandler
