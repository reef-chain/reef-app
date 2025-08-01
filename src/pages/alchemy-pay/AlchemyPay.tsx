import React, { useContext, useState } from 'react';
import ReefSigners from '../../context/ReefSigners';
import Uik from "@reef-chain/ui-kit";
import "./index.css"
import Hero from './Hero';
import axios from 'axios';
import { ReefSigner } from '@reef-chain/react-lib';

function AlchemyPay(): JSX.Element {
  const [amount, setAmount] = useState('0');
  const [error, setError] = useState('');
  const [alchemyPayUrl, setAlchemyPayUrl] = useState<string | undefined>(undefined);

  const signer: ReefSigner | undefined | null = useContext(ReefSigners).selectedSigner;

  const ALCHEMY_PAY_ENDPOINT = "http://localhost:3001/alchemy-pay/signature";

  // https://alchemypay.notion.site/REEF-2234bb38a28080ae8e17dd65a6ea5822
  const MIN_AMOUNT = 15;
  const MAX_AMOUNT = 2000;

  const getAlchemyPayUrl = async () => {
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount < MIN_AMOUNT || numericAmount > MAX_AMOUNT) {
      setError(`Amount must be between $${MIN_AMOUNT} and $${MAX_AMOUNT}`);
      return;
    }

    setError(''); // clear error if valid

    try {
      const merchantOrderNo = Date.now().toString() + signer?.address;
      const response = await axios.get(ALCHEMY_PAY_ENDPOINT, {
        params: {
          crypto: 'REEF',
          fiat: 'USD',
          fiatAmount: numericAmount,
          merchantOrderNo,
          network: 'REEF'
        }
      });
      setAlchemyPayUrl(response.data.link);
    } catch (error: any) {
      Uik.notify.danger(error.message);
    }
  };

  const resetPage = () => {
    setAlchemyPayUrl(undefined);
    setAmount('0');
    setError('');
  };

  return (
    <div className='alchemy-pay-container'>
      <div>
        <Hero title="Buy Reef" subtitle="Top up your Reef wallet in few clicks!" isLoading={signer == undefined} />

        <div className={`${alchemyPayUrl ? 'alchemy-' : ''}form-wrapper`}>
          {alchemyPayUrl ? (
            <div className='alchemy-pay-iframe'>
              <iframe
                src={alchemyPayUrl}
                height="580px"
                width="50%"
                frameBorder="0"
                style={{ marginTop: '20px' }}
                title="AlchemyPay Ramp"
              ></iframe>
              <Uik.Button text='Reset' onClick={resetPage} fill className="wide-button" />
            </div>
          ) : (
            <>
              <Uik.Input
                label='Amount (USD)'
                value={amount}
                onInput={(e) => setAmount(e.target.value)}
                error={error}
              />

              {signer && (
                <>
                  <br />
                  <Uik.Input
                    label='Selected Address'
                    value={signer?.address}
                    disabled
                  />
                </>
              )}

              <br />

              <Uik.Button text='Purchase' onClick={getAlchemyPayUrl} fill className="wide-button" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AlchemyPay;
