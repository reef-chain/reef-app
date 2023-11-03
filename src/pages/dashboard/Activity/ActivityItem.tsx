import { NFT, Token, utils } from '@reef-defi/react-lib';
import Uik from '@reef-chain/ui-kit';
import React, {
  SyntheticEvent,
  useContext,
  useMemo,
  useState,
} from 'react';
import './activity-item.css';
import { faArrowDown, faPlay } from '@fortawesome/free-solid-svg-icons';
import HideBalance from '../../../context/HideBalance';
import { displayBalanceFromToken } from '../../../utils/displayBalance';
import { localizedStrings as strings } from '../../../l10n/l10n';
import { getIpfsGatewayUrl } from '../../../environment';
import '../loading-animation.css';
import OverlayNFT from '../../../common/OverlayNFT';

const { showBalance } = utils;

interface Props {
  timestamp: number;
  inbound: boolean;
  token: Token | NFT;
}

const formatDate = (timestamp: number): string => {
  let date = new Date(timestamp);
  const offset = date.getTimezoneOffset();
  date = new Date(date.getTime() - (offset * 60 * 1000));
  const formattedDate = date.toISOString().split('T')[0].split('-').reverse().join('-');
  const formattedTime = date.toISOString().split('T')[1].split(':').slice(0, 2).join(':');

  return `${formattedDate}, ${formattedTime}`;
};

const TokenActivityItem = ({
  token,
  timestamp,
  inbound,
}: Props): JSX.Element => {
  const [isOverlayNFTOpen, setIsOverlayNFTOpen] = useState(false);
  const {
    symbol,
    name,
    iconUrl,
  } = token as NFT;
  const {
    nftId,
    mimetype,
    contractType,
  } = token as NFT;
  const isNFT = nftId != null;
  const isVideoNFT = !!mimetype?.includes('mp4');
  const type: 'receive' | 'send' = inbound ? 'receive' : 'send';

  const title = useMemo(() => {
    const actionMap = {
      receive: strings.received,
      send: strings.sent,
    };

    const action = actionMap[type];
    return `${action} ${symbol || name}`;
  }, [type, symbol, name]);

  const amount = useMemo(() => {
    const amt = displayBalanceFromToken(token as Token);
    const prefixMap = {
      receive: '+',
      send: '-',
    };
    const prefix = prefixMap[type];

    return `${prefix} ${amt}`;
  }, [token, type]);

  const hideBalance = useContext(HideBalance);

  const activityPreviewIcon = useMemo(() => {
    const iconUrlIpfsResolved = iconUrl.startsWith('ipfs') ? getIpfsGatewayUrl(iconUrl.substring(7)) : iconUrl;
    const openVideoPreview = (event: SyntheticEvent): void => {
      event.preventDefault();
      setIsOverlayNFTOpen(true);
    };

    if (!isNFT) {
      return (
        <div
          className="activity-item__amount-token-icon"
          style={{ backgroundImage: `url(${iconUrlIpfsResolved})` }}
        />
      );
    }

    return (
      <Uik.Button
        className="activity-item__nft-video-icon activity-item__nft-preview"
        onClick={openVideoPreview}
      >
        { isVideoNFT
          ? <Uik.Icon className="activity-item__nft-preview-icon" icon={faPlay} />
          : <div className="activity-item__nft-preview" style={{ backgroundImage: `url(${iconUrlIpfsResolved})` }} /> }
      </Uik.Button>
    );
  }, [isVideoNFT, isNFT, iconUrl]);

  return (
    <>
      <div
        key={timestamp}
        className={`
          activity-item
          activity-item--${type}
          ${isNFT ? 'activity-item--nft' : ''}
        `}
      >
        <div className="activity-item__indicator">
          <Uik.Icon className="activity-item__indicator-icon" icon={faArrowDown} />
        </div>

        <div className="activity-item__content">
          <div className="activity-item__info">
            <div className="activity-item__title" title={title}>{ title }</div>
            <div className="activity-item__date">{ formatDate(timestamp) }</div>
          </div>

          {
            isNFT ? (
              activityPreviewIcon
            ) : (
              <div
                className="activity-item__amount-wrapper"
                title={`${type === 'receive' ? '+' : '-'} ${showBalance(token as Token)}`}
              >
                <div
                  className={`
                    activity-item__amount
                    ${hideBalance.isHidden ? 'activity-item__amount--hidden' : ''}
                  `}
                >
                  {
                  !hideBalance.isHidden ? amount : (
                    <div>
                      <div />
                      <div />
                      <div />
                      <div />
                      <div />
                    </div>
                  )
                }
                </div>
                { activityPreviewIcon }
              </div>
            )
          }
        </div>
      </div>

      { isOverlayNFTOpen && (
        <OverlayNFT
          isOpen={isOverlayNFTOpen}
          onClose={() => setIsOverlayNFTOpen(false)}
          nftName={token.name}
          isVideoNFT={isVideoNFT}
          iconUrl={token.iconUrl}
          balance={token.balance.toString()}
          address={token.address}
          contractType={contractType}
          nftId={nftId}
        />
      )}
    </>
  );
};

export default TokenActivityItem;

export const Skeleton = (): JSX.Element => (
  <div className="activity-item activity-item--skeleton">
    <div className="activity-item__indicator loading-animation" />

    <div className="activity-item__content">
      <div className="activity-item__info">
        <div className="activity-item__title loading-animation" />
        <div className="activity-item__date loading-animation" />
      </div>

      <div className="activity-item__amount-wrapper">
        <div className="activity-item__amount loading-animation" />
      </div>
    </div>
  </div>
);
