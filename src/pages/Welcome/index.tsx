import { useState, useContext } from 'react';
import {
  Typography,
  Button,
  Grid,
  LinearProgress,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { toast } from 'react-toastify';
import style from './style.js';
import { WalletContext } from "../../UserInterface.js";
import DarkModeImage from "../../images/darkMode.jsx";
import LightModeImage from "../../images/lightMode.jsx";

const useStyles = makeStyles(style, {
  name: 'Welcome'
});

const Welcome = ({ history }) => {
  const { settings, updateSettings } = useContext(WalletContext);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const theme = useTheme();
  const classes = useStyles();

  // Supported Defaults
  const currencies = {
    USD: '$10',
    BSV: '0.033',
    SATS: '3,333,333',
    EUR: '€9.15',
    GDP: '£7.86'
  };

  const themes = ['light', 'dark'];
  const [selectedTheme, setSelectedTheme] = useState(settings?.theme?.mode || theme.palette.mode);
  const [selectedCurrency, setSelectedCurrency] = useState(settings?.currency || 'USD');

  // Handle updating defaults
  const handleThemeChange = (theme) => {
    setSelectedTheme(theme.toLowerCase());
  };

  const handleCurrencyChange = (currency) => {
    setSelectedCurrency(currency);
  };

  // Save user preferences
  const showDashboard = async () => {
    try {
      setSettingsLoading(true);
      await updateSettings({
        ...settings,
        theme: { mode: selectedTheme },
        currency: selectedCurrency
      });
      history.push('/dashboard/apps');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSettingsLoading(false);
    }
  };

  return (
    <div
      className={classes.content_wrap}
      style={{
        backgroundColor: selectedTheme === 'light' ? theme.palette.background.default : 'rgba(0,0,0,0)',
        backgroundImage: selectedTheme === 'light'
          ? `linear-gradient(to bottom, ${theme.palette.background.default}, ${theme.palette.background.paper}), url(https://cdn.projectbabbage.com/media/pictures/mainBackground.jpg)`
          : `linear-gradient(to bottom, ${theme.palette.background.default}, ${theme.palette.background.paper}), url(https://cdn.projectbabbage.com/media/pictures/mainBackground.jpg)`
      }}
    >
      <div className={classes.content}>
        <Grid container direction='column' alignItems='center' spacing={2} padding='0.5em'>
          <Grid item xs={12}>
            <Typography variant='h1' paragraph>
              Your portal to the Metanet — And beyond!
            </Typography>
            <Typography variant='h4'>
              Let's start by setting your preferences.
            </Typography>
            <Typography paragraph paddingTop='2em'>
              Default Theme
            </Typography>
          </Grid>

          <Grid item container spacing={1} justifyContent='center'>
            {themes.map(themeOption => (
              <Grid item key={themeOption}>
                <Button
                  onClick={() => handleThemeChange(themeOption)}
                  className={`${classes.themeButton} ${selectedTheme === themeOption ? 'selected' : ''}`}
                  style={{
                    color: themeOption === 'light' ? theme.palette.text.primary : theme.palette.common.white,
                    backgroundColor: themeOption === 'light' ? theme.palette.background.paper : theme.palette.grey[800],
                  }}
                >
                  {themeOption === 'light' ? <LightModeImage /> : <DarkModeImage />}
                </Button>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={1} justifyContent='center' padding='1em'>
            <Grid item paddingBottom='1em'>
              <Typography variant='h5' paddingTop='1em' paddingBottom='0.5em'>
                Default Currency
              </Typography>
              <Typography variant='body1'>
                How would you like to see your account balance?
              </Typography>
            </Grid>

            <Grid item xs={12} container direction='row' justifyContent='center' alignItems='center' spacing={1}>
              {Object.keys(currencies).map(currency => (
                <Grid item key={currency}>
                  <Button
                    variant='outlined'
                    className={`${classes.currencyButton} ${selectedCurrency === currency ? 'selected' : ''}`}
                    onClick={() => handleCurrencyChange(currency)}
                  >
                    <div>
                      <div>{currency}</div>
                      <div>{currencies[currency]}</div>
                    </div>
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid container paddingTop='2em'>
            <Grid item xs={12}>
              {settingsLoading ? (
                <LinearProgress />
              ) : (
                <Button
                  color='primary'
                  variant='contained'
                  size='large'
                  onClick={showDashboard}
                >
                  View Dashboard
                </Button>
              )}
            </Grid>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default Welcome;
