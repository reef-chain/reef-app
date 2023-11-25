import axios from 'axios';
import { useLocation } from 'react-router';
import { AvailableNetworks } from '@reef-chain/react-lib/dist/state/network';
import { useEffect } from 'react';

const MS_PROMO_IDENT = 'msPromo';

type NetworksMap<T> = { [NET in AvailableNetworks]: T };
const baseUrls: NetworksMap<string> = {
  mainnet: 'https://api.reefscan.com',
  testnet: 'https://api-testnet.reefscan.com',
  localhost: 'https://api-testnet.reefscan.com',
};

export enum EventType{
  SWAP = 'swap',
}

interface paramType {
  vid?:string
}

export const useMagicSquareParamsSave = ():void => {
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const params:paramType = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of searchParams) {
      // @ts-ignore
      params[key] = value;
    }

    if (!params.vid) {
      return;
    }
    localStorage.setItem(MS_PROMO_IDENT, params.vid);
  }, [location]);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const magicSquareAction = async (network: AvailableNetworks, eventType: EventType, address:string):Promise<void> => {
  const baseUrl = baseUrls[network];
  const msUserId = localStorage.getItem(MS_PROMO_IDENT);
  if (!msUserId) {
    return;
  }

  const bodyParams = {
    msUserId,
    network,
    eventType,
    address,
  };

  axios.post(`${baseUrl}/magicsquare`, bodyParams).catch((err) => {
    // do nothing
    console.log('ms err=', err);
  });
};
