import React, { useState, useEffect } from 'react'
import { Chip, Badge, Tooltip, Avatar } from '@mui/material'
import { withRouter } from 'react-router-dom'
import boomerang from 'boomerang-http'
import isImageUrl from '../../utils/isImageUrl'
import { useTheme } from '@mui/styles'
import confederacyHost from '../../utils/confederacyHost'
import { Img } from 'uhrp-react'
import Memory from '@mui/icons-material/Memory'
import makeStyles from '@mui/styles/makeStyles'
import CloseIcon from '@mui/icons-material/Close'
import style from './style'
import { DEFAULT_APP_ICON } from '../../constants/popularApps'

const useStyles = makeStyles(style, {
  name: 'AppChip'
})

const AppChip = ({
  label,
  showDomain = false,
  history,
  clickable = true,
  size = 1,
  onClick,
  backgroundColor = 'transparent',
  expires,
  onCloseClick
}) => {
  const theme = useTheme()
  const classes = useStyles()
  if (typeof label !== 'string') {
    throw new Error('Error in AppChip: label prop must be a string!')
  }
  if (label.startsWith('babbage_app_')) {
    label = label.substring(12)
  }
  if (label.startsWith('https://')) {
    label = label.substring(8)
  }
  if (label.startsWith('http://')) {
    label = label.substring(7)
  }
  const [parsedLabel, setParsedLabel] = useState(label)
  const [appIconImageUrl, setAppIconImageUrl] = useState(DEFAULT_APP_ICON)

  useEffect(() => {
    const fetchAndCacheData = async () => {
      const faviconKey = `favicon_label_${label}`
      const manifestKey = `manifest_label_${label}`

      // Load favicon from local storage
      const cachedFavicon = window.localStorage.getItem(faviconKey)
      if (cachedFavicon) {
        setAppIconImageUrl(cachedFavicon)
      }
      const faviconUrl = `https://${label}/favicon.ico`
      if (await isImageUrl(faviconUrl)) {
        setAppIconImageUrl(faviconUrl)
        window.localStorage.setItem(faviconKey, faviconUrl) // Cache the favicon URL
      }

      // Load manifest from local storage
      const cachedManifest = window.localStorage.getItem(manifestKey)
      if (cachedManifest) {
        const manifest = JSON.parse(cachedManifest)
        setParsedLabel(manifest.name)
      }

      try {
        const manifestResponse = await boomerang(
          'GET',
          `${label.startsWith('localhost:') ? 'http' : 'https'}://${label}/manifest.json`
        )
        if (manifestResponse.name) {
          setParsedLabel(manifestResponse.name)
          window.localStorage.setItem(manifestKey, JSON.stringify(manifestResponse)) // Cache the manifest data
        }
      } catch (error) {
        console.error(error) // Handle fetch errors
      }
    }

    fetchAndCacheData()
  }, [label, setAppIconImageUrl, setParsedLabel])

  return (
    <div className={classes.chipContainer}>
      <Chip
        style={theme.templates.chip({ size, backgroundColor })}
        label={
          (showDomain && label !== parsedLabel)
            ? <div style={{
              textAlign: 'left'
            }}>
              <span
                style={theme.templates.chipLabelTitle({ size })}
              >
                {parsedLabel}
              </span>
              <br />
              <span
                style={theme.templates.chipLabelSubtitle}
              >
                {label}
              </span>
            </div>
            : <span style={{ fontSize: `${size}em` }}>{parsedLabel}</span>
        }
        onDelete={onCloseClick}
        deleteIcon={typeof onCloseClick === 'function' ? <CloseIcon /> : null}
        icon={(
          <Badge
            overlap='circular'
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            badgeContent={
              <Tooltip
                arrow
                title='App (click to learn more about apps)'
                onClick={e => {
                  e.stopPropagation()
                  window.open(
                    'https://projectbabbage.com/docs/babbage-sdk/concepts/apps',
                    '_blank'
                  )
                }}
              >
                <Avatar
                  sx={{
                    backgroundColor: '#FFFFFF',
                    color: 'darkRed',
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
                  <Memory style={{ width: 16, height: 16 }} />
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
                src={appIconImageUrl}
                style={{ width: '75%', height: '75%' }}
                className={classes.table_picture}
                confederacyHost={confederacyHost()}
              />
            </Avatar>
          </Badge>
        )}
        disableRipple={!clickable}
        onClick={e => {
          if (clickable) {
            if (typeof onClick === 'function') {
              onClick(e)
            } else {
              e.stopPropagation()
              history.push(
                `/dashboard/app/${encodeURIComponent(label)}`
              )
            }
          }
        }}
      />
      <span className={classes.expiryHoverText}>{expires}</span>
    </div>
  )
}

export default withRouter(AppChip)
