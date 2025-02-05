import React, { useState, useEffect } from 'react'
import AmountDisplay from './AmountDisplay'
import confederacyHost from '../utils/confederacyHost'
import { makeStyles } from '@mui/styles'
import { Typography } from '@mui/material'
import { useTheme } from '@emotion/react'

const useStyles = makeStyles(theme => ({
  content_wrap: {
    marginTop: '3em',
    zIndex: 3,
    display: 'grid',
    placeItems: 'center',
    paddingBottom: theme.spacing(2)
  },
  manage_link: {
    textDecoration: 'underline'
  }
}), { name: 'Profile' })

const Profile = () => {
  const [accountBalance, setAccountBalance] = useState(null)
  const [balanceLoading, setBalanceLoading] = useState(true)
  const classes = useStyles()
  const theme = useTheme()

  const refreshBalance = async () => {
    try {
      setBalanceLoading(true)
      const result = await window.CWI.ninja.getTotalValue()
      setAccountBalance(result.total)
      setBalanceLoading(false)
    } catch (e) {
      setBalanceLoading(false)
    }
  }

  useEffect(() => {
    (async () => {
      try {
        refreshBalance()
      } catch (e) { }
    })()
  }, [])

  const confederacyHostURL = confederacyHost()

  return (
    <>
      <div className={classes.content_wrap}>
        <Typography variant='h5' color='textSecondary'>
          Your Balance
        </Typography>
        <Typography
          onClick={() => refreshBalance()}
          color='textPrimary'
          variant='h2'
          style={{ cursor: 'pointer' }}
        >
          {balanceLoading
            ? '---'
            : <AmountDisplay abbreviate>{accountBalance}</AmountDisplay>}
        </Typography>
        {/* <a href='#' className={classes.manage_link}>manage</a> */}
      </div>
    </>
  )
}

export default Profile
