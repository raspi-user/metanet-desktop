import { Dispatch, SetStateAction, useState, useEffect, useContext } from 'react'
import { DialogContent, DialogContentText, DialogActions, Button } from '@mui/material'
import CustomDialog from '../CustomDialog/index'
import { WalletContext } from '../../UserInterface'
import AppChip from '../AppChip/index'
import ProtoChip from '../ProtoChip/index.tsx'
import { PermissionEventHandler, PermissionRequest } from '@bsv/wallet-toolbox-client'
import { useTheme } from '@mui/material/styles'

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

  const [perms, setPerms] = useState<Array<any>>([{}])

  const theme = useTheme()

  const handleCancel = () => {
    managers.permissionsManager.denyPermission(perms[0].requestID)
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
    managers.permissionsManager.grantPermission({ requestID: perms[0].requestID })
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
        
        // First check if we're already focused
        const wasOriginallyFocused = await isFocused()
        
        // Create the new permission request
        const newItem = {
          requestID,
          protocolSecurityLevel,
          protocolID: protocolNameString,
          counterparty,
          originator,
          description: reason,
          renewal
        }
        
        // Update state in a single batch
        await Promise.all([
          // Request focus if needed
          !wasOriginallyFocused ? onFocusRequested() : Promise.resolve(),
          // Set the original focus state
          new Promise<void>(resolve => {
            setWasOriginallyFocused(wasOriginallyFocused)
            resolve()
          }),
          // Add the new permission request
          new Promise<void>(resolve => {
            setPerms(p => [...p, newItem])
            resolve()
          })
        ])
        
        // Finally, open the dialog
        setOpen(true)
      }
    })
  }, [])

  // Only render if we have both dialog open and permissions to show
  if (!open || perms.length === 0) {
    return null
  }

  // Get the current permission request
  const currentPerm = perms[0]
  if (!currentPerm) {
    return null
  }

  return (
    <CustomDialog
      open={open}
      title={currentPerm.protocolID === 'identity resolution' ? 'Trusted Entities Access Request' : (!currentPerm.renewal ? 'Protocol Access Request' : 'Protocol Access Renewal')}
    >
      <DialogContent>
        <DialogContentText style={{ marginBottom: theme.spacing(3) }}>
          {currentPerm.protocolID === 'identity resolution' 
            ? 'An app is requesting access to lookup identity information using the entities you trust.' 
            : 'An app is requesting to talk in a specific language (protocol) using your information.'}
        </DialogContentText>

        <div style={{ 
          display: 'grid', 
          gap: theme.spacing(3),
          maxWidth: '100%'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'auto 1fr', 
            alignItems: 'center', 
            gap: theme.spacing(2) 
          }}>
            <span>App:</span>
            {currentPerm.originator && 
              <AppChip
                size={2.5}
                showDomain
                label={currentPerm.originator}
                clickable={false}
              />
            }
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'auto 1fr', 
            alignItems: 'center', 
            gap: theme.spacing(2)
          }}>
            <span>Protocol:</span>
            <ProtoChip
              securityLevel={currentPerm.protocolSecurityLevel}
              protocolID={currentPerm.protocolID}
              counterparty={currentPerm.counterparty}
            />
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'auto 1fr', 
            alignItems: 'start', 
            gap: theme.spacing(2)
          }}>
            <span>Reason:</span>
            <DialogContentText style={{ margin: 0 }}>
              {currentPerm.description}
            </DialogContentText>
          </div>
        </div>
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={handleCancel}
          variant="outlined"
          color="inherit"
        >
          Deny
        </Button>
        <Button 
          onClick={handleGrant}
          variant="contained"
          color="primary"
        >
          Grant Access
        </Button>
      </DialogActions>
    </CustomDialog>
  )
}

export default ProtocolPermissionHandler
