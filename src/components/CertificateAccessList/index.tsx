import React, { useState, useEffect, useCallback } from 'react'
import {
  List,
  ListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Grid,
  ListSubheader,
  IconButton
} from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'
import style from './style'
import { formatDistance } from 'date-fns/formatDistance'
import { toast } from 'react-toastify'
import CounterpartyChip from '../CounterpartyChip'
import CertificateChip from '../CertificateChip'
import sortPermissions from './sortPermissions'
import AppChip from '../AppChip'
import CloseIcon from '@mui/icons-material/Close'
import { useHistory } from 'react-router-dom'

// Define interfaces for individual permission and app grant items.
interface Permission {
  type: string
  lastAccessed: number
  expiry: number
  issuer: string
  verifier: string
  onIssuerClick?: (event: React.MouseEvent) => void
  onVerifierClick?: (event: React.MouseEvent) => void
  onClick?: (event: React.MouseEvent) => void
  fields: { [key: string]: any }
  clickable: boolean
  // This property is used when revoking a certificate in the apps view.
  permissionGrant?: any
}

interface AppGrant {
  originator: string
  permissions: Permission[]
}

// When the list is not displayed as apps, we assume that the grant is simply a Permission.
type GrantItem = AppGrant | Permission

// Props for the CertificateAccessList component.
interface CertificateAccessListProps {
  app: string
  itemsDisplayed: string
  counterparty: string
  type: string
  limit: number
  displayCount?: boolean
  listHeaderTitle?: string
  showEmptyList?: boolean
  canRevoke?: boolean
  onEmptyList?: () => void
}

const useStyles = makeStyles(style, {
  name: 'CertificateAccessList'
})

const CertificateAccessList: React.FC<CertificateAccessListProps> = ({
  app,
  itemsDisplayed,
  counterparty,
  type,
  limit,
  displayCount = true,
  listHeaderTitle,
  showEmptyList = false,
  canRevoke = false,
  onEmptyList = () => { }
}) => {
  const [grants, setGrants] = useState<GrantItem[]>([])
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [currentAccessGrant, setCurrentAccessGrant] = useState<Permission | null>(null)
  const [currentApp, setCurrentApp] = useState<AppGrant | null>(null)
  const [dialogLoading, setDialogLoading] = useState<boolean>(false)
  const classes = useStyles()
  const history = useHistory()

  const refreshGrants = useCallback(async () => {
    try {
      // @ts-ignore: window.CWI may not have a defined type.
      const result: GrantItem[] = await window.CWI.listCertificateAccess({
        targetDomain: app,
        verifierPublicKey: counterparty,
        targetCertificateType: type,
        limit
      })

      if (itemsDisplayed === 'apps') {
        const results = sortPermissions(result)
        setGrants(results)
      } else {
        setGrants(result)
      }

      if (result.length === 0) {
        onEmptyList()
      }
    } catch (error) {
      console.error(error)
    }
  }, [app, counterparty, type, limit, itemsDisplayed, onEmptyList])

  const revokeAccess = async (grant: Permission) => {
    setCurrentAccessGrant(grant)
    setDialogOpen(true)
  }

  const revokeAllAccess = async (appGrant: AppGrant) => {
    setCurrentApp(appGrant)
    setDialogOpen(true)
  }

  // Handle revoke dialog confirmation
  const handleConfirm = async () => {
    try {
      setDialogLoading(true)
      if (currentAccessGrant) {
        // @ts-ignore: window.CWI.revokeProtocolPermission not typed.
        await window.CWI.revokeProtocolPermission({ permission: currentAccessGrant })
      } else {
        if (!currentApp || !currentApp.permissions) {
          throw new Error('Unable to revoke permissions!')
        }
        for (const permission of currentApp.permissions) {
          try {
            // @ts-ignore: window.CWI.revokeProtocolPermission not typed.
            await window.CWI.revokeProtocolPermission({ permission })
          } catch (error) {
            console.error(error)
          }
        }
        setCurrentApp(null)
      }
      setCurrentAccessGrant(null)
      setDialogOpen(false)
      setDialogLoading(false)
      refreshGrants()
    } catch (e: any) {
      toast.error('Certificate access grant may not have been revoked: ' + e.message)
      refreshGrants()
      setCurrentAccessGrant(null)
      setDialogOpen(false)
      setDialogLoading(false)
    }
  }

  const handleDialogClose = () => {
    setCurrentAccessGrant(null)
    setDialogOpen(false)
  }

  useEffect(() => {
    refreshGrants()
  }, [refreshGrants])

  // Only render the list if there are items to display.
  if (grants.length === 0 && !showEmptyList) {
    return <></>
  }

  return (
    <>
      <Dialog open={dialogOpen}>
        <DialogTitle>Revoke Access?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You can re-authorize this certificate access grant next time you use this app.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="primary" disabled={dialogLoading} onClick={handleDialogClose}>
            Cancel
          </Button>
          <Button color="primary" disabled={dialogLoading} onClick={handleConfirm}>
            Revoke
          </Button>
        </DialogActions>
      </Dialog>
      <List>
        {listHeaderTitle && <ListSubheader>{listHeaderTitle}</ListSubheader>}
        {grants.map((grant, i) => (
          <React.Fragment key={i}>
            {itemsDisplayed === 'apps' ? (
              <div className={classes.appList}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingRight: '1em',
                    alignItems: 'center'
                  }}
                >
                  {/* Type assertion: grant is an AppGrant */}
                  <AppChip
                    label={(grant as AppGrant).originator}
                    showDomain
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation()
                      history.push({
                        pathname: `/dashboard/app/${encodeURIComponent((grant as AppGrant).originator)}`,
                        state: { domain: (grant as AppGrant).originator }
                      })
                    }}
                  />
                  {canRevoke && (
                    <>
                      {(grant as AppGrant).permissions.length > 0 && (grant as AppGrant).originator ? (
                        <Button
                          onClick={() => revokeAllAccess(grant as AppGrant)}
                          color="secondary"
                          className={classes.revokeButton}
                        >
                          Revoke All
                        </Button>
                      ) : (
                        <IconButton
                          edge="end"
                          onClick={() =>
                            revokeAccess((grant as AppGrant).permissions[0].permissionGrant)
                          }
                          size="large"
                        >
                          <CloseIcon />
                        </IconButton>
                      )}
                    </>
                  )}
                </div>
                <ListItem elevation={4}>
                  <div className={classes.counterpartyContainer}>
                    {(grant as AppGrant).permissions.map((permission, idx) => (
                      <div className={classes.gridItem} key={idx}>
                        <CertificateChip
                          certType={permission.type}
                          lastAccessed={permission.lastAccessed}
                          issuer={permission.issuer}
                          onIssuerClick={permission.onIssuerClick}
                          verifier={permission.verifier}
                          onVerifierClick={permission.onVerifierClick}
                          onClick={permission.onClick}
                          fieldsToDisplay={permission.fields}
                          history={history}
                          clickable={permission.clickable}
                          size={1.3}
                          expires={formatDistance(new Date(permission.expiry * 1000), new Date(), {
                            addSuffix: true
                          })}
                          onCloseClick={() => revokeAccess(permission)}
                          canRevoke={canRevoke}
                        />
                      </div>
                    ))}
                  </div>
                </ListItem>
              </div>
            ) : (
              <ListItem className={classes.action_card} elevation={4}>
                {/*
                  When itemsDisplayed is not 'apps', we assume each grant is a Permission.
                */}
                <CertificateChip
                  certType={(grant as Permission).type}
                  lastAccessed={(grant as Permission).lastAccessed}
                  issuer={(grant as Permission).issuer}
                  onIssuerClick={(grant as Permission).onIssuerClick}
                  verifier={(grant as Permission).verifier}
                  onVerifierClick={(grant as Permission).onVerifierClick}
                  onClick={(grant as Permission).onClick}
                  fieldsToDisplay={(grant as Permission).fields}
                  history={history}
                  clickable={(grant as Permission).clickable}
                  size={1.3}
                  expires={formatDistance(
                    new Date((grant as Permission).expiry * 1000),
                    new Date(),
                    { addSuffix: true }
                  )}
                  onCloseClick={() => revokeAccess(grant as Permission)}
                  canRevoke={canRevoke}
                />
              </ListItem>
            )}
          </React.Fragment>
        ))}
      </List>

      {displayCount && (
        <center>
          <Typography color="textSecondary">
            <i>Total Certificate Access Grants: {grants.length}</i>
          </Typography>
        </center>
      )}
    </>
  )
}

export default CertificateAccessList
