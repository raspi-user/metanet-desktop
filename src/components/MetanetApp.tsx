import React from 'react'
import { Card, CardContent, Typography } from '@mui/material'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import isImageUrl from '../utils/isImageUrl'
import { useTheme } from '@mui/styles'
import { DEFAULT_APP_ICON } from '../constants/popularApps'
import { Img } from '@bsv/uhrp-react'

interface MetanetAppProps extends RouteComponentProps {
  iconImageUrl?: string
  domain: string
  appName?: string
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  clickable?: boolean
}

const MetanetApp: React.FC<MetanetAppProps> = ({
  iconImageUrl = DEFAULT_APP_ICON,
  domain,
  appName,
  history,
  onClick,
  clickable = true,
}) => {
  const theme = useTheme()

  // Although TypeScript enforces the domain type, this runtime check preserves original logic.
  if (typeof domain !== 'string') {
    throw new Error('Error in MetanetApp Component: domain prop must be a string!')
  }

  // Fallback to domain if appName is not provided.
  const displayName = appName || domain

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    if (clickable) {
      if (typeof onClick === 'function') {
        onClick(e)
      } else {
        e.stopPropagation()
        history.push({
          pathname: `/dashboard/app/${encodeURIComponent(domain)}`,
          state: { domain },
        })
      }
    }
  }

  return (
    <Card
      sx={{
        cursor: clickable ? 'pointer' : 'default',
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
          backgroundColor: 'gray'
        },
      }}
      onClick={handleClick}
    >
      <CardContent>
        <div>
          <Img
            src={isImageUrl(iconImageUrl) ? iconImageUrl : DEFAULT_APP_ICON}
            alt={displayName}
            style={{ height: '4.25em', paddingTop: '0.4em' }}
          />
        </div>
        {/*
          TODO: Remove references to webkit once browsers mature to a good level
        */}
        <Typography
          style={{
            color: 'black',
            paddingTop: '0.4em',
            display: '-webkit-box',
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 1,
          }}
        >
          {displayName}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default withRouter(MetanetApp)
