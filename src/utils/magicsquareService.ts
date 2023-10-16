import axios from 'axios';
import { useLocation } from 'react-router';

const MS_PROMO_IDENT = 'msPromo';

interface paramType {
  vid?:string
}

export const useSaveToMs = async ():Promise<void> => {
  // save to magicstore - remove after campaign @anukulpandey
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const params:paramType = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of searchParams) {
    // @ts-ignore
    params[key] = value;
  }

  if (!params.vid) return;

  const updatedParams = {
    msUserId: params.vid,
  };

  localStorage.setItem(MS_PROMO_IDENT, JSON.stringify(updatedParams));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const makeRequestToMs = async (eventType:string, address:string):Promise<any> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const msData = JSON.parse(localStorage.getItem(MS_PROMO_IDENT) as any) || {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectedNetwork = JSON.parse(localStorage.getItem('reef-app-active-network') as any);

  if (!msData.vid) return null;

  const bodyParams = {
    msUserId: msData.vid,
    network: selectedNetwork.name,
    eventType,
    address,
  };

  // eslint-disable-next-line no-param-reassign
  const { data } = await axios.post(`${selectedNetwork.verificationApiUrl}/magicsquare`, bodyParams);
  return data;
};
