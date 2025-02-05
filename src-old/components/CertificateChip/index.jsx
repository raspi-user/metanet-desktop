import React, { useState, useEffect, useContext } from 'react'
import { Avatar, Badge, Grid, Chip, Tooltip } from '@mui/material'
import { withRouter } from 'react-router-dom'
import { CertMap } from 'certmap'
import { Img } from 'uhrp-react'
import { useTheme, makeStyles } from '@mui/styles'
import style from './style'
import CloseIcon from '@mui/icons-material/Close'
import { DEFAULT_APP_ICON } from '../../constants/popularApps'
import confederacyHost from '../../utils/confederacyHost'
import registryOperator from '../../utils/registryOperator'
import YellowCautionIcon from '../../images/cautionIcon'
import CounterpartyChip from '../CounterpartyChip'
import ArtTrack from '@mui/icons-material/ArtTrack'
import { SettingsContext } from '../../context/SettingsContext'

const useStyles = makeStyles(style, {
  name: 'CertificateChip'
})

const CertificateChip = ({
  certType,
  lastAccessed,
  issuer,
  onIssuerClick,
  verifier,
  onVerifierClick,
  onClick,
  fieldsToDisplay,
  history,
  clickable = true,
  size = 1.3,
  onCounterpartyClick,
  expires,
  onCloseClick = () => { },
  canRevoke = false
}) => {
  if (typeof certType !== 'string') {
    throw new Error('The certType prop in CertificateChip is not a string')
  }
  const certmap = new CertMap()
  certmap.config.confederacyHost = confederacyHost()
  const { settings } = useContext(SettingsContext)

  const classes = useStyles()
  const theme = useTheme()

  const [certName, setCertName] = useState('Unknown Cert')
  const [iconURL, setIconURL] = useState(
    DEFAULT_APP_ICON
  )
  const [description, setDescription] = useState(`${certType.substr(0, 12)}...`)
  const [documentationURL, setDocumentationURL] = useState('unknown')
  const [fields, setFields] = useState({})
  useEffect(() => {
    const fetchAndCacheData = async () => {
      const registryOperators = settings.trustedEntities.map(x => x.publicKey)
      const cacheKey = `certData_${certType}_${registryOperators.join('_')}`
      const cachedData = window.localStorage.getItem(cacheKey)

      if (cachedData) {
        const cachedCert = JSON.parse(cachedData)
        setCertName(cachedCert.name)
        setIconURL(cachedCert.iconURL)
        setDescription(cachedCert.description)
        setDocumentationURL(cachedCert.documentationURL)
        setFields(cachedCert.fields)
      }

      try {
        const results = await certmap.resolveCertificateByType(certType, registryOperators)
        if (results && results.length > 0) {
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
          const mostTrustedCert = results[mostTrustedIndex]
          setCertName(mostTrustedCert.name)
          setIconURL(mostTrustedCert.iconURL)
          setDescription(mostTrustedCert.description)
          setDocumentationURL(mostTrustedCert.documentationURL)
          setFields(JSON.parse(mostTrustedCert.fields))

          // Cache the fetched data
          window.localStorage.setItem(cacheKey, JSON.stringify(mostTrustedCert))
        } else {
          console.log('No certificates found.')
        }
      } catch (error) {
        console.error('Failed to fetch certificate details:', error)
      }
    }

    fetchAndCacheData()
  }, [settings, certType, setCertName, setIconURL, setDescription, setDocumentationURL, setFields])

  return (
    <div>
      <Chip
        style={theme.templates.chip({ size })}
        label={
          <div>
            <span style={theme.templates.chipLabelTitle({ size })}>
              <b>{certName}</b>
            </span>
            <br />
            <span style={theme.templates.chipLabelSubtitle}>
              {lastAccessed || description}
            </span>
            <span>
              {Array.isArray(fieldsToDisplay) && fieldsToDisplay.length > 0
                ? <div style={theme.templates.boxOfChips}>
                  <p style={{ fontSize: '0.9em', fontWeight: 'normal', marginRight: '1em' }}>fields:</p>
                  {fieldsToDisplay.map((y, j) => (
                    <Chip
                      style={{ margin: '0.4em 0.25em' }}
                      key={j}
                      label={y}
                    />
                  ))}
                </div>
                : ''}
              {typeof fieldsToDisplay === 'object' && !Array.isArray(fieldsToDisplay) && Object.values(fieldsToDisplay).length > 0
                ? <div style={theme.templates.boxOfChips}>
                  <p style={{ fontSize: '0.9em', fontWeight: 'normal', marginRight: '1em' }}>fields:</p>
                  {Object.entries(fieldsToDisplay).map(([k, v], j) => (
                    <Chip
                      style={{ margin: '0.4em 0.25em' }}
                      key={j}
                      label={`${fields[k] || k}: ${v}`}
                    />
                  ))}
                </div>
                : ''}
            </span>
            <span>
              {issuer
                ? <div>
                  <Grid container alignContent='center' style={{ alignItems: 'center' }}>
                    <Grid item>
                      <p style={{ fontSize: '0.9em', fontWeight: 'normal', marginRight: '1em' }}>issuer:</p>
                    </Grid>
                    <Grid item>
                      <CounterpartyChip
                        counterparty={issuer}
                        onClick={onIssuerClick}
                      />
                    </Grid>
                  </Grid>
                </div>
                : ''}
            </span>
            <span>
              {verifier
                ? <div style={theme.templates.boxOfChips}>
                  <p style={{ fontSize: '0.9em', fontWeight: 'normal', marginRight: '1em' }}>verifier:</p>

                  <CounterpartyChip
                    counterparty={verifier}
                    onClick={onVerifierClick}
                    clickable
                    size={0.85}
                  />

                </div>
                : ''}
            </span>
          </div>
        }
        onDelete={() => {
          onCloseClick()
        }}
        deleteIcon={canRevoke ? <CloseIcon /> : <></>}
        disableRipple={!clickable}
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
                title='Digital Certificate (click to learn more about certificates)'
                onClick={e => {
                  e.stopPropagation()
                  window.open(
                    'https://projectbabbage.com/docs/babbage-sdk/concepts/certificates',
                    '_blank'
                  )
                }}
              >
                <Avatar
                  sx={{
                    backgroundColor: 'darkgoldenrod',
                    color: 'white',
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
                  <ArtTrack style={{ width: 16, height: 16 }} />
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
                backgroundColor: '#000000AF'
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
        onClick={e => {
          if (clickable) {
            if (typeof onClick === 'function') {
              onClick(e)
            } else {
              e.stopPropagation()
              history.push(
                `/dashboard/certificate/${encodeURIComponent(certType)}`
              )
            }
          }
        }}
      />
      <span className={classes.expires}>{expires}</span>
    </div>
  )
}

export default withRouter(CertificateChip)
