import { Dispatch, SetStateAction, useState, useEffect, useContext, FC } from 'react'
import { DialogContent, DialogContentText, DialogActions, Button } from '@mui/material'
import CustomDialog from '../CustomDialog'
import { WalletContext, WalletContextValue } from '../../UserInterface'
import AppChip from '../AppChip/index'
import BasketChip from '../BasketChip/index'
import { PermissionEventHandler, PermissionRequest } from '@bsv/wallet-toolbox-client'

type BasketAccessRequest = {
    requestID: string
    basket?: string
    originator: string
    reason?: string
    renewal?: boolean
}

// type BasketAccessHandlerProps = {
//     /**
//      * A function to be called once to provide a "basket access" request handler.
//      * The handler itself should return a Promise<boolean>, resolving to `true`
//      * if the user grants access, or `false` if the user denies (or if the user closes).
//      */
//     setBasketAccessHandler: (
//         handler: (request: BasketAccessRequest) => Promise<boolean>
//     ) => void
// }

const BasketAccessHandler: FC<{
    setBasketAccessHandler: Dispatch<SetStateAction<PermissionEventHandler>>
}> = ({ setBasketAccessHandler }) => {
    const { onFocusRequested, onFocusRelinquished, isFocused, managers } = useContext<WalletContextValue>(WalletContext)

    const [open, setOpen] = useState(false)
    const [wasOriginallyFocused, setWasOriginallyFocused] = useState(false)

    // The single "pending" request data
    const [request, setRequest] = useState<BasketAccessRequest | null>(null)

    /**
     * Expose a handler for basket-access requests, following the pattern
     * of "new style" handlers. Once set, code elsewhere can do:
     *
     *   basketAccessHandler({
     * requestID,
     * basket,
     * originator,
     * description,
     * renewal
            *   }).then(granted => {
     *     if (granted) {... } else {... }
     *   })
        */
    useEffect(() => {
        setBasketAccessHandler((): PermissionEventHandler => {
            return async (incomingRequest: PermissionRequest & { requestID: string }): Promise<void> => {
                // Save request + resolvers in state
                setRequest(incomingRequest)
                setOpen(true)

                // Focus logic
                const currentlyFocused = await isFocused()
                setWasOriginallyFocused(currentlyFocused)
                if (!currentlyFocused) {
                    await onFocusRequested()
                }
            }
        })
    }, [])

    const closeDialog = async () => {
        setOpen(false)
        setRequest(null)
        // If we weren't focused before, relinquish
        if (!wasOriginallyFocused) {
            await onFocusRelinquished()
        }
    }

    const handleGrant = async () => {
        // If your flow still needs to immediately call window.CWI.grantBasketAccess,
        // do so here. Otherwise, you might just resolve(true) and let the caller handle it:
        managers.permissionsManager!.grantPermission({ requestID: request!.requestID })
        await closeDialog()
    }

    const handleDeny = async () => {
        // If your flow still needs to immediately call window.CWI.denyBasketAccess,
        // do so here. Otherwise, you might just resolve(false) and let the caller handle it:
        managers.permissionsManager!.denyPermission(request!.requestID)
        // resolveFn(false)
        await closeDialog()
    }

    const handleDialogClose = async () => {
        // If user closes via the "X" (or otherwise):
        managers.permissionsManager!.denyPermission(request!.requestID)
        // if (rejectFn) rejectFn(new Error('User closed basket access request dialog'))
        await closeDialog()
    }

    // No request to show means no dialog
    if (!request) return null

    return (
        <CustomDialog
            open={open}
            title={request.renewal ? 'Basket Access Renewal' : 'Basket Access Request'}
            onClose={handleDialogClose}
        >
            <DialogContent style={{ textAlign: 'center', padding: '1em', flex: 'none' }}>
                <DialogContentText>
                    An app is requesting to access some tokens (“things”) stored in one of your baskets.
                </DialogContentText>
                <br />
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gridGap: '2em', alignItems: 'center', marginBottom: '1em' }}>
                    <span>App:</span>
                    {request.originator && (
                        <AppChip
                            size={2.5}
                            showDomain
                            label={request.originator}
                            clickable={false}
                        />
                    )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gridGap: '2em', alignItems: 'center', marginBottom: '1em' }}>
                    <span>Basket:</span>
                    <BasketChip basketId={request.basket} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gridGap: '2em', alignItems: 'center', margin: '0 1.5em' }}>
                    <span>Reason:</span>
                    <DialogContentText>{request.reason}</DialogContentText>
                </div>
            </DialogContent>
            <DialogActions style={{ justifyContent: 'space-around', padding: '1em', flex: 'none' }}>
                <Button color='primary' onClick={handleDeny}>
                    Deny
                </Button>
                <Button color='primary' onClick={handleGrant}>
                    Grant
                </Button>
            </DialogActions>
        </CustomDialog>
    )
}

export default BasketAccessHandler
