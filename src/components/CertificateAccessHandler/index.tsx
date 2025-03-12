import { useState, useEffect, useContext, SetStateAction, FC, Dispatch } from 'react'
import { DialogContent, DialogContentText, DialogActions, Button } from '@mui/material'
// import boomerang from 'boomerang-http'
import CustomDialog from '../CustomDialog/index.jsx'
import { WalletContext } from '../../UserInterface.js'
import AppChip from '../AppChip'
import CertificateChip from '../CertificateChip/index'
import { PermissionEventHandler, PermissionRequest } from '@bsv/wallet-toolbox-client'

type CertificateAccessRequest = {
  requestID: string
  certificateType?: string
  fields?: object
  verifierPublicKey?: string //TODO update
  originator: string
  description?: string
  renewal?: boolean
}

const CertificateAccessHandler: FC<{
  setCertificateAccessHandler: Dispatch<SetStateAction<PermissionEventHandler>>
}> = ({ setCertificateAccessHandler }) => {
  const {
    onFocusRequested,
    onFocusRelinquished,
    isFocused,
    managers
  } = useContext(WalletContext)
  const [wasOriginallyFocused, setWasOriginallyFocused] = useState(false)
  const [open, setOpen] = useState(false)
  const [perms, setPerms] = useState<Array<any>>([
    // originator
    // requestID
    // certificateType
    // fields
    // verifierPublicKey
    // description
    // renewal`
  ])

  // The single "pending" request data
  // const [request, setRequest] = useState<CertificateAccessRequest | null>(null)

  // const closeDialog = async () => {
  //   setOpen(false)
  //   setRequest(null)
  //   // If we weren't focused before, relinquish
  //   if (!wasOriginallyFocused) {
  //     await onFocusRelinquished()
  //   }
  // }

  const handleGrant = async () => {
    managers.permissionsManager!.grantPermission({
      requestID: perms[0].requestID
    })
    setPerms(prev => {
      const newPerms = prev.slice(1)
      if (newPerms.length === 0) {
        setOpen(false)
        if (!wasOriginallyFocused) {
          onFocusRelinquished()
        }
      }
      return newPerms
    })
  }

  const handleDeny = async () => {
    managers.permissionsManager!.denyPermission(perms[0].requestID)
    setPerms(prev => {
      const newPerms = prev.slice(1)
      if (newPerms.length === 0) {
        setOpen(false)
        if (!wasOriginallyFocused) {
          onFocusRelinquished()
        }
      }
      return newPerms
    })
  }

  // const handleDialogClose = async () => {
  //   // If user closes via the "X" (or otherwise):
  //   managers.permissionsManager!.denyPermission(request!.requestID)
  //   // if (rejectFn) rejectFn(new Error('User closed basket access request dialog'))
  //   await closeDialog()
  // }

  useEffect(() => {
    setCertificateAccessHandler((): PermissionEventHandler => {
      return async (args: PermissionRequest & { requestID: string }): Promise<void> => {
        const {
          requestID,
          originator,
          renewal,
          certificate,
          reason
        } = args
        const {
          certType,
          fields,
          verifier
        } = certificate!

        // Save request + resolvers in state
        // setRequest(incomingRequest)
        setOpen(true)

        // Focus logic
        const currentlyFocused = await isFocused()
        setWasOriginallyFocused(currentlyFocused)
        if (!currentlyFocused) {
          await onFocusRequested()
        }
        if (perms.length === 0) {
          setWasOriginallyFocused(wasOriginallyFocused)
        }
        setPerms(p => {
          const newItem = {
            originator,
            verifierPublicKey: verifier,
            certificateType: certType,
            fields,
            renewal,
            requestID,
            description: reason
          }
          return [...p, newItem]
        })
      }
    })
  }, [])

  if (typeof perms[0] === 'undefined') {
    return null
  }

  return (
    <CustomDialog
      open={open}
      // onClose={handleCancel}
      title={!perms[0].renewal
        ? 'Certificate Access Request'
        : 'Certificate Access Renewal'
      }
    >
      <DialogContent style={{
        textAlign: 'center',
        padding: '1em',
        flex: 'none'
      }}
      >
        <DialogContentText>
          <br />
          Someone wants to use an app to look at some of your digital certificates.
        </DialogContentText>
        <br />
        <center>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gridGap: '2em', alignItems: 'center', width: 'min-content' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gridGap: '2em', alignItems: 'center', width: 'min-content' }}>
            <span>certificate:</span>
            <div>
              <CertificateChip
                certType={perms[0].certificateType}
                fieldsToDisplay={perms[0].fields}
                verifier={perms[0].verifierPublicKey}
              />
            </div>
          </div>
          <br />
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gridGap: '2em', alignItems: 'center', margin: '0px 1.5em' }}>
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
          onClick={handleDeny}
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

export default CertificateAccessHandler
