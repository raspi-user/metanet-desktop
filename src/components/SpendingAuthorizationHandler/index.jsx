import React, { useState, useEffect, useContext } from 'react'
import {
  DialogContent,
  Typography,
  Fab,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'
import style from './style'
import AmountDisplay from '../AmountDisplay'
import { Send, Cancel } from '@mui/icons-material'
import CustomDialog from '../CustomDialog/index.jsx'
import UIContext from '../../UIContext'
import AppChip from '../AppChip'
import { CwiExternalServices } from 'cwi-external-services'

const services = new CwiExternalServices(CwiExternalServices.createDefaultOptions())
const useStyles = makeStyles(style, {
  name: 'SpendingAuthorizationHandler'
})

const SpendingAuthorizationHandler = () => {
  const {
    onFocusRequested,
    onFocusRelinquished,
    isFocused
  } = useContext(UIContext)
  const [usdPerBsv, setUsdPerBSV] = useState(70)
  const [wasOriginallyFocused, setWasOriginallyFocused] = useState(false)
  const [open, setOpen] = useState(false)
  const [perms, setPerms] = useState([
    // originator
    // requestID
    // lineItems
    // renewal
    // transactionAmount
    // amountPreviouslyAuthorized
  ])
  const classes = useStyles()

  // Helper function to figure out the upgrade amount (note: consider moving to utils)
  const determineUpgradeAmount = (previousAmountInSats, returnType = 'sats') => {
    let usdAmount
    const previousAmountInUsd = previousAmountInSats * (usdPerBsv / 100000000)

    // The supported spending limits are $5, $10, $20, $50
    if (previousAmountInUsd <= 5) {
      usdAmount = 5
    } else if (previousAmountInUsd <= 10) {
      usdAmount = 10
    } else if (previousAmountInUsd <= 20) {
      usdAmount = 20
    } else {
      usdAmount = 50
    }

    if (returnType === 'sats') {
      return Math.round(usdAmount / (usdPerBsv / 100000000))
    }
    return usdAmount
  }

  const handleCancel = () => {
    window.CWI.denySpendingAuthorization({ requestID: perms[0].requestID })
    setPerms(p => {
      p.shift()
      if (p.length === 0) {
        setOpen(false)
        if (!wasOriginallyFocused) {
          onFocusRelinquished()
        }
      }
      return [...p]
    })
  }

  const handleGrant = async ({ singular = true, amount }) => {
    window.CWI.grantSpendingAuthorization({
      requestID: perms[0].requestID,
      singular,
      amount
    })
    setPerms(p => {
      p.shift()
      if (p.length === 0) {
        setOpen(false)
        if (!wasOriginallyFocused) {
          onFocusRelinquished()
        }
      }
      return [...p]
    })
  }

  useEffect(() => {
    let id
    (async () => {
      id = await window.CWI.bindCallback(
        'onSpendingAuthorizationRequested',
        async ({
          requestID,
          originator,
          description,
          transactionAmount,
          totalPastSpending,
          amountPreviouslyAuthorized,
          authorizationAmount,
          renewal,
          lineItems
        }) => {
          setOpen(true)
          const wasOriginallyFocused = await isFocused()
          if (!wasOriginallyFocused) {
            await onFocusRequested()
          }
          if (perms.length === 0) {
            setWasOriginallyFocused(wasOriginallyFocused)
          }
          setPerms(p => {
            p.push({
              requestID,
              originator,
              description,
              transactionAmount,
              totalPastSpending,
              amountPreviouslyAuthorized,
              authorizationAmount,
              renewal,
              lineItems
            })
            return [...p]
          })
          const rate = await services.getBsvExchangeRate()
          setUsdPerBSV(rate)
        }
      )
    })()
    return () => {
      if (id) {
        window.CWI.unbindCallback('onSpendingAuthorizationRequested', id)
      }
    }
  }, [])

  if (typeof perms[0] === 'undefined') {
    return null
  }

  return (
    <CustomDialog
      open={open}
      title={!perms[0].renewal ? 'Spending Request' : 'Spending Check-in'}
    >
      <DialogContent>
        <br />
        <center>
          <AppChip
            size={2.5}
            label={perms[0].originator}
            clickable={false}
            showDomain
          />
          <br />
          <br />
        </center>
        <Typography align='center'>
          would like to spend
        </Typography>
        <Typography variant='h3' align='center' paragraph color='textPrimary'>
          <AmountDisplay >{perms[0].transactionAmount}</AmountDisplay>
        </Typography>

        <Typography align='center'>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 250 }} aria-label='simple table' size='small'>
              <TableHead>
                <TableRow
                  sx={{
                    borderBottom: '2px solid black',
                    '& th': {
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }
                  }}
                >
                  <TableCell>Description</TableCell>
                  <TableCell align='right'>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {perms[0].lineItems.map((row) => (
                  <TableRow
                    key={row.description}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component='th' scope='row'>
                      {row.description}
                    </TableCell>
                    <TableCell align='right'> <AmountDisplay showPlus abbreviate>{row.satoshis}</AmountDisplay></TableCell>
                  </TableRow>
                ))}
                <TableRow
                  sx={{ '&:last-child td, &:last-child th': { border: 0, fontWeight: 'bold' } }}
                >
                  <TableCell component='th' scope='row'>
                    <b>Total</b>
                  </TableCell>
                  <TableCell align='right'><AmountDisplay showPlus abbreviate>{perms[0].transactionAmount * -1}</AmountDisplay></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Typography>

        <div className={classes.fabs_wrap}>
          <Tooltip title='Deny Permission'>
            <Fab
              color='secondary'
              onClick={handleCancel}
              variant='extended'
            >
              <Cancel className={classes.button_icon} />
              Deny
            </Fab>
          </Tooltip>
          <Fab
            variant='extended'
            onClick={() => handleGrant({ singular: false, amount: determineUpgradeAmount(perms[0].amountPreviouslyAuthorized) })}
          >
            Allow up to &nbsp;<AmountDisplay showFiatAsInteger>{determineUpgradeAmount(perms[0].amountPreviouslyAuthorized)}</AmountDisplay>
          </Fab>
          <Tooltip title='Allow Once'>
            <Fab
              color='primary'
              onClick={() => handleGrant({ singular: true })}
              variant='extended'
            >
              <Send className={classes.button_icon} />
              Allow
            </Fab>
          </Tooltip>
        </div>
      </DialogContent>
    </CustomDialog>
  )
}

export default SpendingAuthorizationHandler
