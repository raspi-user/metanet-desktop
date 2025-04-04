import { useContext, useState, useEffect } from 'react'
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
  Paper,
  Box,
  Stack
} from '@mui/material'
import { Send, Cancel } from '@mui/icons-material'
import AmountDisplay from '../AmountDisplay/index.js'
import CustomDialog from '../CustomDialog/index.js'
import { WalletContext } from '../../WalletContext'
import AppChip from '../AppChip/index.js'
import { Services } from '@bsv/wallet-toolbox-client'
import { UserContext } from '../../UserContext.js'

const services = new Services('main')

const SpendingAuthorizationHandler: React.FC = () => {
  const {
    managers, spendingRequests, advanceSpendingQueue
  } = useContext(WalletContext)
  
  const { spendingAuthorizationModalOpen } = useContext(UserContext)
  
  const [usdPerBsv, setUsdPerBSV] = useState(35)

  const handleCancel = () => {
    if (spendingRequests.length > 0) {
      managers.permissionsManager!.denyPermission(spendingRequests[0].requestID)
    }
    advanceSpendingQueue()
  }

  const handleGrant = async ({ singular = true, amount }: { singular?: boolean, amount?: number }) => {
    if (spendingRequests.length > 0) {
      managers.permissionsManager!.grantPermission({
        requestID: spendingRequests[0].requestID,
        ephemeral: singular,
        amount
      })
    }
    advanceSpendingQueue()
  }

  useEffect(() => {
    // Fetch exchange rate when we have spending requests
    if (spendingRequests.length > 0) {
      services.getBsvExchangeRate().then(rate => {
        setUsdPerBSV(rate)
      })
    }
  }, [spendingRequests])

  if (spendingRequests.length === 0) {
    return null
  }

  // Get the current permission request
  const currentPerm = spendingRequests[0]

  console.log({ spendingRequests })

  return (
    <CustomDialog
      open={spendingAuthorizationModalOpen}
      title={!currentPerm.renewal ? 'Spending Request' : 'Spending Check-in'}
    >
      <DialogContent>
        <br />
        <Stack alignItems="center">
          <AppChip
            size={2.5}
            label={currentPerm.originator}
            clickable={false}
            showDomain
          />
          <Box mt={2} />
        </Stack>
        
        <Typography align='center'>
          would like to spend
        </Typography>
        
        <Typography variant='h3' align='center' sx={{ mb: 2 }} color='textPrimary'>
          <AmountDisplay>{currentPerm.authorizationAmount}</AmountDisplay>
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
                {currentPerm.lineItems.map((item, idx) => (
                  <TableRow
                    key={`item-${idx}-${item.description || 'unnamed'}`}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component='th' scope='row'>
                      {item.description || '—'}
                    </TableCell>
                    <TableCell align='right'>
                      <AmountDisplay>
                        {item.satoshis}
                      </AmountDisplay>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-around', 
          mt: 3 
        }}>
          <Tooltip title='Deny'>
            <Fab
              size='small'
              onClick={handleCancel}
              color='default'
            >
              <Cancel />
            </Fab>
          </Tooltip>
          
          <Tooltip title='Grant'>
            <Fab
              size='small'
              onClick={() => handleGrant({ singular: true })}
              color='primary'
            >
              <Send />
            </Fab>
          </Tooltip>
        </Box>
      </DialogContent>
    </CustomDialog>
  )
}

export default SpendingAuthorizationHandler
