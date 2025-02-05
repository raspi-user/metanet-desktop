import React, { useState, useEffect, useContext } from 'react'
import { Grid, Typography, Chip, Badge, Avatar, Tooltip } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { withRouter } from 'react-router-dom'
import { BasketMap } from 'basketmap'
import { Img } from 'uhrp-react'
import makeStyles from '@mui/styles/makeStyles'
import style from './style'
import { DEFAULT_APP_ICON } from '../../constants/popularApps'
import confederacyHost from '../../utils/confederacyHost'
import YellowCautionIcon from '../../images/cautionIcon'
import CounterpartyChip from '../CounterpartyChip'
import registryOperator from '../../utils/registryOperator'
import { useTheme } from '@mui/styles'
import ShoppingBasket from '@mui/icons-material/ShoppingBasket'
import { SettingsContext } from '../../context/SettingsContext'

const useStyles = makeStyles(style, {
  name: 'BasketChip'
})

const BasketChip = ({
  basketId,
  lastAccessed,
  domain,
  history,
  clickable = false,
  size = 1.3,
  onClick,
  expires,
  onCloseClick = () => { },
  canRevoke = false
}) => {
  if (typeof basketId !== 'string') {
    throw new Error('BasketChip was initialized without a valid basketId')
  }
  const basketRegistryOperator = registryOperator()
  const classes = useStyles()
  const theme = useTheme()
  const { settings } = useContext(SettingsContext)

  // Initialize BasketMap
  const basketmap = new BasketMap()
  basketmap.config.confederacyHost = confederacyHost()

  const [basketName, setBasketName] = useState(basketId)
  const [iconURL, setIconURL] = useState(
    DEFAULT_APP_ICON
  )
  const [description, setDescription] = useState(
    'Basket description not found.'
  )
  const [documentationURL, setDocumentationURL] = useState('https://projectbabbage.com')

  useEffect(() => {
    const cacheKey = `basketInfo_${basketId}`

    const fetchAndCacheData = async () => {
      // Try to load data from cache
      const cachedData = window.localStorage.getItem(cacheKey)
      if (cachedData) {
        const { name, iconURL, description, documentationURL } = JSON.parse(cachedData)
        setBasketName(name)
        setIconURL(iconURL)
        setDescription(description)
        setDocumentationURL(documentationURL)
      }
      try {
        // Fetch basket info by ID and trusted entities' public keys
        const trustedEntities = settings.trustedEntities.map(x => x.publicKey)
        const results = await basketmap.resolveBasketById(basketId, trustedEntities)
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
          const basket = results[mostTrustedIndex]

          // Update state and cache the results
          setBasketName(basket.name)
          setIconURL(basket.iconURL)
          setDescription(basket.description)
          setDocumentationURL(basket.documentationURL)

          // Store data in local storage
          window.localStorage.setItem(cacheKey, JSON.stringify({
            name: basket.name,
            iconURL: basket.iconURL,
            description: basket.description,
            documentationURL: basket.documentationURL
          }))
        }
      } catch (error) {
        console.error(error)
      }
    }

    fetchAndCacheData()
  }, [basketId, settings])

  return (
    <div style={theme.templates.chipContainer}>
      <Chip
        style={theme.templates.chip({ size })}
        sx={{
          '& .MuiChip-label': {
            width: '100% !important'
          }
        }}
        label={
          <div style={theme.templates.chipLabel}>
            <span style={theme.templates.chipLabelTitle({ size })}>
              <b>{basketName}</b>
            </span>
            <br />
            <span style={theme.templates.chipLabelSubtitle}>
              {lastAccessed || description}
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
                title='Token Basket (click to learn more about baskets)'
                onClick={e => {
                  e.stopPropagation()
                  window.open(
                    'https://projectbabbage.com/docs/babbage-sdk/concepts/baskets',
                    '_blank'
                  )
                }}
              >
                <Avatar
                  sx={{
                    backgroundColor: '#FFFFFF',
                    color: 'green',
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
                  <ShoppingBasket style={{ width: 16, height: 16 }} />
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
              history.push({
                pathname: `/dashboard/basket/${encodeURIComponent(basketId)}`,
                state: {
                  id: basketId,
                  name: basketName,
                  registryOperator: basketRegistryOperator,
                  description,
                  iconURL,
                  documentationURL,
                  domain
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

export default withRouter(BasketChip)
