import { useState } from 'react'
import { Chip, Box, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { useTheme, makeStyles } from '@mui/styles'
import style from './style'
import CounterpartyChip from '../CounterpartyChip'

const useStyles = makeStyles(style, {
  name: 'CertificateChip'
})

interface CertificateChipProps extends RouteComponentProps {
  certType: string
  lastAccessed?: string
  issuer?: string
  onIssuerClick?: (event: React.MouseEvent<HTMLDivElement>) => void
  verifier?: string
  onVerifierClick?: (event: React.MouseEvent<HTMLDivElement>) => void
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
  fieldsToDisplay?: string[]
  clickable?: boolean
  size?: number
  backgroundColor?: string
  expires?: string
  onCloseClick?: () => void
  canRevoke?: boolean
  description?: string
  iconURL?: string
}

const CertificateChip: React.FC<CertificateChipProps> = ({
  certType,
  lastAccessed,
  issuer,
  onIssuerClick,
  verifier,
  onVerifierClick,
  onClick,
  fieldsToDisplay,
  history,
  clickable = true,
  size = 1.3,
  backgroundColor = 'transparent',
  expires,
  onCloseClick,
  canRevoke = false,
  description,
  iconURL
}) => {
  if (typeof certType !== 'string') {
    throw new Error('The certType prop in CertificateChip is not a string')
  }
  const classes = useStyles()
  const theme = useTheme()

  const [certName] = useState('Unknown Cert')
  const [descriptionState] = useState(description || `${certType.substr(0, 12)}...`)

  const fields = (Array.isArray(fieldsToDisplay) && fieldsToDisplay.length > 0) ? fieldsToDisplay : Object.entries(fieldsToDisplay || {}).map(([k, v]) => `${k}: ${v}`)

  return (
    <Box sx={{ 
      width: '100%',
      display: 'flex', 
      flexDirection: 'column', 
      gap: 1 
      }}>
        <Typography variant='h5'>
          {certName}
        </Typography>
        
        <Typography variant='body1'>
          {lastAccessed || descriptionState}
        </Typography>

        {/* Fields display section */}
        {fields.length > 0 && (
          <Box sx={{ 
            ...(theme as any).templates.boxOfChips,
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: '100%'
          }}>
            <Typography variant="body1" fontWeight="bold">
              Fields:
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 0.5,
              maxWidth: '100%',
              overflow: 'hidden'
            }}>
              {fields.map(y => (
                <Chip
                  sx={{ margin: '0.4em 0.25em' }}
                  key={`field-${y}`}
                  label={y}
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Issuer section */}
        {issuer && <CounterpartyChip
          counterparty={issuer}
          onClick={onIssuerClick}
          label="Issuer"
        />}

        {/* Verifier section */}
        {verifier && 
          <CounterpartyChip
            counterparty={verifier}
            onClick={onVerifierClick}
            clickable
            size={0.85}
            label="Verifier"
          />}
        {expires && (
          <Typography className={classes.expires}>{expires}</Typography>
        )}
      </Box>
  )
}

  export default withRouter(CertificateChip)
