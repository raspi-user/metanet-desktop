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
  const [iconURLState] = useState(iconURL)
  const [descriptionState] = useState(description || `${certType.substr(0, 12)}...`)
  const [fields] = useState({})

  return (
    <Box sx={{ 
      width: '100%',
      display: 'flex', 
      flexDirection: 'column', 
      gap: 1 
      }}>
        <Typography sx={(theme as any).templates.chipLabelTitle({ size })} fontWeight="bold">
          {certName}
        </Typography>
        
        <Typography sx={(theme as any).templates.chipLabelSubtitle}>
          {lastAccessed || descriptionState}
        </Typography>

        {/* Fields display section */}
        {Array.isArray(fieldsToDisplay) && fieldsToDisplay.length > 0 && (
          <Box sx={{ 
            ...(theme as any).templates.boxOfChips,
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: '100%'
          }}>
            <Typography variant="body2" fontSize="0.9em" fontWeight="normal" mr={1}>
              fields:
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 0.5,
              maxWidth: '100%',
              overflow: 'hidden'
            }}>
              {fieldsToDisplay.map((y, j) => (
                <Chip
                  sx={{ margin: '0.4em 0.25em' }}
                  key={j}
                  label={y}
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}

        {typeof fieldsToDisplay === 'object' && !Array.isArray(fieldsToDisplay) && Object.values(fieldsToDisplay).length > 0 && (
          <Box sx={{ 
            ...(theme as any).templates.boxOfChips,
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: '100%'
          }}>
            <Typography variant="body2" fontSize="0.9em" fontWeight="normal" mr={1}>
              fields:
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 0.5,
              maxWidth: '100%',
              overflow: 'hidden'
            }}>
              {Object.entries(fieldsToDisplay).map(([k, v], j) => (
                <Chip
                  sx={{ margin: '0.4em 0.25em' }}
                  key={j}
                  label={`${(fields as any)[k] || k}: ${v}`}
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Issuer section */}
        {issuer && (
          <Box sx={{ width: '100%', mt: 1 }}>
            <Grid container spacing={1} alignItems="center">
              <Grid>
                <Typography variant="body2" fontSize="0.9em" fontWeight="normal" mr={1}>
                  issuer:
                </Typography>
              </Grid>
              <Grid>
                <CounterpartyChip
                  counterparty={issuer}
                  onClick={onIssuerClick}
                  label="Issuer"
                />
              </Grid>
            </Grid>
          </Box>
        )}

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
