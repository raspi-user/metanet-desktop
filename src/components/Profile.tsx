import { useState, useEffect, useContext } from 'react'
import AmountDisplay from './AmountDisplay'
// import confederacyHost from '../utils/confederacyHost'
import { makeStyles } from '@mui/styles'
import { Typography } from '@mui/material'
import { WalletContext } from '../UserInterface'

const useStyles = makeStyles((theme: any) => ({
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
  const { managers } = useContext(WalletContext)
  const [accountBalance, setAccountBalance] = useState<any>(null)
  const [balanceLoading, setBalanceLoading] = useState(true)
  const classes = useStyles()

  const refreshBalance = async () => {
    try {
      setBalanceLoading(true)
      const { outputs } = await managers.walletManager!.listOutputs({ basket: 'default' })
      const total = outputs.reduce((a, e) => a + e.satoshis, 0)
      setAccountBalance(total)
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
