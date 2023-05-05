import {
  appState, Components, hooks, ReefSigner,
} from '@reef-defi/react-lib';
import React, {
  useEffect, useState,
} from 'react';
import './Buy.css';
import { InputAmountValidity } from '@reef-defi/react-lib/dist/components/common/Input';
import { AuthenticationResponse, BuyPair, BuyPayload } from './models';
import * as api from './api-access';
import Uik from "@reef-defi/ui-kit";
import { faChevronDown }  from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const {
  Button: ButtonModule,
  Card: CardModule,
  Input: InputModule,
  Display, Icons,
} = Components;
const {
  ComponentCenter, MX, MT, FlexRow,
} = Display;
const {
  CardHeader, SubCard, CardHeaderBlank, CardTitle, Card,
} = CardModule;
const { InputAmount } = InputModule;
const { Button } = ButtonModule;

const Buy = (): JSX.Element => {
  const FROM_FIAT_SYMBOL = 'EUR';
  const TOKEN_NAME = 'REEF';
  const iconUrl = {
    REEF: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6951.png',
    FROM_CURRENCY: 'https://s2.coinmarketcap.com/static/cloud/img/fiat-flags/EUR.svg',
  };
  const selectedSigner: ReefSigner | undefined | null = hooks.useObservableState(appState.selectedSigner$);

  const [tokenAmount, setTokenAmount] = useState<string>('');
  const [allPairs, setAllPairs] = useState<any>([]);
  const [fiatAmount, setFiatAmount] = useState<string>('');
  const [selectedPair, setSelectedPair] = useState<BuyPair>();
  const [selectedFiatCurrency,setSelectedFiatCurrency] = useState<string>('EUR');
  const [disableBuy, setDisableBuy] = useState<boolean>(true);
  const [disableInputs, setDisableInputs] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isOpen, setOpen] = useState(false)

  useEffect(() => {
    api.getPairs()
      .then((pairs) => {
        console.log('pairs', pairs);
        setAllPairs(pairs);
        const pair = pairs.filter((item: BuyPair) => item.fiatCurrency === FROM_FIAT_SYMBOL && item.cryptoCurrency === TOKEN_NAME);
        if (pair.length === 0) {
          throw new Error();
        }
        setSelectedPair(pair[0]);
      })
      .catch(() => {
        setError('Can not retrieve trading pair information');
        setDisableInputs(true);
      });
  }, []);

  useEffect(() => {
    const isLastCharDigit = (num: string): boolean => /\d/.test(num.slice(-1));
    const isValidPositiveNumber = (num: string): boolean => num?.length > 0 && num != null && !Number.isNaN(+num) && +num > 0;

    const tokenAmountValid = isValidPositiveNumber(tokenAmount) && isLastCharDigit(tokenAmount);
    const fiatAmountValid = isValidPositiveNumber(fiatAmount) && isLastCharDigit(fiatAmount);
    const someInputIsInvalid = !tokenAmountValid || !fiatAmountValid;
    setDisableBuy(someInputIsInvalid || !!error);
  }, [fiatAmount, tokenAmount, error]);

  const onFiatAmountChange = (amount: string): void => {
    const coefficient = selectedPair?.quotation ?? 0;
    const calculated = amount ? (+amount / coefficient).toFixed(2) : amount;
    setTokenAmount(calculated.toString());
    setFiatAmount(amount);
  };

  const onTokenAmountChange = (amount: string): void => {
    const coefficient = selectedPair?.quotation ?? 1;
    const calculated = amount ? (+amount * coefficient).toFixed(2) : amount;
    setFiatAmount(calculated.toString());
    setTokenAmount(amount);
  };

  const onFiatValidityChange = (validity: InputAmountValidity): void => {
    setError(validity.valid ? '' : validity.errorMessage || 'fiat validity error');
  };

  const buy = async (): Promise<void> => {
    if (!selectedSigner) {
      return;
    }
    let auth: AuthenticationResponse | undefined;

    try {
      auth = await api.authenticate(selectedSigner);
      if (!auth?.authenticated) {
        throw new Error();
      }
    } catch (_) {
      setError('Error occurred while authorizing');
    }

    try {
      if (auth?.authenticated && auth?.token) {
        const tradePayload = {
          address: selectedSigner.address,
          fiatCurrency: selectedPair?.fiatCurrency,
          cryptoCurrency: selectedPair?.cryptoCurrency,
          orderAmount: +fiatAmount,
          merchantRedirectUrl: 'https://app.reef.io/',
        } as BuyPayload;
        const trade = await api.createTrade(tradePayload, auth.token);

        if (trade?.eternalRedirectUrl) {
          window.location.href = trade.eternalRedirectUrl;
        }
      }
    } catch (_) {
      setError('Error occurred while creating a trade');
    }
  };

  return (
    <ComponentCenter>
      <Card>
        <CardHeader>
          <CardHeaderBlank />
          <CardTitle title="Buy Reef tokens" />
          <CardHeaderBlank />
        </CardHeader>

        <SubCard>
          <MT size="1" />
          <FlexRow >
          <MT size="2" />
          <FontAwesomeIcon className="chevronDown" icon={faChevronDown} fontSize={10} onClick={()=>setOpen(true)}/>
          <MT size="2" />

            <Icons.TokenIcon src={`https://s2.coinmarketcap.com/static/cloud/img/fiat-flags/${selectedFiatCurrency}.svg`} />
            <MX size="2" />
            <span className="pair--name">{selectedFiatCurrency} </span>
            <div className='pair--dropdown'>
  <Uik.Dropdown
    isOpen={isOpen}
    onClose={() => setOpen(false)}
  > 
  {allPairs.map((pair:BuyPair) => (
    <div onClick={()=>{
      setSelectedPair(pair);
      setSelectedFiatCurrency(pair.fiatCurrency);
      setOpen(false);
    }}>
      <FlexRow key={pair.fiatCurrency}>
        <MX size="2" />
      <Icons.TokenIcon src={`https://s2.coinmarketcap.com/static/cloud/img/fiat-flags/${pair.fiatCurrency}.svg`} />
            <MX size="3" />
            <span className="pair--name" >{pair.fiatCurrency}</span>
            </FlexRow>
            </div>
  ))}
  </Uik.Dropdown>
            </div>
            <InputAmount
              amount={fiatAmount}
              placeholder="0.0"
              min={selectedPair?.minLimit}
              max={selectedPair?.maxLimit}
              disabled={disableInputs}
              onAmountChange={onFiatAmountChange}
              onValidityChange={onFiatValidityChange}
            />
          </FlexRow>
          <MT size="1" />
        </SubCard>

        <MT size="2" />
        <SubCard>
          <MT size="1" />
          <FlexRow>
            <Icons.TokenIcon src={iconUrl.REEF} />
            <MX size="1" />
            <span className="pair--name">REEF</span>
            <InputAmount
              amount={tokenAmount}
              placeholder="0.0"
              disabled={disableInputs}
              onAmountChange={onTokenAmountChange}
            />
          </FlexRow>
          <MT size="1" />
        </SubCard>
        <MT size="3" />
        <Button className="w-100" disabled={disableBuy} onClick={buy}>{ error || 'Buy'}</Button>
      </Card>
     
    </ComponentCenter>
  );
};

export default Buy;
