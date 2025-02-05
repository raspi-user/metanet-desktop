import React, { useState, useRef, useEffect, useContext } from 'react'
import { useTheme } from '@emotion/react'
import { useBreakpoint } from '../../utils/useBreakpoints.js'
import { Switch, Route, useHistory, Redirect } from 'react-router-dom'
import style from './style'
import { makeStyles } from '@mui/styles'
import {
  Search as SearchIcon,
  Apps as BrowseIcon,
  Settings as SettingsIcon,
  School as SchoolIcon,
  Menu as MenuIcon,
  Badge as IdentityIcon
} from '@mui/icons-material'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
  , IconButton, Drawer, Toolbar
} from '@mui/material'
import AppAccess from './AppAccess/index.jsx'
import Trust from './Trust/index.jsx'
import MyIdentity from './MyIdentity/index.jsx'
import Apps from './Apps'
import App from './App/Index.jsx'
import Settings from './Settings/index.jsx'
import redirectIfLoggedOut from '../../utils/redirectIfLoggedOut'
import Profile from '../../components/Profile.jsx'
import BasketAccess from './BasketAccess'
import CertificateAccess from './CertificateAccess'
import UIContext from '../../UIContext'
import PageLoading from '../../components/PageLoading'
import ProtocolAccess from './ProtocolAccess/index.jsx'
import CounterpartyAccess from './CounterpartyAccess/index.jsx'

const useStyles = makeStyles(style, {
  name: 'Dashboard'
})

/**
 * Renders the Apps page and menu by default
 */
const Dashboard = () => {
  const breakpoints = useBreakpoint()
  const classes = useStyles({ breakpoints })
  const theme = useTheme()
  const history = useHistory()
  const { appName, appVersion } = useContext(UIContext)
  const [pageLoading, setPageLoading] = useState(true)
  const [myIdentityKey, setMyIdentityKey] = useState('self')

  const [menuOpen, setMenuOpen] = useState(true)
  const menuRef = useRef(null)

  // Helper functions
  const handleDrawerToggle = () => {
    setMenuOpen(!menuOpen)
  }
  const getMargin = () => {
    if (menuOpen && !breakpoints.sm) {
      return '16em'
    }
    return '0em'
  }

  // History.push wrapper
  const navigation = {
    push: (path) => {
      if (breakpoints.sm) {
        setMenuOpen(false)
      }
      history.push(path)
    }
  }

  // First useEffect to handle breakpoint changes
  useEffect(() => {
    if (!breakpoints.sm) {
      setMenuOpen(true)
    } else {
      setMenuOpen(false)
    }
  }, [breakpoints])

  // Second useEffect to handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  useEffect(() => {
    (async () => {
      const isLoggedIn = redirectIfLoggedOut(history)
      if (isLoggedIn) {
        setPageLoading(false)
        setMyIdentityKey(await window.CWI.getPublicKey({ identityKey: true }))
      }
    })()
  }, [history])

  if (pageLoading) {
    return <PageLoading />
  }
  return (
    <div className={classes.content_wrap} style={{ marginLeft: getMargin() }}>
      <div style={{ marginLeft: 0, width: menuOpen ? 'calc(100vw - 16em)' : '100vw', transition: 'margin .3s' }}>
        {breakpoints.sm &&
          <div style={{ padding: '0.5em 0 0 0.5em' }} ref={menuRef}>
            <Toolbar>
              <IconButton edge='start' onClick={handleDrawerToggle} aria-label='menu'>
                <MenuIcon style={{ color: 'textPrimary', height: '1.25em', width: '1.25em' }} />
              </IconButton>
            </Toolbar>
          </div>}
      </div>
      <Drawer anchor='left' open={menuOpen} variant='persistent' onClose={handleDrawerToggle}>
        <div className={classes.list_wrap}>
          <Profile />
          <List>
            <ListItem
              button
              onClick={() => navigation.push('/dashboard/apps')}
              selected={history.location.pathname === '/dashboard/apps'}
            >
              <ListItemIcon>
                <BrowseIcon />
              </ListItemIcon>
              <ListItemText>
                Apps
              </ListItemText>
            </ListItem>
            {/* <ListItem disabled
              button
              onClick={() => navigation.push('/dashboard/trends')}
              selected={
                history.location.pathname === '/dashboard/trends'
              }
            >
              <ListItemIcon>
              <TrendsIcon
              />
              </ListItemIcon>
              <ListItemText>
                Trends
              </ListItemText>
            </ListItem>
            <ListItem disabled
              button
              onClick={() =>
                navigation.push('/dashboard/access')}
              selected={
                history.location.pathname === '/dashboard/access'
              }
            >
              <ListItemIcon>
                <AccessIcon
                />
              </ListItemIcon>
              <ListItemText>
                Access
              </ListItemText>
            </ListItem> */}
            <ListItemButton
              onClick={() => {
                navigation.push({
                  pathname: '/dashboard/identity'
                })
              }}
              selected={history.location.pathname === '/dashboard/identity'}
            >
              <ListItemIcon>
                <IdentityIcon />
              </ListItemIcon>
              <ListItemText>
                My Identity
              </ListItemText>
            </ListItemButton>
            <ListItemButton
              onClick={() => {
                navigation.push({
                  pathname: '/dashboard/trust'
                })
              }}
              selected={history.location.pathname === '/dashboard/trust'}
            >
              <ListItemIcon>
                <VerifiedUserIcon />
              </ListItemIcon>
              <ListItemText>
                Trust Network
              </ListItemText>
            </ListItemButton>
            <ListItem
              button
              onClick={() => navigation.push('/dashboard/settings')}
              selected={
                history.location.pathname === '/dashboard/settings'
              }
            >
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText>
                Settings
              </ListItemText>
            </ListItem>

            <ListItemButton
              onClick={() => {
                window.open('https://projectbabbage.com/docs', '_blank')
              }}
            >
              <ListItemIcon>
                <SchoolIcon />
              </ListItemIcon>
              <ListItemText style={{ color: theme.palette.primary.secondary }}>
                Learn MetaNet Tech
              </ListItemText>
            </ListItemButton>

          </List>

          <center className={classes.sig_wrap}>
            <Typography
              variant='caption'
              color='textSecondary'
              className={classes.signature}
              align='center'
            >
              {appName} v{appVersion}<br /><br />
              Made with love by<br /><i>the Babbage Team</i>
            </Typography>
          </center>
        </div>
      </Drawer>
      <div className={classes.page_container}>
        <Switch>
          <Redirect from='/dashboard/counterparty/self' to={`/dashboard/counterparty/${myIdentityKey}`} />
          <Redirect from='/dashboard/counterparty/anyone' to='/dashboard/counterparty/0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798' />
          <Route
            path='/dashboard/manage-app/:originator'
            component={AppAccess}
          />
          <Route
            path='/dashboard/app/:app'
            component={App}
          />
          <Route
            path='/dashboard/settings'
            component={Settings}
          />
          <Route
            default
            path='/dashboard/apps'
            component={Apps}
          />
          <Route
            path='/dashboard/identity'
            component={MyIdentity}
          />
          <Route
            path='/dashboard/trust'
            component={Trust}
          />
          <Route
            path='/dashboard/basket/:basketId'
            component={BasketAccess}
          />
          <Route
            path='/dashboard/protocol/:protocolId'
            component={ProtocolAccess}
          />
          <Route
            path='/dashboard/counterparty/:counterparty'
            component={CounterpartyAccess}
          />
          <Route
            path='/dashboard/certificate/:certType'
            component={CertificateAccess}
          />
          <Route
            className={classes.full_width}
            default
            component={() => {
              return (
                <div style={{ padding: '1em' }}>
                  <br />
                  <br />
                  <Typography align='center' color='textPrimary'>Use the menu to select a page</Typography>
                </div>
              )
            }}
          />
        </Switch>
      </div>
    </div>
  )
}

export default Dashboard
