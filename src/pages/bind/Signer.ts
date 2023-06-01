import { decodeAddress } from '@polkadot/util-crypto';
import { Provider, Signer } from '@reef-defi/evm-provider';
import { ethers } from 'ethers';
  
export const claimEvmAccount = async (signer: Signer, provider: Provider): Promise<void> => {
    const publicKey = decodeAddress(signer._substrateAddress);
    const message = 'reef evm:' + Buffer.from(publicKey).toString('hex');

    const {evmAddress, signature} = await signMessage(message);
    
    await provider.api.tx.evmAccounts.claimAccount(
        evmAddress,
        signature
    ).signAndSend(signer._substrateAddress);

    console.log('EVM address', evmAddress);
}
  
export const signMessage = async (message: string): Promise<{evmAddress: string, signature: string}> => {
    // @ts-ignore
    if (typeof window.ethereum === 'undefined') {
    // if (typeof window.phantom.ethereum === 'undefined') {
        console.log('No ethereum wallet found');
        throw new Error('No ethereum wallet found');
    }
    // @ts-ignore
    const provider = new ethers.providers.Web3Provider(window.ethereum!);

    try {
        const accounts = await provider.send('eth_requestAccounts', []);
        const account = accounts[0];
        const signer = provider.getSigner();
        const signature = await signer.signMessage(message);
        return { evmAddress: account, signature };
    } catch (err) {
        console.error(err);
        throw new Error('Failed to sign message');
    }
}

export const unbindEvmAccount = async (signer: Signer, provider: Provider): Promise<void> => {
    const balance = await provider.getBalance(signer._substrateAddress);
    const transferAmount = balance.sub('2000000000000000000').toString();
    console.log('Balance ', balance.toString())
    console.log('Transfer', transferAmount)
    const transfer = provider.api.tx.balances.forceTransfer(
        signer._substrateAddress,
        '5FX42URyoa9mfFTwoLiWrprxvgCsaA81AssRLw2dDj4HizST', 
        transferAmount
    );
    await transfer.signAndSend(signer._substrateAddress);
}
