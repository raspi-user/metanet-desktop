import React, { useContext, useState, useEffect } from 'react'
import { useBreakpoint } from '../../../utils/useBreakpoints.js'
import {
  Typography, Divider, LinearProgress, FormControlLabel, Checkbox, FormControl, InputLabel, Select, MenuItem
} from '@mui/material'
import { makeStyles } from '@mui/styles'
import { toast } from 'react-toastify'
import style from './style'
import PasswordSettings from './Password/index.jsx'
import PhoneSettings from './Phone/index.jsx'
import RecoveryKeySettings from './RecoveryKey/index.jsx'
import About from './About/index.jsx'
import Logout from './Logout/index.jsx'
import { SettingsContext } from '../../../context/SettingsContext.js'
import KernelConfigurator from '../../../components/KernelConfigurator.jsx'

const useStyles = makeStyles(style, {
  name: 'Settings'
})

const Settings = ({ history }) => {
  const classes = useStyles()
  const breakpoints = useBreakpoint()
  const { settings, updateSettings } = useContext(SettingsContext)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [autoLaunchEnabled, setAutoLaunchEnabled] = useState(false)

  const showAutoLaunch = typeof window.CWI.isAutoLaunchEnabled === 'function'

  useEffect(() => {
    (async () => {
      if (showAutoLaunch) {
        const enabled = await window.CWI.isAutoLaunchEnabled()
        setAutoLaunchEnabled(enabled)
      }
    })()
  }, [])

  const handleAutoLaunchChange = () => {
    setAutoLaunchEnabled(x => {
      window.CWI.setAutoLaunchEnabled(!x)
      return !x
    })
  }

  const handleThemeChange = async (event) => {
    const newTheme = event.target.value

    try {
      window.localStorage.setItem('theme', JSON.stringify({ theme: newTheme }))
      setSettingsLoading(true)
      await updateSettings({
        theme: newTheme
      })
      toast.success('Settings saved!', 'center')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSettingsLoading(false)
    }
  }

  const handleCurrencyChange = async (event) => {
    const newCurrency = event.target.value

    try {
      window.localStorage.setItem('currency', JSON.stringify({ currency: newCurrency }))
      setSettingsLoading(true)
      await updateSettings({
        currency: newCurrency
      })
      toast.success('Settings saved!', 'center')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSettingsLoading(false)
    }
  }

  return (
    <>
      {(!breakpoints.sm && !breakpoints.xs) &&
        <Typography variant='h1' color='textPrimary' paragraph>Settings</Typography>}
      <div>
        {/* TODO: Move the theming settings into it's own component */}
        <Typography variant='body' color='textSecondary'>Select the default color theme</Typography>
        <br />
        <FormControl variant="outlined" style={{ margin: '1em 0 2em 0', width: '100%' }}>
          <InputLabel id="theme-select-label">Theme</InputLabel>
          <Select
            labelId="theme-select-label"
            id="theme"
            value={settings.theme}
            onChange={handleThemeChange}
            label="Theme"
          >
            <MenuItem value="system">System</MenuItem>
            <MenuItem value="light">Light</MenuItem>
            <MenuItem value="dark">Dark</MenuItem>
          </Select>
        </FormControl>
        <br />
        <Typography variant='body' color='textSecondary'>Select the default currency</Typography>
        <br />
        <FormControl variant="outlined" style={{ margin: '1em 0 2em 0', width: '100%' }}>
          <InputLabel id="currency-select-label">Currency</InputLabel>
          <Select
            labelId="currency-select-label"
            id="currency"
            value={settings.currency}
            onChange={handleCurrencyChange}
            label="Currency"
          >
            <MenuItem value='USD'>$10</MenuItem>
            <MenuItem value='BSV'>0.033</MenuItem>
            <MenuItem value='SATS'>3,333,333</MenuItem>
            <MenuItem value='EUR'>€9.15</MenuItem>
            <MenuItem value='GBP'>£7.86</MenuItem>
          </Select>
        </FormControl>
        {settingsLoading ? <LinearProgress style={{ marginTop: '1em' }} /> : <></>}
      </div>
      <PasswordSettings history={history} />
      <Divider />
      <br />
      <PhoneSettings />
      <Divider />
      <br />
      <RecoveryKeySettings />
      <Divider />
      <br />
      <About />
      <Divider />
      <br />
      <KernelConfigurator />
      <br />
      <br />
      {showAutoLaunch && <>
        <FormControlLabel
          control={<Checkbox
            checked={autoLaunchEnabled}
            onChange={handleAutoLaunchChange}
          />}
          label={<span>Auto-launch MetaNet Client when you log in</span>}
        />
        <br />
        <br />
      </>}
      <Logout history={history} />
    </>
  )
}

export default Settings
