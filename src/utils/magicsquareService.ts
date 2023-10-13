import axios from 'axios';
import { useLocation } from 'react-router';

const MS_PROMO_IDENT = 'msPromo';

export const useSaveToMs = async ():Promise<void> => {
  // save to magicstore - remove after campaign @anukulpandey
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const params = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of searchParams) {
    // @ts-ignore
    params[key] = value;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingParams = JSON.parse(localStorage.getItem(MS_PROMO_IDENT) as any) || {};
  const updatedParams = { ...existingParams, ...params };
  localStorage.setItem('msPromo', JSON.stringify(updatedParams));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const makeRequestToMs = async (baseUrl:string):Promise<any> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bodyParams = JSON.parse(localStorage.getItem(MS_PROMO_IDENT) as any) || {};
  // eslint-disable-next-line no-param-reassign
  const { data } = await axios.post(`${baseUrl}/magicsquare`, bodyParams);
  return data;
};
