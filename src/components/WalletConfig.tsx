import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider
} from '@mui/material'

interface WalletConfigProps {
  noManagerYet: boolean
  wabUrl: string
  setWabUrl: (url: string) => void
  fetchWabInfo: () => void
  wabInfo?: {
    supportedAuthMethods: string[]
    faucetEnabled: boolean
    faucetAmount: number
  }
  selectedAuthMethod: string
  onSelectAuthMethod: (method: string) => void
  selectedNetwork: string
  setSelectedNetwork: (network: string) => void
  selectedStorageUrl: string
  setSelectedStorageUrl: (url: string) => void
  finalizeConfig: () => void
}

const WalletConfig: React.FC<WalletConfigProps> = ({
  noManagerYet,
  wabUrl,
  setWabUrl,
  fetchWabInfo,
  wabInfo,
  selectedAuthMethod,
  onSelectAuthMethod,
  selectedNetwork,
  setSelectedNetwork,
  selectedStorageUrl,
  setSelectedStorageUrl,
  finalizeConfig
}) => {
  if (!noManagerYet) return null

  // Conditions to enable the finalize button
  const canFinalize = !!wabInfo && !!selectedAuthMethod

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Card sx={{ width: { xs: '90%', md: 600 } }}>
        <CardContent>
          <Typography variant='h5' gutterBottom>
            Configure Your Wallet
          </Typography>
          <Typography variant='body2' color='textSecondary' pb={2}>
            Configure your wallet with a Wallet Authentication Backend
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='WAB Server URL'
                variant='outlined'
                value={wabUrl}
                onChange={e => setWabUrl(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant='contained' color='primary' onClick={fetchWabInfo}>
                Fetch Info
              </Button>
            </Grid>

            {wabInfo && (
              <>
                <Grid item xs={12}>
                  <Typography variant='subtitle1'>
                    Supported Methods: {wabInfo.supportedAuthMethods.join(', ')}
                  </Typography>
                  <Typography variant='subtitle1'>
                    Faucet: {wabInfo.faucetEnabled ? 'Enabled' : 'Disabled'} (Amount: {wabInfo.faucetAmount})
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth variant='outlined'>
                    <InputLabel id='auth-method-label'>Choose Auth Method</InputLabel>
                    <Select
                      labelId='auth-method-label'
                      value={selectedAuthMethod}
                      onChange={e => onSelectAuthMethod(e.target.value)}
                      label='Choose Auth Method'
                    >
                      <MenuItem value=''>
                        <em>(Select method)</em>
                      </MenuItem>
                      {wabInfo.supportedAuthMethods.map(method => (
                        <MenuItem key={method} value={method}>
                          {method}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <FormControl fullWidth variant='outlined'>
                <InputLabel id='network-label'>Chain/Network</InputLabel>
                <Select
                  labelId='network-label'
                  value={selectedNetwork}
                  onChange={e => setSelectedNetwork(e.target.value)}
                  label='Chain/Network'
                >
                  <MenuItem value='test'>Testnet</MenuItem>
                  <MenuItem value='main'>Mainnet</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Storage URL'
                variant='outlined'
                value={selectedStorageUrl}
                onChange={e => setSelectedStorageUrl(e.target.value)}
              />
            </Grid>

            {/* Render button always, but disable it until conditions are met */}
            <Grid item xs={12}>
              <Button
                variant='contained'
                color='secondary'
                onClick={finalizeConfig}
                fullWidth
                disabled={!canFinalize}
              >
                Finalize Config & Create Manager
              </Button>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
        </CardContent>
      </Card>
    </Box>
  )
}

export default WalletConfig
