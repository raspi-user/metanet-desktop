import React, { useEffect, useState, useRef, useContext } from 'react'
import { Typography, TextField, LinearProgress, Paper, Box } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { useTheme } from '@mui/styles'
import MetanetApp from '../../../components/MetanetApp'
import SearchIcon from '@mui/icons-material/Search'
import Fuse from 'fuse.js'
import { WalletContext } from '../../../WalletContext'
import AppLogo from '../../../components/AppLogo'

const Apps = () => {
  const theme = useTheme()
  const { recentApps } = useContext(WalletContext)
  const [filteredApps, setFilteredApps] = useState([])

  const [fuseInstance, setFuseInstance] = useState(null)
  const [search, setSearch] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [loading, setLoading] = useState(true)

  const inputRef = useRef(null)

  // Configure fuse to search by app name
  const options = {
    // shouldSort: true,
    threshold: 0.3,
    location: 0,
    distance: 100,
    includeMatches: true,
    useExtendedSearch: true,
    keys: ['appName']
  }

  const handleSearchChange = async (e) => {
    const value = e.target.value
    setSearch(value)

    // Clear the filtered apps once the text box is empty (instead of searching for empty)
    if (value === '') {
      setFilteredApps(recentApps)
      return
    }
    // Search for a matching app by name
    if (fuseInstance) {
      const results = fuseInstance.search(value).map(match => match.item)
      setFilteredApps(results)
    }
  }

  // Support the search field expand animation
  const handleSearchFocus = () => {
    setIsExpanded(true)
  }
  const handleSearchBlur = () => {
    setIsExpanded(false)
  }
  const handleIconClick = () => {
    setIsExpanded(true)
    inputRef.current.focus()
  }


  useEffect(() => {
    const fuse = new Fuse(recentApps, options)
    setFuseInstance(fuse)
    setLoading(false)
  }, [recentApps])

  return (
    <Box sx={{ 
      padding: theme.spacing(3), 
      maxWidth: { xs: '100%', sm: '90%', md: '1200px' }, 
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <Typography variant="h1" color="textPrimary" sx={{ mb: 2 }}>
        Applications
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
        Browse and manage your application permissions.
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <TextField
          variant="outlined"
          fullWidth
          value={search}
          onChange={handleSearchChange}
          placeholder="Search"
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          inputRef={inputRef}
          InputProps={{
            startAdornment: (
              <SearchIcon
                onClick={handleIconClick}
                sx={{ mr: 1, cursor: 'pointer' }}
              />
            ),
            sx: {
              height: '3em'
            }
          }}
          sx={{
            mt: 1,
            mb: 3,
            width: isExpanded ? 'calc(100%)' : '8em',
            transition: 'width 0.3s ease'
          }}
        />
      </Box>

      {(search === '' && recentApps.length > 3) && (
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, mb: 4, bgcolor: 'background.paper', borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Recent Applications
          </Typography>

          <Grid 
            container 
            spacing={{ xs: 1, sm: 2, md: 3 }}
            justifyContent="center"
          >
            {recentApps.map((app) => (
              <Grid
                key={app.domain}
                xs={4}
                sm={3}
                md={2}
                lg={1.5}
                xl={1}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  mb: { xs: 1, sm: 2 }
                }}
              >
                <MetanetApp
                  appName={app.appName}
                  iconImageUrl={app.appIconImageUrl}
                  domain={app.domain}
                />
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      { search !== '' && <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Search Results
        </Typography>

        {(filteredApps.length === 0 && !loading) && (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h5" color="textSecondary">
              None found
            </Typography>
          </Box>
        )}

        <Grid 
          container 
          spacing={{ xs: 1, sm: 2, md: 3 }}
          justifyContent="center"
        >
          {filteredApps.map((app) => (
            <Grid
              key={app.domain}
              xs={4}
              sm={3}
              md={2}
              lg={1.5}
              xl={1}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                mb: { xs: 1, sm: 2 }
              }}
            >
              <MetanetApp
                appName={app.appName}
                iconImageUrl={app.appIconImageUrl}
                domain={app.domain}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>}
    </Box>
  )
}

export default Apps
