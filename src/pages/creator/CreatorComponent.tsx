import {
  ReefSigner,
  utils as reefUtils,
} from '@reef-chain/react-lib';
import { network as nw, reefState } from '@reef-chain/util-lib';
import React, { useEffect, useState } from 'react';
import { faCheckCircle, faXmarkCircle } from '@fortawesome/free-regular-svg-icons';
import { faArrowUpRightFromSquare, faCoins } from '@fortawesome/free-solid-svg-icons';
import { Contract, ContractFactory, utils } from 'ethers';
import { useHistory } from 'react-router-dom';
import Uik from '@reef-chain/ui-kit';
import { verifyContract } from '../../utils/contract';
import { DeployContractData, deployTokens } from './tokensDeployData';
import './creator.css';
import IconUpload from './IconUpload';
import ConfirmToken from './ConfirmToken';
import { getAppNetworkOverride } from '../../environment';
import { localizedStrings as strings } from '../../l10n/l10n';

interface CreatorComponent {
  signer: ReefSigner | undefined;
  network: nw.Network;
  onTxUpdate?: reefUtils.TxStatusHandler;
}

interface ITokenOptions {
  burnable: boolean;
  mintable: boolean;
}

interface ResultMessage {
  complete: boolean;
  title: string;
  message: string;
  contract?: Contract;
}

interface UpdateTokenBalance {
  visibility:boolean;
  message:string;
  complete:boolean;
}

interface CreateToken {
  signer?: ReefSigner;
  setResultMessage: (result: ResultMessage) => void;
  setUpdateTokensBalance: (updateTokensBalance: UpdateTokenBalance) => void;
  updateTokensBalance:UpdateTokenBalance;
  tokenName: string;
  symbol: string;
  initialSupply: string;
  icon?:string;
  tokenOptions: ITokenOptions;
  network: nw.Network;
  onTxUpdate?: reefUtils.TxStatusHandler;
  setVerifiedContract: (contract: Contract) => void;
  setDeployedContract: (contract: Contract) => void;
}

async function verify(
  contract: Contract,
  args: string[],
  network: nw.Network,
  contractData: DeployContractData,
  icon:string,
): Promise<boolean> {
  const contractDataSettings = contractData.metadata.settings;
  const { compilationTarget } = contractDataSettings;
  const compTargetFileName = Object.keys(compilationTarget)[0];

  const verified = await verifyContract(
    contract,
    {
      source: JSON.stringify(contractData.sources),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      contractName: compilationTarget[compTargetFileName],
      target: contractDataSettings.evmVersion,
      compilerVersion: `v${contractData.metadata.compiler.version}`,
      optimization: contractDataSettings.optimizer.enabled.toString(),
      filename: compTargetFileName,
      runs: contractData.metadata.settings.optimizer.runs,
      license: 'MIT',
    },
    args,
    network.verificationApiUrl,
    icon,
  );
  console.log(verified);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return verified as any;
}

const createToken = async ({
  signer,
  network,
  tokenName,
  symbol,
  initialSupply,
  tokenOptions,
  icon,
  onTxUpdate,
  setResultMessage,
  setUpdateTokensBalance,
  updateTokensBalance,
  setVerifiedContract,
  setDeployedContract,
}: CreateToken): Promise<void> => {
  // eslint-disable-next-line no-param-reassign
  network = getAppNetworkOverride(network);
  if (!signer) {
    console.log('signer not set ');
    return;
  }
  setResultMessage({
    complete: false,
    title: strings.deploying_token,
    message: strings.sending_token_contract,
  });
  const args = [
    tokenName,
    symbol.toUpperCase(),
    utils.parseEther(initialSupply).toString(),
  ];
  let deployContractData = deployTokens.mintBurn;
  if (!tokenOptions.burnable && !tokenOptions.mintable) {
    deployContractData = deployTokens.noMintNoBurn;
  } else if (tokenOptions.burnable && !tokenOptions.mintable) {
    deployContractData = deployTokens.noMintBurn;
  } else if (!tokenOptions.burnable && tokenOptions.mintable) {
    deployContractData = deployTokens.mintNoBurn;
  }
  const deployAbi = deployContractData.metadata.output.abi;
  const deployBytecode = `0x${deployContractData.bytecode.object}`;
  const reef20Contract = new ContractFactory(
    deployAbi,
    deployBytecode,
    signer?.signer,
  );
  const txIdent = Math.random().toString(10);
  let contract: Contract | undefined;
  let verified = false;
  if (onTxUpdate) {
    onTxUpdate({
      txIdent,
    });
  }
  try {
    contract = await reef20Contract.deploy(...args);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (onTxUpdate) {
      onTxUpdate({
        txIdent,
        error: {
          message: err.message,
          code: reefUtils.TX_STATUS_ERROR_CODE.ERROR_UNDEFINED,
        },
        txTypeEvm: true,
        addresses: [signer.address],
      });
    }
    console.log('deploy err=', err);
  }
  if (!contract) {
    setResultMessage({
      complete: true,
      title: strings.error_creating_token,
      message: strings.deploying_contract_failed,
    });
    return;
  }
  setDeployedContract(contract);
  if (onTxUpdate) {
    onTxUpdate({
      txIdent,
      txHash: contract.hash,
      isInBlock: true,
      txTypeEvm: true,
      url: `https://${
        network === nw.AVAILABLE_NETWORKS.mainnet ? '' : `${network.name}.`
      }reefscan.com/extrinsic/${contract.hash}`,
      addresses: [signer.address],
    });
  }
  try {
    setResultMessage({
      complete: false,
      title: strings.verifying_deployed_token,
      message: strings.smart_contract_bytecode_validated,
    });
    verified = await verify(contract, args, network, deployContractData, icon!);
  } catch (err) {
    console.log('verify err=', err);
  }
  if (verified) {
    setVerifiedContract(contract);
    setResultMessage({
      complete: true,
      title: strings.token_created,
      message: `Success, your new token ${tokenName} is deployed. Initial supply is ${initialSupply} ${symbol.toUpperCase()}. Next step is to create a pool so users can start trading.`,
      contract,
    });
    setUpdateTokensBalance({
      ...updateTokensBalance, visibility: true,
    });
    const tokenBalancesSub = reefState.selectedTokenBalances$.subscribe((e) => {
      const addresses = e.map((token) => token.address);
      if (addresses.includes(contract?.address)) {
        setUpdateTokensBalance({
          message: 'Token balances updated',
          visibility: true,
          complete:
          true,
        });
        tokenBalancesSub.unsubscribe();
      }
    });
  } else {
    setResultMessage({
      complete: true,
      title: 'Error verifying token',
      message: `Verifying deployed contract ${contract.address} failed.`,
    });
  }
};

export const CreatorComponent = ({
  signer,
  onTxUpdate,
  network,
}: CreatorComponent): JSX.Element => {
  const [resultMessage, setResultMessage] = useState<{
    complete: boolean;
    title: string;
    message: string;
    contract?: Contract;
  } | null>(null);
  const [updateTokensBalance, setUpdateTokensBalance] = useState<UpdateTokenBalance>({
    visibility: false, message: 'Updating token balances', complete: false,
  });
  const [tokenName, setTokenName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [tokenOptions, setTokenOptions] = useState<ITokenOptions>({
    burnable: true,
    mintable: true,
  });
  const [initialSupply, setInitialSupply] = useState('');
  const [validationMsg, setValidationMsg] = useState('');
  const [, setVerifiedContract] = useState<Contract>();
  // eslint-disable-next-line
  const [deployedContract, setDeployedContract] = useState<Contract>();
  const [isConfirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (tokenName.trim().length < 1) {
      setValidationMsg('Set token name');
      return;
    }

    if (symbol.trim().length < 1) {
      setValidationMsg('Set token symbol');
      return;
    }

    if (initialSupply.trim().length < 1) {
      setValidationMsg('Set initial supply');
      return;
    }
    const iSupply = parseInt(initialSupply, 10);
    if (Number.isNaN(iSupply) || iSupply < 1) {
      setValidationMsg('Initial supply must be positive whole number');
      return;
    }
    try {
      utils.parseEther(initialSupply);
    } catch (e) {
      setValidationMsg('Initial supply not valid');
      return;
    }

    setValidationMsg('');
  }, [tokenName, symbol, initialSupply]);

  const init = (): void => {
    setTokenName('');
    setSymbol('');
    setInitialSupply('');
    setResultMessage(null);
  };
  const handleSupplyInput = (value = ''): void => {
    const numeric = value.replace(/[^0-9]/g, '');
    setInitialSupply(numeric || '');
  };

  const [icon, setIcon] = useState('');

  const history = useHistory();

  // @ts-ignore
  return (
    <>
      <>
        {!resultMessage && (
          <div className="creator">
            <div className="creator__form">
              <Uik.Container flow="spaceBetween">
                <Uik.Container vertical flow="start">
                  <Uik.Text type="headline">{strings.create_your_token}</Uik.Text>
                  <Uik.Text type="lead">{strings.create_own_token}</Uik.Text>
                </Uik.Container>
                <IconUpload
                  value={icon}
                  onChange={(e) => setIcon(e)}
                />
              </Uik.Container>

              <Uik.Form>
                <Uik.Container className="creator__form-main">
                  <Uik.Input
                    label={strings.token_name}
                    placeholder={strings.my_token}
                    value={tokenName}
                    maxLength={42}
                    onInput={(e) => setTokenName(e.target.value)}
                  />

                  <Uik.Input
                    className="creator__token-symbol-input"
                    label={strings.token_symbol}
                    placeholder={strings.token_symbol_name}
                    value={symbol}
                    maxLength={42}
                    onInput={(e) => setSymbol(e.target.value)}
                  />
                </Uik.Container>

                <Uik.Input
                  label={strings.initial_supply}
                  placeholder="0"
                  value={initialSupply}
                  min={1}
                  onInput={(e) => handleSupplyInput(e.target.value)}
                />

                <Uik.Container className="creator__form-bottom">
                  <Uik.Toggle
                    label={strings.burnable}
                    onText={strings.yes}
                    offText={strings.no}
                    value={tokenOptions.burnable}
                    onChange={() => setTokenOptions({
                      ...tokenOptions,
                      burnable: !tokenOptions.burnable,
                    })}
                  />

                  <Uik.Toggle
                    label={strings.mintable}
                    onText={strings.yes}
                    offText={strings.no}
                    value={tokenOptions.mintable}
                    onChange={() => setTokenOptions({
                      ...tokenOptions,
                      mintable: !tokenOptions.mintable,
                    })}
                  />
                </Uik.Container>
              </Uik.Form>
            </div>
            <div className="creator__preview">
              <div className="creator__preview-wrapper">
                <Uik.Text type="lead" className="creator__preview-title">{strings.token_preview}</Uik.Text>

                <div className="creator__preview-token">
                  <div className="creator__preview-token-image">
                    {
                      !!icon
                      && (
                      <img
                        src={icon}
                        alt={strings.token_icon}
                        key={icon}
                      />
                      )
                    }
                  </div>
                  <div className="creator__preview-token-info">
                    <div className="creator__preview-token-name">{ tokenName }</div>
                    <div className="creator__preview-token-symbol">{ symbol }</div>
                  </div>

                  {
                    !!initialSupply
                    && <Uik.Text className="creator__preview-token-supply" type="headline">{ Uik.utils.formatHumanAmount(initialSupply) }</Uik.Text>
                  }
                </div>

                <div
                  className={`
                    creator__preview-info
                    ${!tokenOptions.burnable ? 'creator__preview-info--disabled' : ''}
                  `}
                >
                  <Uik.Container flow="start">
                    <Uik.Icon icon={tokenOptions.burnable ? faCheckCircle : faXmarkCircle} />
                    <Uik.Text>
                      { !tokenOptions.burnable && `${strings.not} `}
                      {strings.burnable}
                    </Uik.Text>
                  </Uik.Container>
                  <Uik.Text type="mini">
                    {strings.existing_tokens}
                    {' '}
                    { tokenOptions.burnable ? strings.can : `${strings.can} ${strings.not}` }
                    {' '}
                    {strings.be_destroyed}
                  </Uik.Text>
                </div>

                <div
                  className={`
                    creator__preview-info
                    ${!tokenOptions.mintable ? 'creator__preview-info--disabled' : ''}
                  `}
                >
                  <Uik.Container flow="start">
                    <Uik.Icon icon={tokenOptions.mintable ? faCheckCircle : faXmarkCircle} />
                    <Uik.Text>
                      { !tokenOptions.mintable && `${strings.not} ` }
                      {strings.mintable}
                    </Uik.Text>
                  </Uik.Container>
                  <Uik.Text type="mini">
                    {strings.new_tokens}
                    {' '}
                    { tokenOptions.mintable ? strings.can : `${strings.can} ${strings.not}` }
                    {' '}
                    {strings.be_created}
                  </Uik.Text>
                </div>
                <Uik.Button
                  disabled={!!validationMsg}
                  text={strings.create_token}
                  fill={!validationMsg}
                  size="large"
                  onClick={() => setConfirmOpen(true)}
                />
              </div>
            </div>
          </div>
        )}

        <ConfirmToken
          name={tokenName}
          symbol={symbol}
          supply={initialSupply}
          isBurnable={tokenOptions.burnable}
          isMintable={tokenOptions.mintable}
          isOpen={isConfirmOpen}
          icon={icon}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => createToken({
            signer,
            network,
            tokenName,
            symbol,
            initialSupply,
            tokenOptions,
            icon,
            onTxUpdate,
            setResultMessage,
            setUpdateTokensBalance,
            updateTokensBalance,
            setVerifiedContract,
            setDeployedContract,
          })}
        />
      </>

      {
        resultMessage
        && (
        <div className="creator">
          <div className="creator__creating" key={resultMessage.title}>
            { !resultMessage.complete && <Uik.Loading /> }

            <Uik.Text type="headline">{ resultMessage.title }</Uik.Text>
            <Uik.Text>{ resultMessage.message }</Uik.Text>

            { updateTokensBalance.visibility && (
            <div className="creator__updating-token-balance">
              {updateTokensBalance.complete ? <Uik.Icon icon={faCheckCircle} /> : <Uik.Loading size="small" />}
              <Uik.Text className="creator__updating-token-balance--text">{ updateTokensBalance.message }</Uik.Text>
            </div>
            ) }

            {
              !!resultMessage.contract
              && resultMessage.complete
              && (
              <div className="creator__creating-cta">
                <Uik.Button
                  text={strings.view_in_explorer}
                  icon={faArrowUpRightFromSquare}
                  size="large"
                  onClick={() => window.open(`${network.reefscanUrl}/contract/${resultMessage.contract?.address}`)}
                />
                {
                  updateTokensBalance.complete
                    ? (
                      <Uik.Button
                        fill
                        text={strings.create_a_pool}
                        icon={faCoins}
                        size="large"
                        onClick={() => history.push('/pools')}
                      />
                    ) : <div style={{ cursor: 'progress' }}><Uik.Button text={strings.create_a_pool} icon={faCoins} size="large" disabled /></div>
                }
              </div>
              )
            }

            {
              resultMessage.title === strings.create_a_pool
              && (
              <div className="creator__creating-cta">
                <Uik.Button
                  text={strings.return_to_creator}
                  size="large"
                  onClick={init}
                />
              </div>
              )
            }
          </div>
        </div>
        )
      }
    </>
  );
};
