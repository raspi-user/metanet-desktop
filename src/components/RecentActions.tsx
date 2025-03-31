import { FC } from 'react';
import { Typography, Button, LinearProgress } from '@mui/material';
import Action from './Action';
import { WalletAction } from '@bsv/sdk';

interface RecentActionsProps {
  loading: boolean;
  appActions: WalletAction[];
  displayLimit: number;
  setDisplayLimit: (limit: number) => void;
  setRefresh: (refresh: boolean) => void;
  allActionsShown?: boolean;
}

const RecentActions: FC<RecentActionsProps> = ({
  loading,
  appActions,
  displayLimit,
  setDisplayLimit,
  setRefresh,
  allActionsShown = false,
}) => {
  return (
    <div style={{ paddingTop: '1em' }}>
      <Typography
        variant="h3"
        color="textPrimary"
        gutterBottom
        style={{ paddingBottom: '0.2em' }}
      >
        Recent Actions
      </Typography>
      {appActions &&
        appActions.map((action, index) => {
          const actionToDisplay = {
            txid: action.txid,
            description: action.description,
            amount: `${action.satoshis}`,
            inputs: action.inputs,
            outputs: action.outputs,
            timestamp: 'unknown'
          };
          return <Action key={index} {...actionToDisplay} />
        })}
      {appActions && appActions.length === 0 && (
        <Typography
          color="textSecondary"
          align="center"
          style={{ paddingTop: '6em' }}
        >
          You haven't made any actions yet.
        </Typography>
      )}
      {loading && <LinearProgress style={{ paddingTop: '1em' }} />}
      {appActions && appActions.length !== 0 && (
        <center style={{ paddingTop: '1em' }}>
          {allActionsShown ? (
            <></>
          ) : (
            <Button
              onClick={() => {
                // Note: Consider taking into account max number of transactions available
                setDisplayLimit(displayLimit + 10);
                setRefresh(true);
              }}
            >
              View More Actions
            </Button>
          )}
        </center>
      )}
    </div>
  );
};

export default RecentActions;
