/* eslint-disable react/prop-types */
import React, { useState, useEffect, useContext } from 'react'
import { Avatar, Badge, Chip, Icon, Tooltip } from '@mui/material'
import { withRouter } from 'react-router-dom'
import { Signia } from 'babbage-signia'
import { Img } from 'uhrp-react'
import makeStyles from '@mui/styles/makeStyles'
import CloseIcon from '@mui/icons-material/Close'
import { useTheme } from '@mui/styles'
import style from './style'
import confederacyHost from '../../utils/confederacyHost'
import { discoverByIdentityKey, getPublicKey } from '@babbage/sdk-ts'
import { defaultIdentity, parseIdentity } from 'identinator'

const useStyles = makeStyles(style, {
  name: 'CounterpartyChip'
})

const CounterpartyChip = ({
  counterparty,
  history,
  clickable = false,
  size = 1.3,
  onClick,
  expires,
  onCloseClick = () => { },
  canRevoke = false
}) => {
  const signia = new Signia()
  signia.config.confederacyHost = confederacyHost()

  const theme = useTheme()
  const classes = useStyles()

  const [signiaIdentity, setSigniaIdentity] = useState(defaultIdentity)

  useEffect(() => {
    // Function to load and potentially update identity for a specific counterparty
    const loadIdentity = async (counterpartyKey) => {
      // Initial load from local storage for a specific counterparty
      const cachedIdentity = window.localStorage.getItem(`signiaIdentity_${counterpartyKey}`)
      if (cachedIdentity) {
        setSigniaIdentity(JSON.parse(cachedIdentity))
      }

      try {
        // Resolve the counterparty key for 'self' or 'anyone'
        if (counterpartyKey === 'self') {
          counterpartyKey = await getPublicKey({ identityKey: true })
        } else if (counterpartyKey === 'anyone') {
          counterpartyKey = '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798'
        }

        // Fetch the latest identity info from the server
        const results = await discoverByIdentityKey({ identityKey: counterpartyKey })
        if (results && results.length > 0) {
          const resolvedIdentity = results[0]
          const parsedIdentity = parseIdentity(resolvedIdentity)
          // Update component state and cache in local storage
          setSigniaIdentity(parsedIdentity)
          window.localStorage.setItem(`signiaIdentity_${counterpartyKey}`, JSON.stringify(parsedIdentity))
        }
      } catch (e) {
        window.Bugsnag.notify(e)
        console.error(e)
      }
    }

    // Execute the loading function with the initial counterparty
    loadIdentity(counterparty)
  }, [counterparty])

  return (
    <div className={classes.chipContainer}>
      <Chip
        style={theme.templates.chip({ size })}
        onDelete={onCloseClick}
        deleteIcon={canRevoke ? <CloseIcon /> : <></>}
        disableRipple={!clickable}
        label={
          <div style={theme.templates.chipLabel}>
            <span style={theme.templates.chipLabelTitle({ size })}>
              {signiaIdentity.name}
            </span>
            <span style={theme.templates.chipLabelSubtitle}>
              <br />
              {signiaIdentity.abbreviatedKey || `${counterparty.substring(0, 10)}...`}
            </span>
          </div>
        }
        icon={

          <Tooltip title={signiaIdentity.badgeLabel} placement='right'>
            <Badge
              overlap='circular'
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Icon style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '20%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Img
                    style={{ width: '95%', height: '95%', objectFit: 'cover', borderRadius: '20%' }}
                    src={signiaIdentity.badgeIconURL}
                    confederacyHost={confederacyHost()}
                    loading={undefined}
                  />
                </Icon>
              }
            >
              <Avatar alt={signiaIdentity.name} sx={{ width: '2.5em', height: '2.5em' }}>
                <Img
                  src={signiaIdentity.avatarURL}
                  className={classes.table_picture}
                  confederacyHost={confederacyHost()}
                />
              </Avatar>
            </Badge>
          </Tooltip>
        }
        onClick={e => {
          if (clickable) {
            if (typeof onClick === 'function') {
              onClick(e)
            } else {
              e.stopPropagation()
              history.push({
                pathname: `/dashboard/counterparty/${encodeURIComponent(counterparty)}`
              })
            }
          }
        }}
      />
      <span className={classes.expiryHoverText}>{expires}</span>
    </div>
  )
}

export default withRouter(CounterpartyChip)
