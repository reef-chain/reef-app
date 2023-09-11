import {
  appState, createEmptyTokenWithAmount, hooks, ReefSigner, Network, TokenTransfer,
} from '@reef-defi/react-lib';
import Uik from '@reef-chain/ui-kit';
import React, { useContext } from 'react';
import './activity.css';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import ActivityItem, { Skeleton } from './ActivityItem';
import { localizedStrings as strings } from '../../../l10n/l10n';
import {reefState} from "@reef-chain/util-lib";
import ReefSigners from '../../../context/ReefSigners';
import {UseTxHistory} from '../../../hooks/useTransactionHistory';

const noActivityTokenDisplay = createEmptyTokenWithAmount();
noActivityTokenDisplay.address = '0x';
noActivityTokenDisplay.iconUrl = '';
noActivityTokenDisplay.name = 'No account history yet.';

export const Activity = (): JSX.Element => {
  const transfers :TokenTransfer[]|null= UseTxHistory();

  const signer: ReefSigner|undefined|null =  useContext(ReefSigners).selectedSigner;

  const network: Network|undefined = hooks.useObservableState(reefState.selectedNetwork$);

  return (
    <div className="token-activity activity">
      <div className="activity__head">
        <Uik.Text type="title" text={strings.activity} className="activity__title" />
        {
          !!signer?.address && !!network?.reefscanUrl
          && (
          <Uik.Button
            size="small"
            icon={faArrowUpRightFromSquare}
            text={strings.open_explorer}
            onClick={() => window.open(`${network?.reefscanUrl}/account/${signer.address}`)}
          />
          )
        }
      </div>

      <div className={`col-12 card  ${transfers?.length ? 'card-bg-light' : ''}`}>
        {!!transfers && !transfers.length && <div className="no-token-activity">{strings.no_recent_transfer}</div>}
        {!!transfers && !!transfers.length && (
        <div>
            {transfers.map((item, index) => (
              <ActivityItem
                // eslint-disable-next-line
                key={index}
                timestamp={item.timestamp}
                token={item.token}
                url={item.url}
                inbound={item.inbound}
              />
            ))}
        </div>
        )}
        {!transfers && (
        <>
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </>
        ) }
      </div>
    </div>
  );
};
