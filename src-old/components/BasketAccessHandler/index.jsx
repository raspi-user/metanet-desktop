import React, { useState, useEffect, useContext } from 'react'
import { DialogContent, DialogContentText, DialogActions, Button } from '@mui/material'
import CustomDialog from '../CustomDialog/index.jsx'
import UIContext from '../../UIContext'
import AppChip from '../AppChip'
import BasketChip from '../BasketChip'

const BasketAccessHandler = () => {
  const {
    onFocusRequested,
    onFocusRelinquished,
    isFocused
  } = useContext(UIContext)
  const [wasOriginallyFocused, setWasOriginallyFocused] = useState(false)
  const [open, setOpen] = useState(false)
  const [perms, setPerms] = useState([
    // originator
    // requestID
    // basket
    // description
    // renewal
  ])

  const handleCancel = () => {
    window.CWI.denyBasketAccess({ requestID: perms[0].requestID })
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
    window.CWI.grantBasketAccess({ requestID: perms[0].requestID })
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
        'onBasketAccessRequested',
        async ({
          requestID,
          basket,
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
              basket,
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
        window.CWI.unbindCallback('onBasketAccessRequested', id)
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
      title={!perms[0].renewal ? 'Basket Access Request' : 'Basket Access Renewal'}
    >
      <DialogContent style={{
        textAlign: 'center',
        padding: '1em',
        flex: 'none'
      }}
      >
        <DialogContentText>
          <br />
          An app is requesting to access some tokens ("things") stored in one of your baskets.
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
            <span>basket:</span>
            <div>
              <BasketChip
                basketId={perms[0].basket}
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
      <br />
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

export default BasketAccessHandler
