import { forwardRef, useState, useEffect } from 'react'
import { 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  FormHelperText,
  Box,
  Stack,
  Typography
} from '@mui/material'
import { parsePhoneNumberFromString, isValidPhoneNumber } from 'libphonenumber-js/min'

// Define country codes with priority countries at the top
const priorityCountries = ['US', 'GB', 'CA', 'AU'];
const otherCountries = [
  'AF', 'AL', 'DZ', 'AS', 'AD', 'AO', 'AI', 'AG', 'AR', 'AM', 'AW', 'AT', 'AZ', 'BS', 'BH', 'BD', 'BB', 'BY', 'BE',
  'BZ', 'BJ', 'BM', 'BT', 'BO', 'BA', 'BW', 'BR', 'IO', 'VG', 'BN', 'BG', 'BF', 'BI', 'KH', 'CM', 'CV', 'KY', 'CF',
  'TD', 'CL', 'CN', 'CO', 'KM', 'CG', 'CD', 'CK', 'CR', 'CI', 'HR', 'CU', 'CY', 'CZ', 'DK', 'DJ', 'DM', 'DO', 'EC',
  'EG', 'SV', 'GQ', 'ER', 'EE', 'ET', 'FK', 'FO', 'FJ', 'FI', 'FR', 'GF', 'PF', 'GA', 'GM', 'GE', 'DE', 'GH', 'GI',
  'GR', 'GL', 'GD', 'GP', 'GU', 'GT', 'GN', 'GW', 'GY', 'HT', 'HN', 'HK', 'HU', 'IS', 'IN', 'ID', 'IR', 'IQ', 'IE',
  'IL', 'IT', 'JM', 'JP', 'JO', 'KZ', 'KE', 'KI', 'KP', 'KR', 'KW', 'KG', 'LA', 'LV', 'LB', 'LS', 'LR', 'LY', 'LI',
  'LT', 'LU', 'MO', 'MK', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MH', 'MQ', 'MR', 'MU', 'YT', 'MX', 'FM', 'MD', 'MC',
  'MN', 'ME', 'MS', 'MA', 'MZ', 'MM', 'NA', 'NR', 'NP', 'NL', 'NC', 'NZ', 'NI', 'NE', 'NG', 'NU', 'NF', 'MP', 'NO',
  'OM', 'PK', 'PW', 'PS', 'PA', 'PG', 'PY', 'PE', 'PH', 'PL', 'PT', 'PR', 'QA', 'RE', 'RO', 'RU', 'RW', 'BL', 'SH',
  'KN', 'LC', 'MF', 'PM', 'VC', 'WS', 'SM', 'ST', 'SA', 'SN', 'RS', 'SC', 'SL', 'SG', 'SX', 'SK', 'SI', 'SB', 'SO',
  'ZA', 'GS', 'SS', 'ES', 'LK', 'SD', 'SR', 'SJ', 'SZ', 'SE', 'CH', 'SY', 'TW', 'TJ', 'TZ', 'TH', 'TL', 'TG', 'TK',
  'TO', 'TT', 'TN', 'TR', 'TM', 'TC', 'TV', 'VI', 'UG', 'UA', 'AE', 'GB', 'US', 'UY', 'UZ', 'VU', 'VA', 'VE', 'VN',
  'WF', 'EH', 'YE', 'ZM', 'ZW'
] as const;

// Country data with names and dial codes
const countryData: Record<string, { name: string; dialCode: string }> = {
  'US': { name: 'United States', dialCode: '+1' },
  'GB': { name: 'United Kingdom', dialCode: '+44' },
  'CA': { name: 'Canada', dialCode: '+1' },
  'AU': { name: 'Australia', dialCode: '+61' },
  'AF': { name: 'Afghanistan', dialCode: '+93' },
  'AL': { name: 'Albania', dialCode: '+355' },
  'DZ': { name: 'Algeria', dialCode: '+213' },
  'AR': { name: 'Argentina', dialCode: '+54' },
  'DE': { name: 'Germany', dialCode: '+49' },
  'IN': { name: 'India', dialCode: '+91' },
  'JP': { name: 'Japan', dialCode: '+81' },
  'MX': { name: 'Mexico', dialCode: '+52' },
  'BR': { name: 'Brazil', dialCode: '+55' },
  'CN': { name: 'China', dialCode: '+86' },
  'ES': { name: 'Spain', dialCode: '+34' },
  'FR': { name: 'France', dialCode: '+33' },
};

interface PhoneEntryProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  sx?: any;
}

const PhoneEntry = forwardRef<HTMLDivElement, PhoneEntryProps>((props, ref) => {
  const { value, onChange, error, required = false, disabled = false, sx = {}, ...other } = props;
  const [country, setCountry] = useState<string>('US');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Initialize from the provided value if any
  useEffect(() => {
    if (value) {
      try {
        const phoneInfo = parsePhoneNumberFromString(value);
        if (phoneInfo) {
          setCountry(phoneInfo.country || 'US');
          setPhoneNumber(phoneInfo.nationalNumber);
        }
      } catch (error) {
        console.error('Error parsing phone number:', error);
      }
    }
  }, [value]);

  // When country or phone number changes, update the parent component
  useEffect(() => {
    if (phoneNumber) {
      try {
        const fullNumber = `${countryData[country]?.dialCode || '+1'}${phoneNumber}`;
        const isNumberValid = isValidPhoneNumber(fullNumber);
        setIsValid(isNumberValid);
        
        if (isNumberValid) {
          onChange(fullNumber);
          setErrorMessage('');
        } else {
          setErrorMessage('Invalid phone number');
          // Still pass the value to parent even if invalid
          onChange(fullNumber);
        }
      } catch (error) {
        console.error('Error validating phone number:', error);
        onChange(`${countryData[country]?.dialCode || '+1'}${phoneNumber}`);
        setErrorMessage('Invalid phone number format');
      }
    } else {
      onChange('');
      setIsValid(!required);
      setErrorMessage(required ? 'Phone number is required' : '');
    }
  }, [country, phoneNumber, onChange, required]);

  // Handle phone number input with formatting
  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value.replace(/\D/g, ''); // Strip non-digits
    setPhoneNumber(input);
  };

  return (
    <Box sx={{ width: '100%', ...sx }} {...other}>
      <Stack direction="row" spacing={2}>
        <Box width="30%">
          <FormControl fullWidth variant="outlined" error={!!error} required={required} disabled={disabled}>
            <InputLabel id="country-select-label">Country</InputLabel>
            <Select
              labelId="country-select-label"
              id="country-select"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              label="Country"
              sx={{ 
                '& .MuiOutlinedInput-notchedOutline': {
                  borderRadius: 1
                }
              }}
            >
              <MenuItem disabled value="">
                <em>Select a country</em>
              </MenuItem>
              
              {/* Priority countries group */}
              {priorityCountries.map((code) => (
                <MenuItem key={code} value={code}>
                  {code} ({countryData[code]?.dialCode})
                </MenuItem>
              ))}
              
              <MenuItem disabled>
                <em>───────────────</em>
              </MenuItem>
              
              {/* Other countries */}
              {otherCountries.filter(code => !priorityCountries.includes(code) && countryData[code]).map((code) => (
                <MenuItem key={code} value={code}>
                  {countryData[code]?.name || code} ({countryData[code]?.dialCode})
                </MenuItem>
              ))}
            </Select>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        </Box>
        
        <Box width="70%" position="relative">
          <TextField
            fullWidth
            label="Phone Number"
            variant="outlined"
            onChange={handlePhoneChange}
            error={!isValid || !!error}
            helperText={errorMessage || error}
            required={required}
            disabled={disabled}
            inputRef={ref}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1
              }
            }}
          />
        </Box>
      </Stack>
    </Box>
  );
});

export default PhoneEntry;
