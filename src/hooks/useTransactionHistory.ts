import { TokenTransfer } from '@reef-defi/react-lib';
import { reefState } from '@reef-chain/util-lib';
import { useObservableState } from './useObservableState';

type UseTxHistory = TokenTransfer[];
export const UseTxHistory = (): UseTxHistory => {
  const txHistory:any = useObservableState(reefState.selectedTransactionHistory_status$);
  let txHistoryData;
  if (txHistory && txHistory._status[0].code == 6) {
    txHistoryData = txHistory.data;
  }

  return txHistoryData;
};
