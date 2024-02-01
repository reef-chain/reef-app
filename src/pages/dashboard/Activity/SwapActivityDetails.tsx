import { Components, Token,utils} from '@reef-chain/react-lib';
import React, { useContext, useMemo } from 'react'
import { SwapPair } from './Activity';
const { OverlayAction } = Components;
import './activity-details.css';
import Uik from '@reef-chain/ui-kit';
import { faRepeat } from '@fortawesome/free-solid-svg-icons';
import HideBalance from '../../../context/HideBalance';
import { displayBalanceFromToken } from '../../../utils/displayBalance';
import { formatDate } from '../../../utils/utils';
const { showBalance } = utils;

interface Props{
    isOpen:boolean;
    onClose:()=>void;
    swapPair:SwapPair;
}

function SwapActivityDetails({isOpen,onClose,swapPair}:Props) {
  const hideBalance = useContext(HideBalance);
  const type1: "receive" | "send" = swapPair.token1.inbound ? "receive" : "send";
  const type2: "receive" | "send" = swapPair.token2.inbound ? "receive" : "send";
  const amount1 = useMemo(() => {
    const amt = displayBalanceFromToken(swapPair.token1.token as Token);

    const prefixMap = {
      receive: '+',
      send: '-',
    };
    const prefix = prefixMap[type1];
    return `${prefix} ${amt} ${swapPair.token1.token.name}`;
  }, [type1,swapPair.token1.token]);

  const amount2 = useMemo(() => {
    const amt = displayBalanceFromToken(swapPair.token2.token as Token);

    const prefixMap = {
      receive: '+',
      send: '-',
    };
    const prefix = prefixMap[type2];
    return `${prefix} ${amt} ${swapPair.token2.token.name}`;
  }, [type1,swapPair.token2.token]);
  return (
    <OverlayAction isOpen={isOpen} onClose={onClose} className="overlay-swap" title={`Swap ${swapPair.pair}`} >
        <div className="transfer-asset__container">
        <div className="transfer-asset-summary">
        <div
              key={swapPair.token1.token.address}
              className={`
              transfer-asset
              transfer-asset--send
            `}
            >
              <div className="transfer-asset__content-ntf">
                <div className="transfer-asset__block">
                  {
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-around',width:'100%'}}> 
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-around',flexDirection:'column'}}>
                    <div
                      className="transfer-asset__amount-token-icon row-span-2"
                      style={{ backgroundImage: `url(${swapPair.token1.token.iconUrl})` }}
                    >
                    </div>
                    <div style={{padding:'4px'}}>
                    <Uik.Text type='mini' text={swapPair.token1.token.name}/>
                    </div>
                    
                      </div> 
                    <div className="transfer-asset__indicator">
                        <Uik.Icon
                          icon={faRepeat}
                        />
                      </div>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-around',flexDirection:'column'}}>
                    <div
                      className="transfer-asset__amount-token-icon row-span-2"
                      style={{ backgroundImage: `url(${swapPair.token2.token.iconUrl})` }}
                    >
                    </div>
                    <div style={{padding:'4px'}}>
                    <Uik.Text type='mini' text={swapPair.token2.token.name}/>
                    </div>
                    
                      </div> 
                    </div>
                    
                  }
                </div>
                <Uik.Text text="Transfer Details" type="light" className="mt-2" />
                <div className="transfer-asset__block my-2">
                  <div className="transfer-detail">
                    <div style={{paddingRight:'2px',paddingLeft:'10px'}}>
                      <Uik.Text text={amount1.includes('+')?'Received':'Sent'} type='light'/>
                      <Uik.Text text={amount2.includes('+')?'Received':'Sent'} type='light'/>
                      <Uik.Text text={'fees'} type='mini'/>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',justifyItems:'start',alignItems:'start'}}>
                  <div className="amount-wrapper" style={{padding:'2px',paddingLeft:'20px'}}>
                    <div
                      className={`
                    transfer-asset__amount-wrapper
                   
                  `}
                      title={`${type1 === 'receive' ? '+' : '-'} ${showBalance(
                              swapPair.token1.token as Token,
                      )}`}
                    >
                      <div
                        className={`
                        ${
                                hideBalance.isHidden
                                  ? 'transfer-asset__amount--hidden'
                                  : ''
                            }
                      `}
                      >
                        {!hideBalance.isHidden ? (
                          <>
                            <Uik.Text type='mini' text={amount1} className={`${amount1.includes("+")?'activity-item__amount-swap-receive':'activity-item__amount-swap-send'} `}/>
                          </>
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
                    </div>
                  </div>
                  <div className="amount-wrapper" style={{padding:'2px',paddingLeft:'20px'}}>
                    <div
                      className={`
                    transfer-asset__amount-wrapper
                   
                  `}
                      title={`${type1 === 'receive' ? '+' : '-'} ${showBalance(
                              swapPair.token2.token as Token,
                      )}`}
                    >
                      <div
                        className={`
                        ${
                                hideBalance.isHidden
                                  ? 'transfer-asset__amount--hidden'
                                  : ''
                            }
                      `}
                      >
                        {!hideBalance.isHidden ? (
                          <>
                            <Uik.Text type='mini' text={amount2} className={`${amount2.includes("+")?'activity-item__amount-swap-receive':'activity-item__amount-swap-send'} `} />
                          </>
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
                    </div>
                  </div>
                  <div className="amount-wrapper" style={{padding:'2px',paddingLeft:'20px'}}>
                    <div
                      className={`
                    transfer-asset__amount-wrapper
                   
                  `}
                      title={`${type1 === 'receive' ? '+' : '-'} ${showBalance(
                              swapPair.fees as any,
                      )}`}
                    >
                      <div
                        className={`
                        ${
                                hideBalance.isHidden
                                  ? 'transfer-asset__amount--hidden'
                                  : ''
                            }
                      `}
                      >
                        {!hideBalance.isHidden ? (
                          <>
                            <Uik.Text type='mini' text={"- "+displayBalanceFromToken(swapPair.fees.token as Token) + " REEF"} />
                          </>
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
                    </div>
                  </div>
                    </div>
                  </div>
                </div>
                <Uik.Button text="Details" onClick={() => window.open(swapPair.token2.url, '_blank')} />
              </div>
            </div>
        </div>
        </div>
    </OverlayAction>
  )
}

export default SwapActivityDetails