import { useState } from 'react'
import { Grid, Chip, Badge, Avatar, Tooltip } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { withRouter, RouteComponentProps } from 'react-router-dom'
// import { ProtoMap } from 'babbage-protomap'
// import { Img } from 'uhrp-react'
import makeStyles from '@mui/styles/makeStyles'
import { useTheme } from '@mui/styles'
import style from './style'
import { DEFAULT_APP_ICON } from '../../constants/popularApps'
// import confederacyHost from '../../utils/confederacyHost'
import CounterpartyChip from '../CounterpartyChip/index'
import DataObject from '@mui/icons-material/DataObject'
// import { SettingsContext } from '../../context/SettingsContext'

const useStyles = makeStyles(style as any, {
  name: 'ProtoChip'
})

interface ProtoChipProps extends RouteComponentProps {
  securityLevel: string
  protocolID: string
  counterparty?: string
  lastAccessed?: string
  originator?: string
  clickable?: boolean
  size?: number
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
  expires?: string
  onCloseClick?: () => void
  canRevoke?: boolean
  description?: string
  iconURL?: string
  backgroundColor?: string
}

const ProtoChip: React.FC<ProtoChipProps> = ({
  securityLevel,
  protocolID,
  counterparty,
  lastAccessed,
  originator,
  history,
  clickable = false,
  size = 1.3,
  onClick,
  expires,
  onCloseClick = () => { },
  canRevoke = true,
  description,
  iconURL,
  backgroundColor = 'transparent'
}) => {
  if (typeof protocolID !== 'string') {
    throw new Error('ProtoChip requires protocolID to be a string')
  }
  const classes = useStyles()
  const theme: any = useTheme()
  // const { settings } = useContext(SettingsContext)

  // Initialize ProtoMap
  // const protomap = new ProtoMap()
  // protomap.config.confederacyHost = confederacyHost()

  const [protocolName,
    // setProtocolName
  ] = useState(protocolID)
  const [iconURLState,
    // setIconURL
  ] = useState(
    iconURL || DEFAULT_APP_ICON
  )
  const [descriptionState,
    // setDescription
  ] = useState(
    description || 'Protocol description not found.'
  )
  const [documentationURL,
    // setDocumentationURL
  ] = useState('https://projectbabbage.com')

  // useEffect(() => {
  //   const cacheKey = `protocolInfo_${protocolID}_${securityLevel}`

  //   const fetchAndCacheData = async () => {
  //     // Try to load data from cache
  //     const cachedData = window.localStorage.getItem(cacheKey)
  //     if (cachedData) {
  //       const { name, iconURL, description, documentationURL } = JSON.parse(cachedData)
  //       setProtocolName(name)
  //       setIconURL(iconURL)
  //       setDescription(description)
  //       setDocumentationURL(documentationURL)
  //     }
  //     try {
  //       // Resolve a Protocol info from id and security level
  //       const certifiers = settings.trustedEntities.map(x => x.publicKey)
  //       const results = await protomap.resolveProtocol(certifiers, securityLevel, protocolID)

  //       // Compute the most trusted of the results
  //       let mostTrustedIndex = 0
  //       let maxTrustPoints = 0
  //       for (let i = 0; i < results.length; i++) {
  //         const resultTrustLevel = settings.trustedEntities.find(x => x.publicKey === results[i].registryOperator)?.trust || 0
  //         if (resultTrustLevel > maxTrustPoints) {
  //           mostTrustedIndex = i
  //           maxTrustPoints = resultTrustLevel
  //         }
  //       }
  //       const trusted = results[mostTrustedIndex]

  //       // Update state and cache the results
  //       setProtocolName(trusted.name)
  //       setIconURL(trusted.iconURL)
  //       setDescription(trusted.description)
  //       setDocumentationURL(trusted.documentationURL)

  //       // Store data in local storage
  //       window.localStorage.setItem(cacheKey, JSON.stringify({
  //         name: trusted.name,
  //         iconURL: trusted.iconURL,
  //         description: trusted.description,
  //         documentationURL: trusted.documentationURL
  //       }))
  //     } catch (error) {
  //       console.error(error)
  //     }
  //   }

  //   fetchAndCacheData()
  // }, [protocolID, securityLevel, settings])

  const chipStyle = theme.templates.chip({ size, backgroundColor })

  return (
    <div className={classes.chipContainer}>
      <Chip
        style={chipStyle}
        avatar={
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Avatar
                sx={{
                  width: 22,
                  height: 22,
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText
                }}
              >
                <DataObject fontSize="small" />
              </Avatar>
            }
          >
            <Avatar
              src={iconURLState}
              alt={protocolName}
              sx={{ width: size * 32, height: size * 32 }}
            />
          </Badge>
        }
        label={
          <Grid container spacing={1} alignItems="center">
            <Grid item xs>
              <div className={classes.chipLabel}>
                {protocolName}
                {counterparty && (
                  <CounterpartyChip
                    size={size * 0.8}
                    counterparty={counterparty}
                  />
                )}
              </div>
            </Grid>
          </Grid>
        }
        onClick={clickable ? onClick : undefined}
        onDelete={canRevoke ? onCloseClick : undefined}
        deleteIcon={canRevoke ? <CloseIcon /> : undefined}
      />
      {expires && (
        <div className={classes.expires}>
          Expires {expires}
        </div>
      )}
    </div>
  )
}

export default withRouter(ProtoChip)
