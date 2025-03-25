import { useState, useRef, useEffect, useContext } from 'react'
import { useBreakpoint } from '../../utils/useBreakpoints'
import { Switch, Route, useHistory, Redirect } from 'react-router-dom'
import style from './style.js'
import { makeStyles } from '@mui/styles'
import {
  Apps as BrowseIcon,
  Settings as SettingsIcon,
  School as SchoolIcon,
  Menu as MenuIcon,
  Badge as IdentityIcon,
  ExitToApp as LogoutIcon,
  Security as SecurityIcon
} from '@mui/icons-material'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton, 
  Drawer, 
  Toolbar,
  Box,
  Divider,
  Paper
} from '@mui/material'
import Profile from '../../components/Profile.jsx'
import { WalletContext } from '../../UserInterface'
import PageLoading from '../../components/PageLoading.js'
import Apps from './Apps'

// pages
import Trust from './Trust/index.js'
import MyIdentity from './MyIdentity/index.js'
import Settings from './Settings/index'
import Security from './Security'

const useStyles = makeStyles(style as any, {
  name: 'Dashboard'
})

/**
 * Renders the Apps page and menu by default
 */
const Dashboard = () => {
  const breakpoints = useBreakpoint()
  const classes = useStyles({ breakpoints })
  const history = useHistory()
  const { appName, appVersion, managers } = useContext(WalletContext)
  const [pageLoading, setPageLoading] = useState(true)
  const [myIdentityKey, setMyIdentityKey] = useState('self')
  const [menuOpen, setMenuOpen] = useState(true)
  const menuRef = useRef(null)

  // Helper functions
  const handleDrawerToggle = () => {
    setMenuOpen(!menuOpen)
  }
  const getMargin = () => {
    if (menuOpen && !(breakpoints as any).sm) {
      return '320px'
    }
    return '0px'
  }

  // History.push wrapper
  const navigation = {
    push: (path) => {
      if ((breakpoints as any).sm) {
        setMenuOpen(false)
      }
      history.push(path)
    }
  }

  // First useEffect to handle breakpoint changes
  useEffect(() => {
    if (!(breakpoints as any).sm) {
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

  // Check if this is first login and redirect to settings if needed
  useEffect(() => {
    (async () => {
      if (managers.walletManager!.authenticated) {
        setPageLoading(false)
        const { publicKey } = await managers.walletManager!.getPublicKey({ identityKey: true })
        setMyIdentityKey(publicKey)
        
        // Check if this is a first-time login
        const isFirstTime = !localStorage.getItem('hasCompletedSetup');
        if (isFirstTime) {
          localStorage.setItem('hasCompletedSetup', 'true');
          // Navigate to settings page for new users
          history.push('/dashboard/settings');
        }
      }
    })()
  }, [managers, history])

  if (pageLoading) {
    return <PageLoading />
  }
  
  // Custom styling for menu items
  const menuItemStyle = (isSelected) => ({
    borderRadius: '8px',
    margin: '4px 8px',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(25, 118, 210, 0.1)',
    },
    ...(isSelected && {
      backgroundColor: 'rgba(25, 118, 210, 0.12)',
      '&:hover': {
        backgroundColor: 'rgba(25, 118, 210, 0.2)',
      },
    }),
  });
  
  return (
    <div className={classes.content_wrap} style={{ marginLeft: getMargin(), transition: 'margin 0.3s ease' }}>
      <div style={{ 
        marginLeft: 0, 
        width: menuOpen ? `calc(100vw - ${getMargin()})` : '100vw', 
        transition: 'width 0.3s ease, margin 0.3s ease' 
      }}>
        {(breakpoints as any).sm &&
          <div style={{ padding: '0.5em 0 0 0.5em' }} ref={menuRef}>
            <Toolbar>
              <IconButton 
                edge='start' 
                onClick={handleDrawerToggle} 
                aria-label='menu'
                sx={{
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  }
                }}
              >
                <MenuIcon />
              </IconButton>
            </Toolbar>
          </div>}
      </div>
      <Drawer 
        anchor='left' 
        open={menuOpen} 
        variant='persistent' 
        onClose={handleDrawerToggle}
        sx={{
          width: 320,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 320,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            boxShadow: 3,
            background: 'background.paper',
            overflowX: 'hidden',
          },
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%',
            p: 2
          }}
        >
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <Profile />
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Typography 
            variant="overline" 
            sx={{ 
              fontWeight: 'bold', 
              px: 2, 
              mb: 1, 
              color: 'text.secondary',
              letterSpacing: '0.08em'
            }}
          >
            MAIN MENU
          </Typography>
          
          <List component="nav" sx={{ mb: 2 }}>
            <ListItemButton
              onClick={() => navigation.push('/dashboard/apps')}
              selected={history.location.pathname === '/dashboard/apps'}
              sx={menuItemStyle(history.location.pathname === '/dashboard/apps')}
            >
              <ListItemIcon sx={{ minWidth: 40, color: history.location.pathname === '/dashboard/apps' ? 'primary.main' : 'inherit' }}>
                <BrowseIcon />
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Typography 
                    variant="body1" 
                    fontWeight={history.location.pathname === '/dashboard/apps' ? 600 : 400}
                  >
                    Apps
                  </Typography>
                }
              />
            </ListItemButton>
            
            <ListItemButton
              onClick={() => navigation.push('/dashboard/identity')}
              selected={history.location.pathname === '/dashboard/identity'}
              sx={menuItemStyle(history.location.pathname === '/dashboard/identity')}
            >
              <ListItemIcon sx={{ minWidth: 40, color: history.location.pathname === '/dashboard/identity' ? 'primary.main' : 'inherit' }}>
                <IdentityIcon />
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Typography 
                    variant="body1" 
                    fontWeight={history.location.pathname === '/dashboard/identity' ? 600 : 400}
                  >
                    Identity
                  </Typography>
                }
              />
            </ListItemButton>
            
            <ListItemButton
              onClick={() => navigation.push('/dashboard/trust')}
              selected={history.location.pathname === '/dashboard/trust'}
              sx={menuItemStyle(history.location.pathname === '/dashboard/trust')}
            >
              <ListItemIcon sx={{ minWidth: 40, color: history.location.pathname === '/dashboard/trust' ? 'primary.main' : 'inherit' }}>
                <VerifiedUserIcon />
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Typography 
                    variant="body1" 
                    fontWeight={history.location.pathname === '/dashboard/trust' ? 600 : 400}
                  >
                    Certifiers
                  </Typography>
                }
              />
            </ListItemButton>
            
            <ListItemButton
              onClick={() => navigation.push('/dashboard/security')}
              selected={history.location.pathname === '/dashboard/security'}
              sx={menuItemStyle(history.location.pathname === '/dashboard/security')}
            >
              <ListItemIcon sx={{ minWidth: 40, color: history.location.pathname === '/dashboard/security' ? 'primary.main' : 'inherit' }}>
                <SecurityIcon />
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Typography 
                    variant="body1" 
                    fontWeight={history.location.pathname === '/dashboard/security' ? 600 : 400}
                  >
                    Security
                  </Typography>
                }
              />
            </ListItemButton>
            
            <ListItemButton
              onClick={() => navigation.push('/dashboard/settings')}
              selected={history.location.pathname === '/dashboard/settings'}
              sx={menuItemStyle(history.location.pathname === '/dashboard/settings')}
            >
              <ListItemIcon sx={{ minWidth: 40, color: history.location.pathname === '/dashboard/settings' ? 'primary.main' : 'inherit' }}>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Typography 
                    variant="body1" 
                    fontWeight={history.location.pathname === '/dashboard/settings' ? 600 : 400}
                  >
                    Settings
                  </Typography>
                }
              />
            </ListItemButton>
          </List>

          <Box sx={{ mt: 'auto', mb: 2 }}>
            <ListItemButton
              onClick={() => navigation.push('/logout')}
              sx={menuItemStyle(false)}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Typography variant="body1">
                    Logout
                  </Typography>
                }
              />
            </ListItemButton>

            <Typography
              variant='caption'
              color='textSecondary'
              align='center'
              sx={{ 
                display: 'block',
                mt: 2,
                textAlign: 'center',
                width: '100%',
                opacity: 0.5,
              }}
            >
              {appName} v{appVersion}
              <br />
              <i>Made with love for the BSV Blockchain</i>
            </Typography>
          </Box>
        </Box>
      </Drawer>
      <div className={classes.page_container}>
        <Switch>
          <Redirect from='/dashboard/counterparty/self' to={`/dashboard/counterparty/${myIdentityKey}`} />
          <Redirect from='/dashboard/counterparty/anyone' to='/dashboard/counterparty/0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798' />
          <Route
            path='/dashboard/settings'
            component={Settings}
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
            path='/dashboard/security'
            component={Security}
          />
          <Route
            path='/dashboard/apps'
            component={Apps}
          />
          <Route
            component={() => {
              return (
                <div className={classes.full_width} style={{ padding: '1em' }}>
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
