import React, { useState, useContext } from 'react'
import {
  Typography,
  Button,
  Grid,
  LinearProgress
} from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'
import { toast } from 'react-toastify'
import style from './style'
import { SettingsContext } from '../../context/SettingsContext'
import UserTheme from '../../components/UserTheme.jsx'
import DarkModeImage from '../../images/darkMode'
import LightModeImage from '../../images/lightMode'

const useStyles = makeStyles(style, {
  name: 'Welcome'
})

const Welcome = ({ history }) => {
  const { settings, updateSettings } = useContext(SettingsContext)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const classes = useStyles()

  // Supported Defaults
  const currencies = {
    USD: '$10',
    BSV: '0.033',
    SATS: '3,333,333',
    EUR: '€9.15',
    GDP: '£7.86'
  }
  const themes = ['light', 'dark']

  const [selectedTheme, setSelectedTheme] = useState(themes[0].toLowerCase())
  const [selectedCurrency, setSelectedCurrency] = useState('USD')

  // Handle updating defaults
  const handleThemeChange = (theme) => {
    setSelectedTheme(theme.toLowerCase())
  }
  const handleCurrencyChange = (currency) => {
    setSelectedCurrency(currency)
  }

  // Save user preferences
  const showDashboard = async () => {
    // Save user preferences to settings
    try {
      setSettingsLoading(true)

      await updateSettings({
        theme: selectedTheme,
        currency: selectedCurrency
      })
      // toast.dark('Welcome! 🎉', 'center')
      history.push('/dashboard/apps')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSettingsLoading(false)
    }
  }

  return (
    // <SettingsProvider>
    <UserTheme>
      <div
        className={classes.content_wrap} style={{
          backgroundColor: selectedTheme === 'light' ? 'White' : 'rgba(0,0,0,0)',
          backgroundImage: selectedTheme === 'light'
            ? 'linear-gradient(to bottom, rgba(255,255,255,1.0), rgba(255,255,255,0.85)), url(https://cdn.projectbabbage.com/media/pictures/mainBackground.jpg)'
            : 'linear-gradient(to bottom, rgba(20,20,20,1.0), rgba(20,20,20,0.85)), url(https://cdn.projectbabbage.com/media/pictures/mainBackground.jpg)'
        }}
      >
        <center className={classes.content}>
          <Grid container direction='column' alignItems='center' spacing={2} padding='0.5em' style={{ color: selectedTheme === 'light' ? 'Black' : 'White' }}>
            <Grid item xs={12}>
              <Typography variant='h1' paragraph style={{ color: selectedTheme === 'light' ? 'Black' : 'White' }}>
                Your portal to the MetaNet — And beyond!
              </Typography>
              <Typography variant='h4'>
                Let's start by setting your preferences.
              </Typography>
              <Typography paragraph paddingTop='2em'>
                Default Theme
              </Typography>
            </Grid>
            <Grid item container spacing={1} justifyContent='center'>
              {
                themes.map(theme => (
                  <Grid item key={theme}>
                    <Button
                      onClick={() => handleThemeChange(theme)}
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: 10,
                        boxShadow: selectedTheme === theme ? '0px 0px 8px 2px #E04040' : 'none',
                        color: theme === 'light' ? 'Black' : 'White',
                        backgroundColor: theme === 'light' ? '#111111' : '#444444',
                        marginRight: '10px'
                      }}
                    >
                      {theme === 'light' ? <LightModeImage /> : <DarkModeImage />}
                    </Button>
                  </Grid>
                ))
              }
            </Grid>
            <Grid container spacing={1} justifyContent='center' padding='1em'>
              <Grid item paddingBottom='1em'>
                <Typography variant='h5' paddingTop='1em' paddingBottom='0.5em'>
                  Default Currency
                </Typography>
                <Typography variant='body'>
                  How would you like to see your account balance?
                </Typography>
              </Grid>
              <Grid item xs={12} container direction='row' justifyContent='center' alignItems='center' spacing={1}>
                {
                  Object.keys(currencies).map(currency => {
                    return (
                      <Grid item key={currency}>
                        <Button
                          variant={selectedCurrency === currency ? 'contained' : 'outlined'}
                          style={{
                            boxShadow: selectedCurrency === currency ? '0px 0px 8px 2px #E04040' : 'none',
                            backgroundColor: selectedCurrency === currency ? '#444444' : (selectedTheme === 'light' ? '#EEEEEE' : 'Black'),
                            color: selectedCurrency === currency ? 'white' : '#888888'
                          }}
                          onClick={() => handleCurrencyChange(currency)}
                          color='primary'
                        >
                          <div>
                            <div>{currency}</div>
                            <div>{currencies[currency]}</div>
                          </div>
                        </Button>
                      </Grid>
                    )
                  })
                }
              </Grid>
            </Grid>
            <Grid container paddingTop='2em'>
              <Grid item xs={12}>
                {settingsLoading
                  ? (
                    <LinearProgress />
                  )
                  : (
                    <Button
                      color='primary'
                      variant='contained'
                      size='large'
                      onClick={showDashboard}
                    >
                      View Dashboard
                    </Button>
                  )}
              </Grid>
            </Grid>

          </Grid>
        </center>
      </div>
    </UserTheme>
    // </SettingsProvider>
  )
}

export default Welcome
