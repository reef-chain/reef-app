import { Token, utils } from '@reef-chain/react-lib';
import Uik from '@reef-chain/ui-kit';
import React, { useContext, useMemo } from 'react';
import { tokenUtil } from '@reef-chain/util-lib';
import HideBalance from '../../../context/HideBalance';
import { displayBalanceFromToken } from '../../../utils/displayBalance';
import { getIpfsGatewayUrl } from '../../../environment';
import './activity-item.css';
import './activity-details.css';

interface Props{
    token1:tokenUtil.TokenTransfer;
    token2:tokenUtil.TokenTransfer;
    fees:tokenUtil.TokenTransfer;
}

const { showBalance } = utils;

function SwapDetails({ token1, token2, fees }:Props):JSX.Element {
  const hideBalance = useContext(HideBalance);

  const type1: 'receive' | 'send' = token1.inbound ? 'receive' : 'send';
  const type2: 'receive' | 'send' = token2.inbound ? 'receive' : 'send';

  const amount1 = useMemo(() => {
    const amt = displayBalanceFromToken(token1.token as Token);
    const prefixMap = {
      receive: '+',
      send: '-',
    };
    const prefix = prefixMap[type1];

    return `${prefix} ${amt}`;
  }, [token1.token, type1]);

  const amount2 = useMemo(() => {
    const amt = displayBalanceFromToken(token2.token as Token);
    const prefixMap = {
      receive: '+',
      send: '-',
    };
    const prefix = prefixMap[type2];

    return `${prefix} ${amt}`;
  }, [token2.token, type2]);

  const activityPreviewIcon1 = useMemo(() => {
    const iconUrlIpfsResolved = token1.token.iconUrl.startsWith('ipfs')
      ? getIpfsGatewayUrl(token1.token.iconUrl.substring(7))
      : token1.token.iconUrl;

    return (
      <div
        className="activity-item__amount-token-icon"
        style={{ backgroundImage: `url(${iconUrlIpfsResolved})` }}
      />
    );
  }, [token1.token.iconUrl]);

  const activityPreviewIcon2 = useMemo(() => {
    const iconUrlIpfsResolved = token2.token.iconUrl.startsWith('ipfs')
      ? getIpfsGatewayUrl(token2.token.iconUrl.substring(7))
      : token2.token.iconUrl;

    return (
      <div
        className="activity-item__amount-token-icon"
        style={{ backgroundImage: `url(${iconUrlIpfsResolved})` }}
      />
    );
  }, [token2.token.iconUrl]);
  return (

    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
        <Uik.Text type="mini" text={`${type1 === 'receive' ? 'Received' : 'Sent'} ${token1.token.name}`} />
        <div className="mb-3">
          <Uik.Text type="mini" text={`${type2 === 'receive' ? 'Received' : 'Sent'} ${token2.token.name}`} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div>
          <div
            className="activity-item__amount-wrapper"
            title={`${type1 === 'receive' ? '+' : '-'} ${showBalance(token1.token as Token)}`}
          >
            <div
              className={`
            activity-item__amount-swap activity-item__amount
            ${type1 === 'receive' ? 'activity-item__amount-swap-receive' : ''}
            ${hideBalance.isHidden ? 'activity-item__amount--hidden' : ''}
          `}
            >
              {!hideBalance.isHidden ? (
                amount1
              ) : (
                <div>
                  <div />
                  <div />
                  <div />
                  <div />
                  <div />
                </div>
              )}
            </div>
            {activityPreviewIcon1}
          </div>
          <div
            className="activity-item__amount-wrapper"
            title={`${type2 === 'receive' ? '+' : '-'} ${showBalance(token2.token as Token)}`}
          >
            <div
              className={`
            activity-item__amount-swap
            activity-item__amount
            ${type2 === 'receive' ? 'activity-item__amount-swap-receive' : ''}
            ${hideBalance.isHidden ? 'activity-item__amount--hidden' : ''}
          `}
            >
              {!hideBalance.isHidden ? (
                amount2
              ) : (
                <div>
                  <div />
                  <div />
                  <div />
                  <div />
                  <div />
                </div>
              )}
            </div>
            {activityPreviewIcon2}
          </div>
          <div className="activity-item__amount---swap-fees">
            {`fee - ${displayBalanceFromToken(fees.token as Token)} REEF`}
          </div>
        </div>
      </div>
    </div>

  );
}

export default SwapDetails;
