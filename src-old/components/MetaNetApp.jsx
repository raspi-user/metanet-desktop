import React from 'react'
import { Card, CardContent, Typography } from '@mui/material'
import { withRouter } from 'react-router-dom'
import isImageUrl from '../utils/isImageUrl'
import { useTheme } from '@mui/styles'
import { DEFAULT_APP_ICON } from '../constants/popularApps'
import confederacyHost from '../utils/confederacyHost'
import { Img } from 'uhrp-react'

const MetaNetApp = ({
  iconImageUrl = DEFAULT_APP_ICON,
  domain,
  appName = domain,
  history,
  onClick,
  clickable = true
}) => {
  const theme = useTheme()

  // Make sure valid props are provided
  if (typeof domain !== 'string') {
    throw new Error('Error in MetaNetApp Component: domain prop must be a string!')
  }

  // Handle onClick events if supported
  const handleClick = (e) => {
    if (clickable) {
      if (typeof onClick === 'function') {
        onClick(e)
      } else {
        e.stopPropagation()
        history.push({
          pathname: `/dashboard/app/${encodeURIComponent(domain)}`,
          state: {
            domain
          }
        })
      }
    }
  }

  return (
    <Card
      sx={{
        cursor: clickable ? 'pointer' : '',
        boxShadow: 'none',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column', // Stack items vertically
        height: '100%', // Fill the container height
        justifyContent: 'center',
        transition: 'background 0.3s ease',
        backgroundColor: 'transparent',
        backgroundImage: 'none',
        '&:hover': {
          backgroundColor: theme.palette.background.appHover
        },
      }}
      onClick={handleClick}
    >
      <CardContent>
        <div>
          <Img
            src={isImageUrl(iconImageUrl) ? iconImageUrl : DEFAULT_APP_ICON}
            alt={appName}
            style={{ height: '4.25em', paddingTop: '0.4em' }}
            confederacyHost={confederacyHost()}
          />
        </div>
        {/*
          TODO: Remove references to webkit once browsers mature to a good level
        */}
        <Typography style={{
          color: theme.palette.text.primary,
          paddingTop: '0.4em',
          display: '-webkit-box',
          overflow: 'hidden',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 1
        }}
        >
          {appName}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default withRouter(MetaNetApp)
