import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Contract, utils } from 'ethers';

const CONTRACT_VERIFICATION_URL = '/verification/submit';

interface BaseContract {
    runs: number;
    source: string;
    target: string;
    optimization: string;
    compilerVersion: string;
    license: string;
}

export interface VerificationContractReq extends BaseContract {
    name: string;
    address: string;
    filename: string;
    arguments: string;
    file?: string;
}

export interface ReefContract extends BaseContract {
    filename: string;
    contractName: string;
}
const BLOCK_TIME = 10000;

const contractVerificatorApi = axios.create();

const toContractAddress = (address: string): string => utils.getAddress(address);

const graphqlUrls = {
  explorerTestnet: 'https://squid.subsquid.io/reef-explorer-testnet/graphql',
  explorerMainnet: 'https://squid.subsquid.io/reef-explorer/graphql',
};

const CONTRACT_EXISTS_GQL = `
  query query ($address: String!) {
      contracts(limit: 1, where: {id_eq: $address}) {
        id
      }
  }
          
          
`;

const getGraphqlEndpoint = (network:string):string => {
  if (network === 'testnet') {
    return graphqlUrls.explorerTestnet;
  }
  return graphqlUrls.explorerMainnet;
};

// eslint-disable-next-line
const getContractExistsQry = (address: string) => ({
  query: CONTRACT_EXISTS_GQL,
  variables: { address },
});

const ACTIVE_NETWORK_LS_KEY = 'reef-app-active-network';

const graphqlRequest = (
  httpClient: AxiosInstance,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queryObj: { query: string; variables: any },
  isExplorer?:boolean,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
) :any => {
  let selectedNetwork = 'mainnet';
  try {
    const storedNetwork = localStorage.getItem(ACTIVE_NETWORK_LS_KEY);
    if (storedNetwork) {
      const parsedStoredNetwork = JSON.parse(storedNetwork);
      selectedNetwork = parsedStoredNetwork.name;
    }
  } catch (error) {
  }
  const graphql = JSON.stringify(queryObj);
  if (isExplorer) {
    const url = getGraphqlEndpoint(selectedNetwork);
    return httpClient.post(url, graphql, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = getGraphqlEndpoint(selectedNetwork);
  return httpClient.post(url, graphql, {
    headers: { 'Content-Type': 'application/json' },
  });
};

const isContrIndexed = async (address: string): Promise<boolean> => new Promise((resolve) => {
  const timer = setInterval(async () => {
    try {
      const result = await graphqlRequest(axios, getContractExistsQry(address));
      if (result.data.data.contracts && result.data.data.contracts.length) {
        console.log(result.data.data);
        resolve(true);
        clearInterval(timer);
      }
    } catch (error) {
      resolve(false);
    }
  }, BLOCK_TIME);
}) as Promise<boolean>;

export const verifyContract = async (deployedContract: Contract, contract: ReefContract, arg: string[], url?: string, file?:string): Promise<boolean> => {
  if (!url) {
    return false;
  }
  try {
    const contractAddress = toContractAddress(deployedContract.address);
    if (!await isContrIndexed(contractAddress)) {
      return false;
    }

    const body: VerificationContractReq = {
      address: contractAddress,
      arguments: JSON.stringify(arg),
      name: contract.contractName,
      filename: contract.filename,
      target: contract.target,
      source: contract.source,
      optimization: contract.optimization,
      compilerVersion: contract.compilerVersion,
      license: contract.license,
      runs: contract.runs,
      file: file?.split(',')[1],
    };

    await contractVerificatorApi.post<VerificationContractReq, AxiosResponse<string>>(`${url}${CONTRACT_VERIFICATION_URL}`, body);
    return true;
  } catch (err) {
    console.error('Verification err=', err);
    return false;
  }
};
