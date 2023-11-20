import { createEmptyTokenWithAmount, hooks, TokenTransfer } from '@reef-chain/react-lib';
import Uik from '@reef-chain/ui-kit';
import React, { useContext, useState } from 'react';
import './activity.css';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import ActivityItem, { Skeleton } from './ActivityItem';
import { localizedStrings as strings } from '../../../l10n/l10n';
import ActivityDetails from './ActivityDetails';
import ReefSigners from '../../../context/ReefSigners';

const noActivityTokenDisplay = createEmptyTokenWithAmount();
noActivityTokenDisplay.address = '0x';
noActivityTokenDisplay.iconUrl = '';
noActivityTokenDisplay.name = 'No account history yet.';

export const Activity = (): JSX.Element => {
  const [transfers, loading] :[TokenTransfer[], boolean] = hooks.useTxHistory();
  const {
    selectedSigner, network,
  } = useContext(ReefSigners);

  const [isActivityModalOpen, setActivityModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TokenTransfer|null>(null);

  // set current transaction as parameter and call setSelectedTransaction state function.
  const setCurrentTransaction = (transaction : TokenTransfer): void => {
    setSelectedTransaction(transaction);
  };

  // @ts-ignore
  return (
    <div className="token-activity activity">
      <div className="activity__head">
        <Uik.Text type="title" text={strings.activity} className="activity__title" />
        {
          !!selectedSigner?.address && !!network?.reefscanUrl
          && (
          <Uik.Button
            size="small"
            icon={faArrowUpRightFromSquare}
            text={strings.open_explorer}
            onClick={() => window.open(`${network?.reefscanUrl}/account/${selectedSigner.address}`)}
          />
          )
        }
      </div>

      <div className={`col-12 card  ${transfers?.length ? 'card-bg-light' : ''}`}>
        {!!transfers && !transfers.length && !loading && <div className="no-token-activity">{strings.no_recent_transfer}</div>}
        {!!transfers && !transfers.length && loading && (
        <div className="no-token-activity">
          <Uik.Container vertical>
            <Uik.Loading size="small" />
          </Uik.Container>
        </div>
        )}
        {!!transfers && !!transfers.length && (
          <div>

            {transfers.map((item, index) => (
              // eslint-disable-next-line jsx-a11y/no-static-element-interactions
              <div
                key={`item-wrapper-${item.timestamp + index.toString()}`}
                onClick={() => {
                  setCurrentTransaction(item);
                  setActivityModalOpen(!isActivityModalOpen);
                }}
              >
                <ActivityItem
                  key={item.timestamp + index.toString()}
                  timestamp={item.timestamp}
                  token={item.token}
                  inbound={item.inbound}
                />
              </div>
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

      {!!transfers && !!transfers.length && selectedTransaction && (
        <ActivityDetails
          isOpen={isActivityModalOpen}
          onClose={() => setActivityModalOpen(false)}
          timestamp={selectedTransaction.timestamp}
          from={selectedTransaction.from}
          to={selectedTransaction.to}
          url={selectedTransaction.url}
          inbound={selectedTransaction.inbound}
          token={selectedTransaction.token}
        />

      )}
    </div>
  );
};
