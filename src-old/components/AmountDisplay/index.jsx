/* eslint-disable react/prop-types */
import React, { useState, useEffect, useContext } from 'react'
import { Tooltip, Typography } from '@mui/material'
import { formatSatoshis, formatSatoshisAsFiat, satoshisOptions } from './amountFormatHelpers'
import { ExchangeRateContext } from './ExchangeRateContextProvider'
import { useTheme } from '@emotion/react'
import { SettingsContext } from '../../context/SettingsContext.js'

/**
 * AmountDisplay component shows an amount in either satoshis or fiat currency.
 * The component allows the user to toggle between viewing amounts in satoshis or fiat,
 * and cycle through different formatting options.
 *
 * @param {object} props - The props that are passed to this component
 * @param {boolean} props.abbreviate - Flag indicating if the displayed amount should be abbreviated
 * @param {boolean} props.showPlus - Flag indicating whether to show a plus sign before the amount
 * @param {number|string} props.children - The amount (in satoshis) to display, passed as the child of this component
 *
 * Note: The component depends on the ExchangeRateContext for several pieces of data related to
 * currency preference, exchange rates, and formatting options.
 */
const AmountDisplay = ({ abbreviate, showPlus, description, children, showFiatAsInteger }) => {
  // State variables for the amount in satoshis and the corresponding formatted strings
  const [satoshis, setSatoshis] = useState(NaN)
  const [formattedSatoshis, setFormattedSatoshis] = useState('...')
  const [formattedFiatAmount, setFormattedFiatAmount] = useState('...')
  const theme = useTheme()

  // settings.currency : 'USD' | 'BSV' | 'SATS' | 'EUR' | 'GDP' | ''
  const { settings } = useContext(SettingsContext)
  const { currency: settingsCurrency } = settings

  // Retrieve necessary values and functions from the ExchangeRateContext
  const ctx = useContext(ExchangeRateContext)
  const {
    // Exchange rate context...
    satoshisPerUSD, eurPerUSD, gbpPerUSD,
    // Shared display format context...
    isFiatPreferred, fiatFormatIndex, satsFormatIndex,
    // display format update methods...
    toggleIsFiatPreferred, cycleFiatFormat, cycleSatsFormat
  } = ctx

  const opts = satoshisOptions
  const fiatFormat = opts.fiatFormats[fiatFormatIndex % opts.fiatFormats.length]
  const satsFormat = opts.satsFormats[satsFormatIndex % opts.satsFormats.length]

  const [color, setColor] = useState('textPrimary')

  // Update the satoshis and formattedSatoshis whenever the relevant props change
  useEffect(() => {
    if (Number.isInteger(Number(children))) {
      const newSatoshis = Number(children)
      setSatoshis(newSatoshis)
      // Figure out the correctly formatted amount, prefix, and color
      const satoshisToDisplay = formatSatoshis(newSatoshis, showPlus, abbreviate, satsFormat, settingsCurrency)
      if (description === 'Return to your MetaNet Balance') {
        setFormattedSatoshis(`+${satoshisToDisplay}`)
        setColor('green')
      } else if (description === 'Spend from your MetaNet Balance') {
        setFormattedSatoshis(`-${satoshisToDisplay}`)
        setColor(theme.palette.secondary.main)
      } else if (satoshisToDisplay.toString()[0] === '+') {
        setFormattedSatoshis(satoshisToDisplay)
        setColor('green')
      } else if (satoshisToDisplay.toString()[0] === '-') {
        setFormattedSatoshis(satoshisToDisplay)
        setColor(theme.palette.secondary.main)
      } else {
        setFormattedSatoshis(satoshisToDisplay)
        setColor('textPrimary')
      }
    } else {
      setSatoshis(NaN)
      setFormattedSatoshis('...')
    }
  }, [children, showPlus, abbreviate, satsFormat, settingsCurrency]) // Update if these props change

  // When satoshis or the exchange rate context changes, update the formatted fiat amount
  useEffect(() => {
    if (!isNaN(satoshis) && satoshisPerUSD) {
      const newFormattedFiat = formatSatoshisAsFiat(satoshis, satoshisPerUSD, fiatFormat, settingsCurrency, eurPerUSD, gbpPerUSD, showFiatAsInteger)
      setFormattedFiatAmount(newFormattedFiat)
    } else {
      setFormattedFiatAmount('...')
    }
  }, [satoshis, satoshisPerUSD, fiatFormat, settingsCurrency]) // Depend on satoshis and context values

  // Updated component return with direct event handling
  if (settingsCurrency) {
    return ['USD', 'EUR', 'GBP'].indexOf(settingsCurrency) > -1
      ? (
        <Tooltip disableInteractive title={<Typography color='inherit'>{formattedSatoshis}</Typography>} arrow>
          <span style={{ color }}>{formattedFiatAmount}</span>
        </Tooltip>
      )
      : (
        <Tooltip disableInteractive title={<Typography color='inherit'>{formattedFiatAmount}</Typography>} arrow>
          <span style={{ color }}>{formattedSatoshis}</span>
        </Tooltip>
      )
  } else {
    return isFiatPreferred
      ? (
        <Tooltip title={<Typography onClick={toggleIsFiatPreferred} color='inherit'>{formattedSatoshis}</Typography>} arrow>
          <span style={{ color }} onClick={cycleFiatFormat}>{formattedFiatAmount}</span>
        </Tooltip>
      )
      : (
        <Tooltip title={<Typography onClick={toggleIsFiatPreferred} color='inherit'>{formattedFiatAmount}</Typography>} arrow>
          <span style={{ color }} onClick={cycleSatsFormat}>{formattedSatoshis}</span>
        </Tooltip>
      )
  }
}
export default AmountDisplay
