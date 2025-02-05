import React, { forwardRef, useState } from 'react'
import { makeStyles } from '@mui/styles'
import { TextField } from '@mui/material'
import Input from 'react-phone-number-input/input'
import { CountryDropdown } from 'react-country-region-selector'
import 'react-phone-number-input/style.css'

const useStyles = makeStyles(theme => ({
  phone_wrap: {
    width: '100%',
    '& > div': {
      width: '100%'
    }
  },
  country_dropdown: {
    width: '100%',
    marginTop: theme.spacing(1)
  }
}), { name: 'PhoneEntry' })
const PhoneField = forwardRef((props, ref) => (
  <TextField
    {...props}
    inputRef={ref}
    fullWidth
  />
))
const PhoneEntry = props => {
  const [country, setCountry] = useState(null)
  const classes = useStyles()

  const handleCountryChange = (val) => {
    setCountry(val)
  }

  return (
    <div className={classes.phone_wrap}>
      <CountryDropdown
        value={country}
        priorityOptions={['US', 'GB']}
        labelType='long'
        valueType='short'
        onChange={handleCountryChange}
        style={{ width: '100%', height: '40px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '4px', padding: '8px' }}
      />
      {country && (
        <Input
          defaultCountry='US'
          country={country}
          inputComponent={PhoneField}
          {...props}
        />
      )}

    </div>
  )
}

export default PhoneEntry
