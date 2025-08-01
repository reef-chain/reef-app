import { ReefSigner } from '@reef-chain/react-lib';
import React, { useContext, useState } from 'react';
import ReefSigners from '../../context/ReefSigners';
import Uik from "@reef-chain/ui-kit";
import "./index.css"
import Hero from './Hero';
import axios from 'axios';

function AlchemyPay(): JSX.Element {
  const [amount, setAmount] = useState('0');
  const [alchemyPayUrl, setAlchemyPayUrl] = useState(undefined);

  const signer: ReefSigner | undefined | null = useContext(ReefSigners).selectedSigner;

  const ALCHEMY_PAY_ENDPOINT = "http://localhost:3001/alchemy-pay/signature";

  const getAlchemyPayUrl = async () => {
    try {
      const merchantOrderNo = Date.now().toString()+signer?.address;
      const response = await axios.get(ALCHEMY_PAY_ENDPOINT, {
        params: {
          crypto: 'REEF',
          fiat: 'USD',
          fiatAmount: amount,
          merchantOrderNo,
          network: 'REEF'
        }
      });
      setAlchemyPayUrl(response.data.link);
    } catch (error) {
      Uik.notify.danger(error.message)
    }
  }

  const resetPage = () => {
    setAlchemyPayUrl(undefined);
    setAmount('0')
  }

  return (
    <div className='alchemy-pay-container'>

      <div>
        <Hero title="Buy Reef" subtitle={"Top up your Reef wallet in few clicks!"} isLoading={signer == undefined} />

        <div className={`${alchemyPayUrl?'alchemy-':''}form-wrapper`}>
          {
            alchemyPayUrl ? <div className='alchemy-pay-iframe'>
              <iframe
                src={alchemyPayUrl}
                height="580px"
                width="50%"
                frameBorder="0"
                style={{ marginTop: '20px' }}
                title="AlchemyPay Ramp"
              ></iframe>
              <Uik.Button text='Reset' onClick={() => resetPage()} fill className="wide-button" />
            </div> :
              <>
                <Uik.Input
                  label='Amount (USD)'
                  value={amount}
                  onInput={e => setAmount(e.target.value)}
                />

                {signer &&
                  <>
                    <br />
                    <Uik.Input
                      label='Selected Address'
                      value={signer?.address}
                      disabled
                    />
                  </>
                }

                <br />

                <Uik.Button text='Purchase' onClick={() => getAlchemyPayUrl()} fill className="wide-button" />
              </>
          }



        </div>

        {/* <div style={{ height: '100vh' }}> */}
        {/* <iframe
        title="onramp-display"
        src={`https://onramp.money/main/buy/?appId=487411&walletAddress=${signer?.address}`}
        style={{ width: '100%', height: '100%', border: 'none' }}
      /> */}

        {/* </div> */}
      </div>
    </div>

  );
}

export default AlchemyPay;
