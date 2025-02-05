/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react'
import { Grid, IconButton, Typography } from '@mui/material'
import { DEFAULT_APP_ICON } from '../../../constants/popularApps'
import RecentActions from '../../../components/RecentActions'
import AccessAtAGlance from '../../../components/AccessAtAGlance'
import PageHeader from '../../../components/PageHeader'
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min'
import CheckIcon from '@mui/icons-material/Check'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import fetchAndCacheAppData from '../../../utils/fetchAndCacheAppData'

const transformTransactions = (transactions) => {
  // merge default inputs and outputs
  for (const tx of transactions) {
    const mergedInputs = (tx.inputs || []).filter(i => i.basket !== 'default')
    const mergedOutputs = (tx.outputs || []).filter(o => o.basket !== 'default')
    const defaultInputs = (tx.inputs || []).filter(i => i.basket === 'default')
    const defaultOutputs = (tx.outputs || []).filter(o => o.basket === 'default')
    let defaultNetAmount = 0
    for (const input of defaultInputs) defaultNetAmount += -input.amount
    for (const output of defaultOutputs) defaultNetAmount += output.amount
    if (defaultNetAmount < 0) {
      mergedInputs.push({ ...defaultInputs[0], amount: -defaultNetAmount })
    } else if (defaultNetAmount > 0) {
      mergedOutputs.push({ ...defaultOutputs[0], amount: defaultNetAmount })
    }
    tx.inputs = mergedInputs
    tx.outputs = mergedOutputs
    tx.fees = defaultNetAmount - tx.amount
  }
}

const Apps = ({ history }) => {
  const location = useLocation()
  const appDomain = location.state?.domain
  const [appName, setAppName] = useState(appDomain)
  const [appIcon, setAppIcon] = useState(DEFAULT_APP_ICON)
  const [displayLimit, setDisplayLimit] = useState(5)
  const [appActions, setAppActions] = useState({})
  const [loading, setLoading] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [allActionsShown, setAllActionsShown] = useState(true)
  const recentActionParams = {
    loading,
    appActions,
    displayLimit,
    setDisplayLimit,
    setRefresh,
    allActionsShown
  }
  const [copied, setCopied] = useState({ id: false, registryOperator: false })

  // Copies the data and timeouts the checkmark icon
  const handleCopy = (data, type) => {
    navigator.clipboard.writeText(data)
    setCopied({ ...copied, [type]: true })
    setTimeout(() => {
      setCopied({ ...copied, [type]: false })
    }, 2000)
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        // Use the helper function to fetch and update data
        fetchAndCacheAppData(appDomain, setAppIcon, setAppName, DEFAULT_APP_ICON)

        const cacheKey = `transactions_${appDomain}`

        // Try to load data from the local storage cache first
        const cachedData = window.localStorage.getItem(cacheKey)
        const cachedResults = cachedData ? JSON.parse(cachedData) : null
        if (cachedResults) {
          transformTransactions(cachedResults.transactions)
          setAppActions(cachedResults)
          setLoading(false)
        }

        // Get a list of the 5 most recent actions from the app
        // Also request input and output amounts and descriptions from Ninja
        const results = await window.CWI.ninja.getTransactions({
          limit: displayLimit,
          includeBasket: true,
          includeTags: true,
          order: 'descending',
          label: `babbage_app_${appDomain}`,
          addInputsAndOutputs: true,
          status: ['completed', 'unproven', 'sending']
        })

        // Change display message if we've exhausted all actions to display
        if (results.totalTransactions > results.transactions.length) {
          setAllActionsShown(false)
        } else {
          setAllActionsShown(true)
        }
        transformTransactions(results.transactions)
        setAppActions(results)

        setLoading(false)
        setRefresh(false)
        window.localStorage.setItem(cacheKey, JSON.stringify(results))
      } catch (e) {
        /* do nothing */
        console.error(e)
        setLoading(false)
        setRefresh(false)
      }
    })()
  }, [refresh])

  return (
    <Grid container spacing={3} direction='column'>
      <Grid item xs={12}>
        <PageHeader
          history={history}
          title={appName}
          subheading={
            <div>
              <Typography variant='caption' color='textSecondary'>
                {`https://${appDomain}`}
                <IconButton size='small' onClick={() => handleCopy(appDomain, 'id')} disabled={copied.id}>
                  {copied.id ? <CheckIcon /> : <ContentCopyIcon fontSize='small' />}
                </IconButton>
              </Typography>
            </div>
          } icon={appIcon} buttonTitle='Launch' onClick={() => {
            window.open(`https://${appDomain}`, '_blank')
          }}
        />
      </Grid>
      {/* <Grid item sx={12} style={{ width: '100%', height: '10em', background: 'gray' }}>
          <Typography paddingBottom='2em' align='center'>Total App Cashflow</Typography>
        </Grid> */}
      <Grid container item spacing={3} direction='row'>
        <Grid item lg={6} md={6} xs={12}>
          <RecentActions {...recentActionParams} />
        </Grid>
        <Grid item lg={6} md={6} xs={12}>
          <AccessAtAGlance {...{ originator: appDomain, loading, setRefresh, history }} />
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Apps
