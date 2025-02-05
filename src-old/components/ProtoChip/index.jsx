import React, { useState, useEffect, useContext } from 'react'
import { Grid, Chip, Badge, Avatar, Tooltip, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { withRouter } from 'react-router-dom'
import { ProtoMap } from 'babbage-protomap'
import { Img } from 'uhrp-react'
import makeStyles from '@mui/styles/makeStyles'
import { useTheme } from '@mui/styles'
import style from './style'
import { DEFAULT_APP_ICON } from '../../constants/popularApps'
import confederacyHost from '../../utils/confederacyHost'
import CounterpartyChip from '../CounterpartyChip'
import DataObject from '@mui/icons-material/DataObject'
import { SettingsContext } from '../../context/SettingsContext'

const useStyles = makeStyles(style, {
  name: 'ProtoChip'
})

const ProtoChip = ({
  securityLevel,
  protocolID,
  counterparty,
  lastAccessed,
  originator,
  history,
  clickable = false,
  size = 1.3,
  onClick,
  onCounterpartyClick,
  expires,
  backgroundColor = 'transparent',
  canRevoke = true,
  onCloseClick = () => { }
}) => {
  if (typeof protocolID !== 'string') {
    throw new Error('ProtoChip requires protocolID to be a string')
  }
  const classes = useStyles()
  const theme = useTheme()
  const { settings } = useContext(SettingsContext)

  // Initialize ProtoMap
  const protomap = new ProtoMap()
  protomap.config.confederacyHost = confederacyHost()

  const [protocolName, setProtocolName] = useState(protocolID)
  const [iconURL, setIconURL] = useState(
    DEFAULT_APP_ICON
  )
  const [description, setDescription] = useState(
    'Protocol description not found.'
  )
  const [documentationURL, setDocumentationURL] = useState('https://projectbabbage.com')

  useEffect(() => {
    const cacheKey = `protocolInfo_${protocolID}_${securityLevel}`

    const fetchAndCacheData = async () => {
      // Try to load data from cache
      const cachedData = window.localStorage.getItem(cacheKey)
      if (cachedData) {
        const { name, iconURL, description, documentationURL } = JSON.parse(cachedData)
        setProtocolName(name)
        setIconURL(iconURL)
        setDescription(description)
        setDocumentationURL(documentationURL)
      }
      try {
        // Resolve a Protocol info from id and security level
        const certifiers = settings.trustedEntities.map(x => x.publicKey)
        const results = await protomap.resolveProtocol(certifiers, securityLevel, protocolID)

        // Compute the most trusted of the results
        let mostTrustedIndex = 0
        let maxTrustPoints = 0
        for (let i = 0; i < results.length; i++) {
          const resultTrustLevel = settings.trustedEntities.find(x => x.publicKey === results[i].registryOperator)?.trust || 0
          if (resultTrustLevel > maxTrustPoints) {
            mostTrustedIndex = i
            maxTrustPoints = resultTrustLevel
          }
        }
        const trusted = results[mostTrustedIndex]

        // Update state and cache the results
        setProtocolName(trusted.name)
        setIconURL(trusted.iconURL)
        setDescription(trusted.description)
        setDocumentationURL(trusted.documentationURL)

        // Store data in local storage
        window.localStorage.setItem(cacheKey, JSON.stringify({
          name: trusted.name,
          iconURL: trusted.iconURL,
          description: trusted.description,
          documentationURL: trusted.documentationURL
        }))
      } catch (error) {
        console.error(error)
      }
    }

    fetchAndCacheData()
  }, [protocolID, securityLevel, settings])

  return (
    <div className={classes.chipContainer}>
      <Chip
        style={theme.templates.chip({ size, backgroundColor })}
        sx={{
          '& .MuiChip-label': {
            width: '100% !important'
          }
        }}
        label={
          <div style={theme.templates.chipLabel}>
            <span style={theme.templates.chipLabelTitle({ size })}>
              <b>{protocolName}</b>
            </span>
            <br />
            <span style={theme.templates.chipLabelSubtitle}>
              {lastAccessed || description}
            </span>
            <span>
              {counterparty && counterparty !== 'self'
                ? <div>
                  <Grid container alignContent='center' style={{ alignItems: 'center' }}>
                    <Grid item>
                      <p style={{ fontSize: '0.9em', fontWeight: 'normal', marginRight: '1em' }}>with:</p>
                    </Grid>
                    <Grid item>
                      <CounterpartyChip
                        counterparty={counterparty}
                      // onClick={onCounterpartyClick}
                      />
                    </Grid>
                  </Grid>
                </div>
                : ''}
            </span>
          </div>
        }
        icon={
          <Badge
            overlap='circular'
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            badgeContent={
              <Tooltip
                arrow
                title='Data Protocol (click to learn more about protocols)'
                onClick={e => {
                  e.stopPropagation()
                  window.open(
                    'https://projectbabbage.com/docs/babbage-sdk/concepts/ppm',
                    '_blank'
                  )
                }}
              >
                <Avatar
                  sx={{
                    backgroundColor: theme.palette.badgeIcon,
                    width: 20,
                    height: 20,
                    borderRadius: '10px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '1.2em',
                    marginRight: '0.25em',
                    marginBottom: '0.3em'
                  }}
                >
                  <DataObject style={{ width: 16, height: 16 }} />
                </Avatar>
              </Tooltip>
            }
          >
            <Avatar
              variant='square'
              sx={{
                width: '2.2em',
                height: '2.2em',
                borderRadius: '4px',
                backgroundColor: '#000000AF',
                marginRight: '0.5em'
              }}
            >
              <Img
                src={iconURL}
                style={{ width: '75%', height: '75%' }}
                className={classes.table_picture}
                confederacyHost={confederacyHost()}
              />
            </Avatar>
          </Badge>
        }
        onDelete={() => {
          if (canRevoke) {
            onCloseClick()
          }
        }}
        deleteIcon={
          canRevoke ? <CloseIcon /> : <></>
        }
        disableRipple={!clickable}
        onClick={e => {
          if (clickable) {
            if (typeof onClick === 'function') {
              onClick(e)
            } else {
              e.stopPropagation()
              history.push({
                pathname: `/dashboard/protocol/${encodeURIComponent(`${securityLevel}-${protocolID}`)}`,
                state: {
                  protocolName,
                  iconURL,
                  securityLevel,
                  protocolID,
                  counterparty,
                  lastAccessed,
                  description,
                  documentationURL,
                  originator
                }
              })
            }
          }
        }}
      />
      <span className={classes.expires}>{expires}</span>
    </div>
  )
}

export default withRouter(ProtoChip)
