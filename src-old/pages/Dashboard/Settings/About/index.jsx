import React, { useState, useEffect, useContext } from 'react'
import { Typography, Divider } from '@mui/material'
import { makeStyles } from '@mui/styles'
import style from './style'
import UIContext from '../../../../UIContext'

const useStyles = makeStyles(style, {
  name: 'About'
})

const About = () => {
  const classes = useStyles()
  const { appName, appVersion } = useContext(UIContext)
  const [cwiVersion, setCwiVersion] = useState('---')

  useEffect(() => {
    (async () => {
      setCwiVersion(await window.CWI.getVersion())
    })()
  }, [])

  return (
    <div className={classes.content_wrap}>
      <Typography variant='h2' paragraph color='textPrimary'>
        Software Versions
      </Typography>
      <Typography paragraph>
        {appName} Version: {appVersion}
      </Typography>
      <Typography paragraph>
        Computing with Integrity Kernel Version: {cwiVersion}
      </Typography>
      <br />
      <Divider />
      <br />
      <Typography variant='h2' paragraph color='textPrimary'>
        Legal
      </Typography>
      <Typography paragraph variant='body' color='textSecondary'>
        Project Babbage enables you to use new kinds of apps while keeping control over your digital identity. This software is copyright &copy; 2020-2023 Peer-to-peer Privacy Systems Research, LLC. By using this software, or any software that relies upon it it to function, you agree to be bound by the latest version of the{' '}
        Babbage Software License Agreement, which can be accessed by navigating to the below website URL:
      </Typography>
      <Typography paragraph color='textPrimary'>
        <a
          href='https://projectbabbage.com/desktop/license'
          target='_blank'
          rel='noopener noreferrer'
          style={{ color: 'inherit' }}
        >
          https://projectbabbage.com/desktop/license
        </a>
      </Typography>
      <br />
    </div>
  )
}

export default About
