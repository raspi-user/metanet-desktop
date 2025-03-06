/* eslint-disable indent */
/* eslint-disable react/prop-types */
import { useState, useContext, useEffect } from 'react'
import { Prompt } from 'react-router-dom'
import { Typography, Button, Slider, TextField, InputAdornment, Hidden, LinearProgress, Snackbar } from '@mui/material'
import { makeStyles } from '@mui/styles'
import style from './style.js'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import { toast } from 'react-toastify'
import { WalletContext } from '../../../UserInterface'

import TrustedEntity from './TrustedEntity.js'
import arraysOfObjectsAreEqual from '../../../utils/arraysOfObjectsAreEqual.js'
import AddEntityModal from './AddEntityModal.js'
import NavigationConfirmModal from './NavigationConfirmModal.js'

const useStyles = makeStyles(style, {
  name: 'Trust'
})

const Trust = ({ history }) => {
  const { network, settings, updateSettings } = useContext(WalletContext)

  // These are some hard-coded defaults, if the user doesn't have any in Settings.
  const [trustLevel, setTrustLevel] = useState(settings.trustSettings.trustLevel || 2)
  const [trustedEntities, setTrustedEntities] = useState(JSON.parse(JSON.stringify(settings.trustSettings.trustedCertifiers)))
  const [search, setSearch] = useState('')
  const [addEntityModalOpen, setAddEntityModalOpen] = useState(false)
  const [checkboxChecked, setCheckboxChecked] = useState(window.localStorage.getItem('showDialog') === 'false')
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsNeedsUpdate, setSettingsNeedsUpdate] = useState(true)
  const [nextLocation, setNextLocation] = useState(null)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const classes = useStyles()
  const totalTrustPoints = trustedEntities.reduce((a, e) => a + e.trust, 0)

  useEffect(() => {
    if (trustLevel > totalTrustPoints) {
      setTrustLevel(totalTrustPoints)
    }
  }, [totalTrustPoints])

  useEffect(() => {
    setSettingsNeedsUpdate((settings.trustSettings.trustLevel !== trustLevel) || (!arraysOfObjectsAreEqual(settings.trustSettings.trustedCertifiers, trustedEntities)))
  }, [trustedEntities, totalTrustPoints, trustLevel, settings])

  useEffect(() => {
    const unblock = history.block((location) => {
      // Block navigation when saving settings
      if (settingsNeedsUpdate) {
        setNextLocation(location)
        setSaveModalOpen(true)
        return false
      }
      return true
    })
    return () => {
      unblock()
    }
  }, [settingsNeedsUpdate, history])

  const shownTrustedEntities = trustedEntities.filter(x => {
    if (!search) {
      return true
    }
    return x.name.toLowerCase().indexOf(search.toLowerCase()) !== -1 || x.description.toLowerCase().indexOf(search.toLowerCase()) !== -1
  })

  const handleSave = async () => {
    try {
      setSettingsLoading(true)
      // Show a toast progress bar if not using save modal
      if (!saveModalOpen) {
        toast.promise(
          (async () => {
            try {
              await updateSettings(JSON.parse(JSON.stringify({
                ...settings,
                trustSettings: {
                  trustLevel,
                  trustedCertifiers: trustedEntities
                }
              })))
            } catch (e) {
              console.error(e)
              throw e
            }
          })(),
          {
            pending: 'Saving settings...',
            success: {
              render: 'Trust relationships updated!',
              autoClose: 2000
            },
            error: 'Failed to save settings! 🤯'
          }
        )
      } else {
        await updateSettings(JSON.parse(JSON.stringify({
          ...settings,
          trustSettings: {
            trustLevel,
            trustedCertifiers: trustedEntities
          }
        })))
        toast.success('Trust relationships updated!')
      }
      setSettingsNeedsUpdate(false)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSettingsLoading(false)
    }
  }

  return (
    <div className={classes.content_wrap}>
      <NavigationConfirmModal
        open={saveModalOpen}
        onConfirm={async () => {
          setSettingsNeedsUpdate(false)
          await handleSave()
          setSaveModalOpen(false)
          history.push(nextLocation.pathname)
        }}
        onCancel={() => {
          setSettingsNeedsUpdate(false)
          // Make sure state updates complete first
          setTimeout(() => {
            history.push(nextLocation.pathname)
          }, 100)
        }}
        loading={settingsLoading}
      >
        {settingsLoading
          ? <div>
            <Typography>Saving settings...</Typography>
            <LinearProgress paddingTop='1em' />
          </div>
          : 'You have unsaved changes. Do you want to save them before leaving?'}
      </NavigationConfirmModal>
      <Typography variant='h1' color='textPrimary' paddingBottom='0.5em'>Manage Your Trust Network</Typography>
      <Typography variant='body' color='textSecondary'>
        People, businesses, and websites will need endorsement by these certifiers to show up in your apps. Otherwise, you'll see them as "Unknown Identity".
      </Typography>
      <Typography variant='h2' color='textPrimary' padding='0.5em 0em 0.5em 0em'>Trust Level</Typography>
      <Typography paragraph variant='body' color='textSecondary'>
        You’ve given out a total of <b>{totalTrustPoints} {totalTrustPoints === 1 ? 'point' : 'points'}</b>. Raise the Trust Level to only see people verified by your most trusted certifiers.
      </Typography>
      <center className={classes.trust_threshold}>
        <div className={classes.slider_label_grid}>
          <Typography><b>{trustLevel}</b> / {totalTrustPoints}</Typography>
          <Slider min={1} max={totalTrustPoints} step={1} onChange={(e, v) => setTrustLevel(v)} value={trustLevel} />
        </div>
      </center>
      <Prompt
        when={settingsNeedsUpdate}
        message="You have unsaved changes, are you sure you want to leave?"
      />
      <div>
        <Typography variant='h2' color='textPrimary' padding='0em 0em 0.5em 0em'>Trusted Certifiers</Typography>
        <Typography paragraph variant='body' color='textSecondary'>Give points to show which certifiers you trust the most to confirm someone&apos;s identity. More points mean a higher priority.</Typography>
      </div>
      <div className={classes.master_grid}>
        <Hidden mdDown>
          <div>
            <Button
              variant='outlined'
              startIcon={<AddIcon />}
              onClick={() => setAddEntityModalOpen(true)}
            >
              Add Search Provider
            </Button>
          </div>
        </Hidden>
        <Hidden mdUp>
          <Button
            variant='outlined'
            startIcon={<AddIcon />}
            onClick={() => setAddEntityModalOpen(true)}
          >
            Add Search Provider
          </Button>
        </Hidden>
        <TextField
          value={search}
          onChange={(e => setSearch(e.target.value))}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon fontSize='small' />
              </InputAdornment>
            )
          }}
          label='Search'
          placeholder='Filter providers...'
          fullWidth
          sx={{
            '& .MuiInputLabel-root': {
              fontSize: '0.8rem'
            },
            '& .MuiOutlinedInput-root': {
              height: '36px',
              padding: '0 10px'
            }
          }}
        />
        <Hidden mdDown>
          <div style={{ minHeight: '1em' }} />
          <div />
        </Hidden>
        {shownTrustedEntities.map((entity, i) => <TrustedEntity
          entity={entity}
          trustedEntities={trustedEntities}
          setTrustedEntities={setTrustedEntities}
          key={`${entity.name}.${entity.description}.${entity.identityKey}`}
          classes={classes}
          history={history}
        />)}
      </div>
      {shownTrustedEntities.length === 0 && (
        <Typography align='center' color='textSecondary' style={{ marginTop: '2em' }}>No Search Providers</Typography>
      )}
      <AddEntityModal
        open={addEntityModalOpen}
        setOpen={setAddEntityModalOpen}
        trustedEntities={trustedEntities}
        setTrustedEntities={setTrustedEntities}
        classes={classes}
      />
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        open={settingsNeedsUpdate}
        message='You have unsaved changes!'
        action={
          <>
            <Button
              disabled={settingsLoading}
              color='secondary' size='small'
              onClick={handleSave}
            >
              {settingsLoading ? 'Saving...' : 'Save'}
            </Button>
          </>
        }
      />
    </div>
  )
}

export default Trust
