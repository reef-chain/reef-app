import React, {
  ChangeEvent,
  useDeferredValue,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ReefSigner } from '@reef-chain/react-lib';
import Uik from '@reef-chain/ui-kit';
import ReefSigners from '../../context/ReefSigners';
import Hero from '../alchemy-pay/Hero';
import {
  createExchange,
  getQuote,
  getTransaction,
  getTransactionStatus,
  LetsExchangeCurrency,
  LetsExchangeQuote,
  LetsExchangeTransaction,
  listCurrencies,
} from './api';
import './index.css';

const FINAL_TRANSACTION_STATUSES = ['success', 'failed', 'refund', 'overdue'];
const CURRENCIES_PAGE_SIZE = 250;
const BACKGROUND_SYNC_DELAY_MS = 250;
const DEFAULT_SEND_AMOUNT = '0.001';
const DEFAULT_REEF_AMOUNT = '100000';

function LetsExchange(): JSX.Element {
  const signer: ReefSigner | undefined | null = useContext(ReefSigners).selectedSigner;
  const assetDropdownRef = useRef<HTMLDivElement | null>(null);
  const assetSearchInputRef = useRef<HTMLInputElement | null>(null);
  const [mode, setMode] = useState<'from' | 'to'>('from');
  const [currencies, setCurrencies] = useState<LetsExchangeCurrency[]>([]);
  const [baseCurrencyCount, setBaseCurrencyCount] = useState(0);
  const [currenciesHasMore, setCurrenciesHasMore] = useState(true);
  const [currenciesLoading, setCurrenciesLoading] = useState(false);
  const [currenciesLoadingMore, setCurrenciesLoadingMore] = useState(false);
  const [currenciesError, setCurrenciesError] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [assetMenuOpen, setAssetMenuOpen] = useState(false);
  const [assetSearch, setAssetSearch] = useState('');
  const deferredAssetSearch = useDeferredValue(assetSearch.trim());
  const [sendAmount, setSendAmount] = useState(DEFAULT_SEND_AMOUNT);
  const [targetReefAmount, setTargetReefAmount] = useState(DEFAULT_REEF_AMOUNT);
  const [withdrawalAddress, setWithdrawalAddress] = useState('');
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [quote, setQuote] = useState<LetsExchangeQuote | null>(null);
  const [transaction, setTransaction] = useState<LetsExchangeTransaction | null>(null);
  const [transactionStatus, setTransactionStatus] = useState('');

  const baseSymbolOptions = buildSymbolOptions(currencies);
  const assetMenuOptions = filterSymbolOptions(baseSymbolOptions, deferredAssetSearch);
  const quickAssetOptions = baseSymbolOptions.slice(0, 6);
  const selectedSymbolOption = baseSymbolOptions.find((option) => option.value === selectedSymbol);

  const networkOptions = currencies
    .filter((currency) => currency.symbol === selectedSymbol)
    .map((currency) => ({
      value: currency.network,
      label: `${currency.networkName} (${currency.network})`,
    }));

  const selectedCurrency = currencies.find(
    (currency) => currency.symbol === selectedSymbol && currency.network === selectedNetwork,
  );
  const isInitialCurrenciesLoading = currenciesLoading && baseSymbolOptions.length === 0;

  const activeAmount = mode === 'from' ? sendAmount : targetReefAmount;
  const parsedActiveAmount = parsePositiveNumber(activeAmount);
  const computedSourceAmount = mode === 'from'
    ? parsedActiveAmount
    : parsePositiveNumber(quote?.amount);
  const amountValidationMessage = getAmountValidationMessage({
    activeAmount,
    mode,
    quote,
    sourceAmount: computedSourceAmount,
    symbol: selectedSymbol,
  });
  const amountGuidanceMessage = getAmountGuidanceMessage({
    mode,
    quote,
    symbol: selectedSymbol,
  });
  const canQuote = Boolean(selectedSymbol && selectedNetwork && parsedActiveAmount);
  const canCreateSwap = Boolean(
    quote
    && canQuote
    && !amountValidationMessage
    && withdrawalAddress
    && isValidReefAddress(withdrawalAddress),
  );

  function closeAssetMenu(): void {
    setAssetMenuOpen(false);
    setAssetSearch('');
  }

  function selectSourceSymbol(symbol: string): void {
    const symbolCurrencies = currencies.filter((currency) => currency.symbol === symbol);

    setSelectedSymbol(symbol);
    closeAssetMenu();

    const defaultNetwork = symbolCurrencies.find((currency) => currency.isDefaultNetwork)?.network
      || symbolCurrencies[0]?.network
      || '';
    setSelectedNetwork(defaultNetwork);
  }

  async function fetchCurrencyPage(offset = 0): Promise<LetsExchangeCurrency[]> {
    return listCurrencies({
      limit: CURRENCIES_PAGE_SIZE,
      offset,
    });
  }

  async function loadCurrenciesPage(
    offset = 0,
    options: { append?: boolean } = {},
  ): Promise<void> {
    const { append = false } = options;

    if (append) {
      setCurrenciesLoadingMore(true);
    } else {
      setCurrenciesLoading(true);
      setCurrenciesError('');
    }

    try {
      const data = await fetchCurrencyPage(offset);
      const nextCount = offset + data.length;

      setCurrencies((previous) => (append ? mergeCurrencies(previous, data) : data));
      setBaseCurrencyCount(nextCount);
      setCurrenciesHasMore(data.length === CURRENCIES_PAGE_SIZE);
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to load LetsExchange currencies');

      if (append) {
        setCurrenciesHasMore(false);
        Uik.notify.danger(message);
      } else {
        setCurrenciesError(message);
      }
    } finally {
      if (append) {
        setCurrenciesLoadingMore(false);
      } else {
        setCurrenciesLoading(false);
      }
    }
  }

  async function loadMoreCurrencies(): Promise<void> {
    if (currenciesLoading || currenciesLoadingMore || !currenciesHasMore || baseCurrencyCount <= 0) {
      return;
    }

    await loadCurrenciesPage(baseCurrencyCount, { append: true });
  }

  async function onQuote(): Promise<void> {
    if (!canQuote) {
      return;
    }

    setQuoteLoading(true);
    setActionError('');
    setTransaction(null);
    setTransactionStatus('');

    try {
      const data = await getQuote(
        {
          fromSymbol: selectedSymbol,
          fromNetwork: selectedNetwork,
          amount: mode === 'from' ? parsePositiveNumber(sendAmount) : undefined,
          withdrawalAmount: mode === 'to' ? parsePositiveNumber(targetReefAmount) : undefined,
        },
        mode,
      );
      setQuote(data);
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to fetch LetsExchange quote');
      setActionError(message);
      Uik.notify.danger(message);
    } finally {
      setQuoteLoading(false);
    }
  }

  async function onCreate(): Promise<void> {
    if (!canCreateSwap) {
      const message = amountValidationMessage
        || (withdrawalAddress
        ? 'Please provide a valid Reef destination address.'
        : 'Create a quote and provide a Reef destination address first.');
      setActionError(message);
      Uik.notify.danger(message);
      return;
    }

    setCreateLoading(true);
    setActionError('');

    try {
      const data = await createExchange({
        fromSymbol: selectedSymbol,
        fromNetwork: selectedNetwork,
        withdrawalAddress,
        depositAmount: mode === 'from' ? parsePositiveNumber(sendAmount) : undefined,
        withdrawalAmount: mode === 'to' ? parsePositiveNumber(targetReefAmount) : undefined,
      });

      setTransaction(data);
      setTransactionStatus(data.status);
      Uik.notify.success('LetsExchange swap created');
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to create LetsExchange swap');
      setActionError(message);
      Uik.notify.danger(message);
    } finally {
      setCreateLoading(false);
    }
  }

  async function refreshTransaction(silent = false): Promise<void> {
    if (!transaction?.transaction_id) {
      return;
    }

    if (!silent) {
      setRefreshLoading(true);
    }

    try {
      const [details, status] = await Promise.all([
        getTransaction(transaction.transaction_id),
        getTransactionStatus(transaction.transaction_id),
      ]);

      setTransaction(details);
      setTransactionStatus(status || details.status);
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to refresh LetsExchange status');
      setActionError(message);
      if (!silent) {
        Uik.notify.danger(message);
      }
    } finally {
      if (!silent) {
        setRefreshLoading(false);
      }
    }
  }

  useEffect(() => {
    if (signer?.address) {
      setWithdrawalAddress((previous) => previous || signer.address);
    }
  }, [signer?.address]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!assetDropdownRef.current) {
        return;
      }

      if (!assetDropdownRef.current.contains(event.target as Node)) {
        closeAssetMenu();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, []);

  useEffect(() => {
    loadCurrenciesPage().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (currenciesLoading || currenciesLoadingMore || !currenciesHasMore || baseCurrencyCount <= 0) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      loadMoreCurrencies().catch(() => undefined);
    }, BACKGROUND_SYNC_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [baseCurrencyCount, currenciesHasMore, currenciesLoading, currenciesLoadingMore]);

  useEffect(() => {
    const defaultSymbol = buildSymbolOptions(currencies)[0]?.value;

    if (!selectedSymbol && defaultSymbol) {
      setSelectedSymbol(defaultSymbol);
      return;
    }

    const symbolExists = currencies.some((currency) => currency.symbol === selectedSymbol);
    if (!symbolExists) {
      setSelectedSymbol(defaultSymbol || '');
    }
  }, [currencies, selectedSymbol]);

  useEffect(() => {
    const currentNetworks = currencies.filter((currency) => currency.symbol === selectedSymbol);
    const networkExists = currentNetworks.some((currency) => currency.network === selectedNetwork);

    if (!networkExists) {
      const defaultNetwork = currentNetworks.find((currency) => currency.isDefaultNetwork)?.network
        || currentNetworks[0]?.network
        || '';
      setSelectedNetwork(defaultNetwork);
    }
  }, [currencies, selectedNetwork, selectedSymbol]);

  useEffect(() => {
    setQuote(null);
    setTransaction(null);
    setTransactionStatus('');
    setActionError('');
  }, [mode, selectedSymbol, selectedNetwork, sendAmount, targetReefAmount]);

  useEffect(() => {
    if (!transaction?.transaction_id) {
      return undefined;
    }

    const status = (transactionStatus || transaction.status).toLowerCase();
    if (FINAL_TRANSACTION_STATUSES.includes(status)) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      refreshTransaction(true).catch(() => undefined);
    }, 15000);

    return () => {
      window.clearInterval(interval);
    };
  }, [transaction?.transaction_id, transaction?.status, transactionStatus]);

  useEffect(() => {
    if (!assetMenuOpen) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      assetSearchInputRef.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [assetMenuOpen]);

  const summarySendAmount = mode === 'from'
    ? formatTokenDisplay(sendAmount, selectedSymbol, 8)
    : formatTokenDisplay(quote?.amount, selectedSymbol, 8);
  const summaryReceiveAmount = mode === 'from'
    ? formatTokenDisplay(quote?.amount, 'REEF', 8)
    : formatTokenDisplay(targetReefAmount, 'REEF', 8);
  const rateDisplay = formatRateDisplay(quote?.rate, selectedSymbol);
  const minRangeAmount = formatTokenDisplay(quote?.min_amount || quote?.deposit_min_amount, selectedSymbol, 8);
  const maxRangeAmount = formatTokenDisplay(quote?.max_amount || quote?.deposit_max_amount, selectedSymbol, 8);
  const withdrawalFeeAmount = formatTokenDisplay(quote?.withdrawal_fee || '0', 'REEF', 8);
  const depositAmount = formatTokenDisplay(transaction?.deposit_amount, transaction?.coin_from, 8);
  const expectedOutputAmount = formatTokenDisplay(transaction?.withdrawal_amount, 'REEF', 8);
  const transactionBadge = transactionStatus || transaction?.status || 'pending';

  return (
    <div className="letsexchange-container">
      <div>
        <Hero
          title="Swap to Reef"
          subtitle="Swap any supported token to REEF through a native LetsExchange flow."
          isLoading={signer == undefined}
          imageAlt="Reef x LetsExchange banner"
        />

        <div className="letsexchange-widget-wrapper letsexchange-widget-wrapper--custom">
          <div className="letsexchange-page-intro">
            <div>
              <span className="letsexchange-chip">LetsExchange</span>
              <h2 className="letsexchange-title">Swap any supported asset into REEF</h2>
              <p className="letsexchange-subtitle">
                Choose a supported source asset, fetch a live quote from the Reefscan API,
                then create the swap and follow the deposit instructions here in-app.
              </p>
            </div>
          </div>

          <div className="letsexchange-layout">
            <div className="letsexchange-form-card">
              <div className="letsexchange-mode-toggle">
                <button
                  type="button"
                  className={`letsexchange-mode-toggle__button ${mode === 'from' ? 'is-active' : ''}`}
                  onClick={() => setMode('from')}
                >
                  Quote from source amount
                </button>
                <button
                  type="button"
                  className={`letsexchange-mode-toggle__button ${mode === 'to' ? 'is-active' : ''}`}
                  onClick={() => setMode('to')}
                >
                  Target exact REEF
                </button>
              </div>

              {quickAssetOptions.length > 0 && (
                <div className="letsexchange-option-group">
                  <div className="letsexchange-option-group__header">
                    <span className="letsexchange-label">Popular options</span>
                    <span className="letsexchange-option-group__caption">Quick-pick a common source asset.</span>
                  </div>
                  <div className="letsexchange-option-row">
                    {quickAssetOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`letsexchange-option-chip ${selectedSymbol === option.value ? 'is-active' : ''}`}
                        onClick={() => selectSourceSymbol(option.value)}
                      >
                        {option.icon ? (
                          <img className="letsexchange-option-chip__icon" src={option.icon} alt="" />
                        ) : (
                          <span className="letsexchange-option-chip__badge">{option.value.slice(0, 4)}</span>
                        )}
                        <span className="letsexchange-option-chip__text">
                          <strong>{option.value}</strong>
                          <small>{option.name}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="letsexchange-grid">
                <div className="letsexchange-field">
                  <label className="letsexchange-label" htmlFor="letsexchange-symbol">
                    Source asset
                  </label>
                  <p className="letsexchange-field-caption">
                    Choose the token you want to convert into REEF.
                  </p>
                  <div
                    ref={assetDropdownRef}
                    className={`letsexchange-select-shell letsexchange-select-shell--asset ${assetMenuOpen ? 'is-open' : ''}`}
                  >
                    <button
                      id="letsexchange-symbol"
                      type="button"
                      className={`letsexchange-select-trigger ${isInitialCurrenciesLoading ? 'is-loading' : ''}`}
                      aria-haspopup="listbox"
                      aria-expanded={assetMenuOpen}
                      onClick={() => {
                        if (assetMenuOpen) {
                          closeAssetMenu();
                        } else {
                          setAssetMenuOpen(true);
                        }
                      }}
                      disabled={isInitialCurrenciesLoading || baseSymbolOptions.length === 0}
                    >
                      <span className="letsexchange-select-leading" aria-hidden="true">
                        {isInitialCurrenciesLoading ? (
                          <span className="letsexchange-select-loader">
                            <Uik.Loading size="small" />
                          </span>
                        ) : selectedSymbolOption?.icon ? (
                          <img
                            className="letsexchange-select-icon"
                            src={selectedSymbolOption.icon}
                            alt=""
                          />
                        ) : (
                          <span className="letsexchange-select-badge">
                            {(selectedSymbol || 'ASSET').slice(0, 4)}
                          </span>
                        )}
                      </span>
                      <span className="letsexchange-select-trigger__text">
                        <strong>{isInitialCurrenciesLoading ? 'Loading assets...' : selectedSymbolOption?.value || 'Select asset'}</strong>
                        <small>
                          {isInitialCurrenciesLoading
                            ? 'Fetching supported currencies from LetsExchange'
                            : selectedSymbolOption?.name || 'Choose a source asset'}
                        </small>
                      </span>
                    </button>
                    {assetMenuOpen && (
                      <div
                        className="letsexchange-asset-menu"
                        role="listbox"
                        aria-labelledby="letsexchange-symbol"
                        onScroll={(event) => {
                          const menu = event.currentTarget;
                          const reachedMenuEnd = menu.scrollTop + menu.clientHeight >= menu.scrollHeight - 72;

                          if (reachedMenuEnd) {
                            loadMoreCurrencies().catch(() => undefined);
                          }
                        }}
                      >
                        <div className="letsexchange-asset-menu__search">
                          <input
                            ref={assetSearchInputRef}
                            className="letsexchange-asset-menu__search-input"
                            type="search"
                            value={assetSearch}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => setAssetSearch(event.target.value)}
                            placeholder="Search BTC, ETH, USDT, SOL..."
                          />
                        </div>

                        {assetMenuOptions.length === 0 && (
                          <p className="letsexchange-asset-menu__empty">
                            {deferredAssetSearch
                              ? `No assets found for "${deferredAssetSearch}".`
                              : 'No source assets available right now.'}
                          </p>
                        )}

                        {assetMenuOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            role="option"
                            aria-selected={selectedSymbol === option.value}
                            className={`letsexchange-asset-option ${selectedSymbol === option.value ? 'is-active' : ''}`}
                            onClick={() => selectSourceSymbol(option.value)}
                          >
                            {option.icon ? (
                              <img className="letsexchange-asset-option__icon" src={option.icon} alt="" />
                            ) : (
                              <span className="letsexchange-asset-option__badge">{option.value.slice(0, 4)}</span>
                            )}
                            <span className="letsexchange-asset-option__text">
                              <strong>{option.value}</strong>
                              <small>{option.name}</small>
                            </span>
                          </button>
                        ))}

                        {(currenciesLoadingMore || currenciesHasMore || assetMenuOptions.length > 0) && (
                          <div className="letsexchange-asset-menu__footer">
                            <span className="letsexchange-asset-menu__footer-label">
                              {currenciesLoadingMore
                                ? deferredAssetSearch
                                  ? `${assetMenuOptions.length} matches loaded while syncing more assets...`
                                  : `Loading full asset list... ${baseSymbolOptions.length} loaded`
                                : deferredAssetSearch
                                  ? `${assetMenuOptions.length} matching assets`
                                  : currenciesHasMore
                                    ? `${baseSymbolOptions.length} loaded so far`
                                    : `All ${baseSymbolOptions.length} assets loaded`}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {isInitialCurrenciesLoading && (
                    <p className="letsexchange-hint letsexchange-hint--info">
                      Loading supported source assets...
                    </p>
                  )}
                </div>

                <div className="letsexchange-field">
                  <label className="letsexchange-label" htmlFor="letsexchange-network">
                    Source network
                  </label>
                  <p className="letsexchange-field-caption">
                    Use the exact chain you will send the deposit from.
                  </p>
                  <div className="letsexchange-select-shell letsexchange-select-shell--network">
                    <div className="letsexchange-select-leading" aria-hidden="true">
                      <span className="letsexchange-select-badge letsexchange-select-badge--network">
                        {(selectedNetwork || 'NET').slice(0, 6)}
                      </span>
                    </div>
                    <select
                      id="letsexchange-network"
                      className="letsexchange-select"
                      value={selectedNetwork}
                      onChange={(event) => setSelectedNetwork(event.target.value)}
                      disabled={currenciesLoading || networkOptions.length === 0}
                    >
                      {networkOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <label className="letsexchange-label" htmlFor="letsexchange-amount">
                {mode === 'from'
                  ? `Amount to send in ${selectedSymbol || 'source asset'}`
                  : 'Desired REEF amount'}
              </label>
              <input
                id="letsexchange-amount"
                className={`letsexchange-input ${amountValidationMessage ? 'letsexchange-input--invalid' : ''}`}
                type="number"
                min="0"
                step="any"
                value={mode === 'from' ? sendAmount : targetReefAmount}
                aria-invalid={Boolean(amountValidationMessage)}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  if (mode === 'from') {
                    setSendAmount(event.target.value);
                  } else {
                    setTargetReefAmount(event.target.value);
                  }
                }}
                placeholder={mode === 'from' ? DEFAULT_SEND_AMOUNT : DEFAULT_REEF_AMOUNT}
              />
              {amountValidationMessage && (
                <p className="letsexchange-hint letsexchange-hint--error">
                  {amountValidationMessage}
                </p>
              )}
              {!amountValidationMessage && amountGuidanceMessage && (
                <p className="letsexchange-hint letsexchange-hint--info">
                  {amountGuidanceMessage}
                </p>
              )}

              <label className="letsexchange-label" htmlFor="letsexchange-address">
                REEF destination address
              </label>
              <div className="letsexchange-address-row">
                <input
                  id="letsexchange-address"
                  className="letsexchange-input"
                  value={withdrawalAddress}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setWithdrawalAddress(event.target.value)}
                  placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
                />
                {signer?.address && (
                  <button
                    type="button"
                    className="letsexchange-inline-button"
                    onClick={() => setWithdrawalAddress(signer.address)}
                  >
                    Use wallet
                  </button>
                )}
              </div>
              <p className="letsexchange-hint">
                Use a native Reef address that starts with <strong>5</strong>.
              </p>

              {currenciesError && (
                <div className="letsexchange-message letsexchange-message--error">
                  {currenciesError}
                </div>
              )}

              {selectedCurrency?.additionalInfoSend && (
                <div className="letsexchange-message letsexchange-message--info">
                  {selectedCurrency.additionalInfoSend}
                </div>
              )}

              {actionError && (
                <div className="letsexchange-message letsexchange-message--error">
                  {actionError}
                </div>
              )}

              <div className="letsexchange-actions">
                <Uik.Button
                  text={quoteLoading ? 'Fetching quote...' : 'Get quote'}
                  fill
                  disabled={!canQuote || quoteLoading}
                  onClick={onQuote}
                />
                <Uik.Button
                  text={createLoading ? 'Creating swap...' : 'Create swap'}
                  disabled={!canCreateSwap || createLoading}
                  onClick={onCreate}
                />
              </div>
            </div>

            <div className="letsexchange-summary-card">
              <div className="letsexchange-summary-card__header">
                <div>
                  <span className="letsexchange-chip letsexchange-chip--light">REEF destination</span>
                  <h3>Swap summary</h3>
                </div>
                {currenciesLoading && <Uik.Loading size="small" />}
              </div>

              {!quote && (
                <div className="letsexchange-empty-state">
                  <p>
                    Pick a source asset, enter an amount, and fetch a quote to see the
                    expected REEF output and the allowed swap range.
                  </p>
                </div>
              )}

              {quote && (
                <div className="letsexchange-summary-block">
                  <div className="letsexchange-stat-grid">
                    <div className="letsexchange-stat-card">
                      <span>You send</span>
                      <strong>{summarySendAmount.primary}</strong>
                      {summarySendAmount.secondary && (
                        <small>{summarySendAmount.secondary}</small>
                      )}
                    </div>
                    <div className="letsexchange-stat-card">
                      <span>You receive</span>
                      <strong>{summaryReceiveAmount.primary}</strong>
                      {summaryReceiveAmount.secondary && (
                        <small>{summaryReceiveAmount.secondary}</small>
                      )}
                    </div>
                    <div className="letsexchange-stat-card">
                      <span>Rate</span>
                      <strong>{rateDisplay.primary}</strong>
                      {rateDisplay.secondary && (
                        <small>{rateDisplay.secondary}</small>
                      )}
                    </div>
                    <div className="letsexchange-stat-card">
                      <span>Allowed range</span>
                      <div className="letsexchange-range-values">
                        <div>
                          <small>Min</small>
                          <strong>{minRangeAmount.primary}</strong>
                        </div>
                        <div>
                          <small>Max</small>
                          <strong>{maxRangeAmount.primary}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="letsexchange-detail-list">
                    <div>
                      <span>Destination</span>
                      <strong>REEF on Reef</strong>
                    </div>
                    <div>
                      <span>Withdrawal fee</span>
                      <strong>{withdrawalFeeAmount.primary}</strong>
                      {withdrawalFeeAmount.secondary && (
                        <small>{withdrawalFeeAmount.secondary}</small>
                      )}
                    </div>
                    {quote.rate_id && (
                      <div>
                        <span>Rate ID</span>
                        <strong className="letsexchange-monospace">{quote.rate_id}</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {transaction && (
                <div className="letsexchange-transaction-card">
                  <div className="letsexchange-transaction-card__header">
                    <div>
                      <span className="letsexchange-chip letsexchange-chip--light">Swap created</span>
                      <h3>Deposit instructions</h3>
                    </div>
                    <span className={`letsexchange-status-badge status-${transactionBadge.toLowerCase()}`}>
                      {transactionBadge}
                    </span>
                  </div>

                  <p className="letsexchange-transaction-note">
                    Send only
                    {' '}
                    <strong>{transaction.coin_from}</strong>
                    {' '}
                    on
                    {' '}
                    <strong>{transaction.coin_from_network}</strong>
                    {' '}
                    to the deposit details below.
                  </p>

                  <div className="letsexchange-instruction-card">
                    <span>Send this amount</span>
                    <strong>{depositAmount.primary}</strong>
                    {depositAmount.secondary && (
                      <small>{depositAmount.secondary}</small>
                    )}
                  </div>

                  <div className="letsexchange-instruction-card">
                    <span>Deposit address</span>
                    <div className="letsexchange-copy-row">
                      <strong className="letsexchange-monospace">{transaction.deposit}</strong>
                      <button
                        type="button"
                        className="letsexchange-inline-button"
                        onClick={() => copyToClipboard(transaction.deposit, 'Deposit address copied')}
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {transaction.deposit_extra_id && (
                    <div className="letsexchange-instruction-card">
                      <span>Deposit extra ID</span>
                      <div className="letsexchange-copy-row">
                        <strong className="letsexchange-monospace">{transaction.deposit_extra_id}</strong>
                        <button
                          type="button"
                          className="letsexchange-inline-button"
                          onClick={() => copyToClipboard(transaction.deposit_extra_id || '', 'Deposit extra ID copied')}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="letsexchange-detail-list letsexchange-detail-list--transaction">
                    <div>
                      <span>Expected output</span>
                      <strong>{expectedOutputAmount.primary}</strong>
                      {expectedOutputAmount.secondary && (
                        <small>{expectedOutputAmount.secondary}</small>
                      )}
                    </div>
                    <div>
                      <span>Transaction ID</span>
                      <strong className="letsexchange-monospace">{transaction.transaction_id}</strong>
                    </div>
                  </div>

                  <div className="letsexchange-actions letsexchange-actions--secondary">
                    <Uik.Button
                      text={refreshLoading ? 'Refreshing...' : 'Refresh status'}
                      disabled={refreshLoading}
                      onClick={() => refreshTransaction(false)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LetsExchange;

function parsePositiveNumber(value: string | number | undefined | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

function isValidReefAddress(value: string): boolean {
  return /^5[0-9A-Za-z]{47}$/.test(value.trim());
}

function formatExactTokenAmount(
  value: string | number | undefined | null,
  symbol: string | undefined,
  maximumFractionDigits = 8,
): string {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  return `${formatNumeric(value, maximumFractionDigits)} ${symbol || ''}`.trim();
}

function formatNumeric(value: string | number | undefined | null, maximumFractionDigits = 6): string {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return String(value);
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits,
  }).format(parsed);
}

function formatCompactNumeric(value: number, maximumFractionDigits = 2): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits,
  }).format(value);
}

function formatTokenDisplay(
  value: string | number | undefined | null,
  symbol: string | undefined,
  maximumFractionDigits = 6,
): { primary: string; secondary?: string } {
  if (value === undefined || value === null || value === '') {
    return { primary: '-' };
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return { primary: [String(value), symbol].filter(Boolean).join(' ').trim() };
  }

  const shouldCompact = Math.abs(parsed) >= 100000;
  const primary = `${shouldCompact ? formatCompactNumeric(parsed, 2) : formatNumeric(parsed, maximumFractionDigits)} ${symbol || ''}`.trim();
  const secondary = shouldCompact
    ? `${formatNumeric(parsed, maximumFractionDigits)} ${symbol || ''}`.trim()
    : undefined;

  return { primary, secondary };
}

function formatRateDisplay(
  value: string | number | undefined | null,
  symbol: string | undefined,
): { primary: string; secondary?: string } {
  if (value === undefined || value === null || value === '' || !symbol) {
    return { primary: '-' };
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return { primary: String(value), secondary: `per 1 ${symbol}` };
  }

  const shouldCompact = Math.abs(parsed) >= 100000;
  return {
    primary: `${shouldCompact ? formatCompactNumeric(parsed, 2) : formatNumeric(parsed, 6)} REEF`,
    secondary: `per 1 ${symbol}`,
  };
}

function getAmountValidationMessage({
  activeAmount,
  mode,
  quote,
  sourceAmount,
  symbol,
}: {
  activeAmount: string;
  mode: 'from' | 'to';
  quote: LetsExchangeQuote | null;
  sourceAmount: number | undefined;
  symbol: string;
}): string {
  if (!activeAmount) {
    return '';
  }

  if (!parsePositiveNumber(activeAmount)) {
    return 'Enter an amount greater than 0.';
  }

  if (!quote || !symbol) {
    return '';
  }

  const minAmount = parsePositiveNumber(quote.min_amount || quote.deposit_min_amount);
  const maxAmount = parsePositiveNumber(quote.max_amount || quote.deposit_max_amount);

  if (!sourceAmount) {
    return mode === 'from'
      ? `LetsExchange could not return a valid quote for this ${symbol} amount. Try a larger amount or another asset/network.`
      : `Requested REEF amount is too low for ${symbol}. Increase the REEF amount to meet the source-side minimum.`;
  }

  if (minAmount && sourceAmount < minAmount) {
    return mode === 'from'
      ? `Minimum purchase is ${formatExactTokenAmount(minAmount, symbol)}.`
      : `Requested REEF amount is too low. LetsExchange needs at least ${formatExactTokenAmount(minAmount, symbol)} on the source side.`;
  }

  if (maxAmount && sourceAmount > maxAmount) {
    return mode === 'from'
      ? `Maximum supported amount is ${formatExactTokenAmount(maxAmount, symbol)}.`
      : `Requested REEF amount is too high. LetsExchange allows up to ${formatExactTokenAmount(maxAmount, symbol)} on the source side.`;
  }

  return '';
}

function getAmountGuidanceMessage({
  mode,
  quote,
  symbol,
}: {
  mode: 'from' | 'to';
  quote: LetsExchangeQuote | null;
  symbol: string;
}): string {
  if (!quote || !symbol) {
    return '';
  }

  const minAmount = parsePositiveNumber(quote.min_amount || quote.deposit_min_amount);
  const maxAmount = parsePositiveNumber(quote.max_amount || quote.deposit_max_amount);
  const parts: string[] = [];

  if (mode === 'to') {
    const sourceAmount = parsePositiveNumber(quote.amount);
    if (sourceAmount) {
      parts.push(`This quote currently needs about ${formatExactTokenAmount(sourceAmount, symbol)}.`);
    }
  }

  if (minAmount && maxAmount) {
    parts.push(`Allowed ${symbol} range: ${formatExactTokenAmount(minAmount, symbol)} to ${formatExactTokenAmount(maxAmount, symbol)}.`);
  } else if (minAmount) {
    parts.push(`Minimum purchase: ${formatExactTokenAmount(minAmount, symbol)}.`);
  } else if (maxAmount) {
    parts.push(`Maximum supported amount: ${formatExactTokenAmount(maxAmount, symbol)}.`);
  }

  return parts.join(' ');
}

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

async function copyToClipboard(value: string, successMessage: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(value);
    Uik.notify.success(successMessage);
  } catch (error) {
    Uik.notify.danger(getErrorMessage(error, 'Failed to copy value'));
  }
}

function buildSymbolOptions(currencies: LetsExchangeCurrency[]): Array<{
  value: string;
  label: string;
  name: string;
  icon?: string;
}> {
  const seenSymbols = new Set<string>();

  return currencies.reduce((options, currency) => {
    if (seenSymbols.has(currency.symbol)) {
      return options;
    }

    seenSymbols.add(currency.symbol);
    options.push({
      value: currency.symbol,
      label: `${currency.symbol} - ${currency.name || currency.symbol}`,
      name: currency.name || currency.symbol,
      icon: currency.icon,
    });

    return options;
  }, [] as Array<{ value: string; label: string; name: string; icon?: string }>);
}

function filterSymbolOptions(
  options: Array<{ value: string; label: string; name: string; icon?: string }>,
  search: string,
): Array<{ value: string; label: string; name: string; icon?: string }> {
  if (!search) {
    return options;
  }

  const normalizedSearch = search.trim().toLowerCase();
  if (!normalizedSearch) {
    return options;
  }

  return [...options]
    .filter((option) => {
      const searchableFields = [
        option.value,
        option.name,
        option.label,
      ];

      return searchableFields.some((field) => field.toLowerCase().includes(normalizedSearch));
    })
    .sort((left, right) => {
      const leftSymbol = left.value.toLowerCase();
      const rightSymbol = right.value.toLowerCase();
      const leftName = left.name.toLowerCase();
      const rightName = right.name.toLowerCase();

      const getRank = (symbol: string, name: string): number => {
        if (symbol === normalizedSearch) {
          return 0;
        }
        if (symbol.startsWith(normalizedSearch)) {
          return 1;
        }
        if (name.startsWith(normalizedSearch)) {
          return 2;
        }
        if (name.includes(normalizedSearch)) {
          return 3;
        }
        return 4;
      };

      return getRank(leftSymbol, leftName) - getRank(rightSymbol, rightName)
        || left.value.localeCompare(right.value);
    });
}

function mergeCurrencies(
  currentCurrencies: LetsExchangeCurrency[],
  incomingCurrencies: LetsExchangeCurrency[],
): LetsExchangeCurrency[] {
  if (incomingCurrencies.length === 0) {
    return currentCurrencies;
  }

  const seenCurrencies = new Set(currentCurrencies.map((currency) => `${currency.symbol}:${currency.network}`));
  const mergedCurrencies = [...currentCurrencies];

  incomingCurrencies.forEach((currency) => {
    const currencyKey = `${currency.symbol}:${currency.network}`;

    if (seenCurrencies.has(currencyKey)) {
      return;
    }

    seenCurrencies.add(currencyKey);
    mergedCurrencies.push(currency);
  });

  return mergedCurrencies;
}
