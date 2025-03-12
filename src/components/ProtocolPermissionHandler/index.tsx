import { Dispatch, SetStateAction, useState, useEffect, useContext } from 'react'
import { DialogContent, DialogContentText, DialogActions, Button } from '@mui/material'
import CustomDialog from '../CustomDialog/index'
import { WalletContext } from '../../UserInterface'
import AppChip from '../AppChip/index'
import ProtoChip from '../ProtoChip/index.tsx'
import { PermissionEventHandler, PermissionRequest } from '@bsv/wallet-toolbox-client'

const ProtocolPermissionHandler: React.FC<{
  setProtocolPermissionCallback: Dispatch<SetStateAction<PermissionEventHandler>>
}> = ({ setProtocolPermissionCallback }) => {
  const {
    onFocusRequested,
    onFocusRelinquished,
    isFocused,
    managers
  } = useContext(WalletContext)
  const [wasOriginallyFocused, setWasOriginallyFocused] = useState(false)
  const [open, setOpen] = useState(false)

  const [perms, setPerms] = useState<Array<any>>([
    // requestID
    // originator
    // protocolID
    // protocolSecurityLevel
    // counterparty
    // description
    // renewal
  ])

  const handleCancel = () => {
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

  const handleGrant = () => {
    managers.permissionsManager!.grantPermission({ requestID: perms[0].requestID })
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

  useEffect(() => {
    setProtocolPermissionCallback(() => {
      return async (args: PermissionRequest & { requestID: string }): Promise<void> => {
        const {
          requestID,
          counterparty,
          originator,
          reason,
          renewal,
          protocolID
        } = args
        const [protocolSecurityLevel, protocolNameString] = protocolID!
        setOpen(true)
        const wasOriginallyFocused = await isFocused()
        if (!wasOriginallyFocused) {
          await onFocusRequested()
        }
        if (perms.length === 0) {
          setWasOriginallyFocused(wasOriginallyFocused)
        }
        setPerms(p => {
          const newItem = {
            requestID,
            protocolSecurityLevel,
            protocolID: protocolNameString,
            counterparty,
            originator,
            description: reason,
            renewal
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
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', width: 'min-content', gridGap: '2em' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', width: 'min-content', gridGap: '2em' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', gridGap: '2em', margin: '0px 1.5em' }}>
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
