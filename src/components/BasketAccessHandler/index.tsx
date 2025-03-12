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

const BasketAccessHandler: FC<{
    setBasketAccessHandler: Dispatch<SetStateAction<PermissionEventHandler>>
}> = ({ setBasketAccessHandler }) => {
    const {
        onFocusRequested,
        onFocusRelinquished,
        isFocused,
        managers
    } = useContext<WalletContextValue>(WalletContext)

    // Whether our dialog is open
    const [open, setOpen] = useState(false)

    // Track if we were originally focused
    const [wasOriginallyFocused, setWasOriginallyFocused] = useState(false)

    // This array will queue up multiple requests
    const [requests, setRequests] = useState<BasketAccessRequest[]>([])

    // Provide a handler for basket-access requests that enqueues them
    useEffect(() => {
        setBasketAccessHandler(() => {
            return async (incomingRequest: PermissionRequest & {
                requestID: string
                basket?: string
                originator: string
                reason?: string
                renewal?: boolean
            }) => {
                // Enqueue the new request
                setRequests(prev => {
                    const wasEmpty = prev.length === 0

                    // If no requests were queued, handle focusing logic right away
                    if (wasEmpty) {
                        isFocused().then(currentlyFocused => {
                            setWasOriginallyFocused(currentlyFocused)
                            if (!currentlyFocused) {
                                onFocusRequested()
                            }
                            setOpen(true)
                        })
                    }

                    return [
                        ...prev,
                        {
                            requestID: incomingRequest.requestID,
                            basket: incomingRequest.basket,
                            originator: incomingRequest.originator,
                            reason: incomingRequest.reason,
                            renewal: incomingRequest.renewal
                        }
                    ]
                })
            }
        })
    }, [isFocused, onFocusRequested, setBasketAccessHandler])

    // Handle denying the top request in the queue
    const handleDeny = async () => {
        if (requests.length > 0) {
            managers.permissionsManager?.denyPermission(requests[0].requestID)
        }
        advanceQueue()
    }

    // Handle granting the top request in the queue
    const handleGrant = async () => {
        if (requests.length > 0) {
            managers.permissionsManager?.grantPermission({
                requestID: requests[0].requestID
            })
        }
        advanceQueue()
    }

    // Pop the first request from the queue, close if empty, relinquish focus if needed
    const advanceQueue = () => {
        setRequests(prev => {
            const newQueue = prev.slice(1)
            if (newQueue.length === 0) {
                setOpen(false)
                if (!wasOriginallyFocused) {
                    onFocusRelinquished()
                }
            }
            return newQueue
        })
    }

    // If no current request, don't render anything
    if (!requests[0]) {
        return null
    }

    // Current (top) request in the queue
    const { basket, originator, reason, renewal } = requests[0]

    return (
        <CustomDialog
            open={open}
            title={renewal ? 'Basket Access Renewal' : 'Basket Access Request'}
            onClose={handleDeny} // If the user closes via the X, treat as "deny"
        >
            <DialogContent style={{ textAlign: 'center', padding: '1em', flex: 'none' }}>
                <DialogContentText>
                    An app is requesting to access some tokens (“things”) stored in one of your baskets.
                </DialogContentText>
                <br />
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    gridGap: '2em',
                    alignItems: 'center',
                    marginBottom: '1em'
                }}>
                    <span>App:</span>
                    {originator && (
                        <AppChip
                            size={2.5}
                            showDomain
                            label={originator}
                            clickable={false}
                        />
                    )}
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    gridGap: '2em',
                    alignItems: 'center',
                    marginBottom: '1em'
                }}>
                    <span>Basket:</span>
                    <BasketChip basketId={basket} />
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    gridGap: '2em',
                    alignItems: 'center',
                    margin: '0 1.5em'
                }}>
                    <span>Reason:</span>
                    <DialogContentText>{reason}</DialogContentText>
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
