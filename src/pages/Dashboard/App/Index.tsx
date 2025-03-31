/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useContext } from 'react';
import { Grid, IconButton, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import { useLocation } from 'react-router-dom';
import { WalletContext } from '../../../UserInterface';
import { WalletAction } from '@bsv/sdk';

import { DEFAULT_APP_ICON } from '../../../constants/popularApps';
import PageHeader from '../../../components/PageHeader';
import RecentActions from '../../../components/RecentActions';
import fetchAndCacheAppData from '../../../utils/fetchAndCacheAppData';
// import AccessAtAGlance from '../../../components/AccessAtAGlance';

// Example transform function that merges "default" inputs & outputs with custom baskets
// Modify or remove this if you don't need to transform data from listActions:
function transformActions(actions: WalletAction[]): WalletAction[] {
  return actions.map((action) => {
    // const inputs = action.inputs ?? [];
    // const outputs = action.outputs ?? [];

    // // Filter out "default" vs. custom
    // const mergedInputs = inputs.filter((i) => i.basket !== 'default');
    // const mergedOutputs = outputs.filter((o) => o.basket !== 'default');
    // const defaultInputs = inputs.filter((i) => i.basket === 'default');
    // const defaultOutputs = outputs.filter((o) => o.basket === 'default');

    // // We also need to handle net amounts, if relevant
    // let defaultNetAmount = 0;
    // for (const input of defaultInputs) defaultNetAmount -= input.amount;
    // for (const output of defaultOutputs) defaultNetAmount += output.amount;

    // // For example, push a single net "default" input or output:
    // if (defaultNetAmount < 0) {
    //   mergedInputs.push({ ...defaultInputs[0], amount: Math.abs(defaultNetAmount) });
    // } else if (defaultNetAmount > 0) {
    //   mergedOutputs.push({ ...defaultOutputs[0], amount: defaultNetAmount });
    // }

    // We could store a "fees" property in the action if you'd like to track them:
    // action.fees = defaultNetAmount - action.satoshis; // Example logic if satoshis is total
    // But you'd need to define that property, or track it in your UI somewhere.

    return {
      ...action,
      // inputs: mergedInputs,
      // outputs: mergedOutputs,
    };
  });
}

interface LocationState {
  domain?: string;
}

interface AppsProps {
  history?: any; // or ReactRouter history type
}

const Apps: React.FC<AppsProps> = ({ history }) => {
  const location = useLocation<LocationState>();
  const appDomain = location.state?.domain ?? 'unknown-domain.com';

  const [appName, setAppName] = useState<string>(appDomain);
  const [appIcon, setAppIcon] = useState<string>(DEFAULT_APP_ICON);
  const [displayLimit, setDisplayLimit] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [allActionsShown, setAllActionsShown] = useState<boolean>(true);

  const [copied, setCopied] = useState<{ id: boolean; registryOperator?: boolean }>({
    id: false,
  });

  // We'll store an object that looks like { totalTransactions, transactions }
  // to align with the shape expected by RecentActions
  const [appActions, setAppActions] = useState<WalletAction[]>([])

  // Grab managers and admin originator from the Wallet Context
  const { managers, adminOriginator } = useContext(WalletContext);

  // Copies the domain (or any data) to the clipboard and shows a temporary check icon
  const handleCopy = (data: string, type: 'id' | 'registryOperator') => {
    navigator.clipboard.writeText(data);
    setCopied((prev) => ({ ...prev, [type]: true }));
    setTimeout(() => setCopied((prev) => ({ ...prev, [type]: false })), 2000);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // Optionally fetch app icon & name from your helper
        fetchAndCacheAppData(appDomain, setAppIcon, setAppName, DEFAULT_APP_ICON);

        // If you still want local caching, you can do it here:
        // const cacheKey = `transactions_${appDomain}`;
        // const cachedData = window.localStorage.getItem(cacheKey);
        // if (cachedData) {
        //   const cachedParsed = JSON.parse(cachedData) as {
        //     totalTransactions: number;
        //     transactions: WalletAction[];
        //   };
        //   // Transform if needed
        //   const transformed = transformActions(cachedParsed.transactions);
        //   setAppActions(transformed);
        //   setLoading(false);
        // }

        // Now fetch the real data from managers.permissionsManager:
        const { actions } = await managers.permissionsManager.listActions(
          {
            labels: [],
            labelQueryMode: 'any',
            includeLabels: true,
          },
          adminOriginator
        );

        // For demonstration, let's assume actions can be displayed as is,
        // or use transformActions if you need to manipulate them:
        const transformedActions = transformActions(actions);
        const totalActions = transformedActions.length;

        // If the total is bigger than displayLimit, user can load more
        // But for the example, we set all displayed actions for now
        const displayedSlice = transformedActions.slice(0, displayLimit);

        if (totalActions > displayedSlice.length) {
          setAllActionsShown(false);
        } else {
          setAllActionsShown(true);
        }

        setAppActions(displayedSlice);

        // Store in local cache if desired
        // window.localStorage.setItem(
        //   cacheKey,
        //   JSON.stringify({
        //     totalTransactions: totalActions,
        //     transactions: transformedActions,
        //   })
        // );
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        setRefresh(false);
      }
    })();
  }, [refresh, appDomain, displayLimit, managers.permissionsManager, adminOriginator]);

  const recentActionParams = {
    loading,
    appActions,
    displayLimit,
    setDisplayLimit,
    setRefresh,
    allActionsShown,
  };

  return (
    <Grid container spacing={3} direction="column">
      {/* Page Header */}
      <Grid item xs={12}>
        <PageHeader
          history={history}
          title={appName}
          subheading={
            <div>
              <Typography variant="caption" color="textSecondary">
                {`https://${appDomain}`}
                <IconButton
                  size="small"
                  onClick={() => handleCopy(appDomain, 'id')}
                  disabled={copied.id}
                >
                  {copied.id ? <CheckIcon /> : <ContentCopyIcon fontSize="small" />}
                </IconButton>
              </Typography>
            </div>
          }
          icon={appIcon}
          buttonTitle="Launch"
          onClick={() => {
            window.open(`https://${appDomain}`, '_blank');
          }}
        />
      </Grid>

      {/* 
        If you want a placeholder area for any custom chart or summary:
        <Grid item xs={12} style={{ width: '100%', height: '10em', background: 'gray' }}>
          <Typography paddingBottom='2em' align='center'>Total App Cashflow</Typography>
        </Grid> 
      */}

      {/* Main Content: RecentActions + AccessAtAGlance */}
      <Grid container item spacing={3} direction="row">
        {/* RecentActions Section */}
        <Grid item lg={6} md={6} xs={12}>
          <RecentActions
            appActions={appActions}
            displayLimit={displayLimit}
            setDisplayLimit={setDisplayLimit}
            loading={loading}
            setRefresh={setRefresh}
          />
        </Grid>

        {/* Another component for app details or usage stats */}
        <Grid item lg={6} md={6} xs={12}>
          <h1>Access at a Glance coming soon</h1>
          {/* <AccessAtAGlance
            originator={appDomain}
            loading={loading}
            setRefresh={setRefresh}
            history={history}
          /> */}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Apps;
