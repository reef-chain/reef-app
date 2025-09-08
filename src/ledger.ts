// Copyright 2017-2021 @polkadot/react-signer authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Ledger } from '@reef-defi/hw-ledger';
import type { LedgerTypes } from '@reef-defi/hw-ledger/types';
import uiSettings from '@polkadot/ui-settings';
import type { Signer, SignerResult } from '@polkadot/api/types';
import type { Registry, SignerPayloadJSON } from '@polkadot/types/types';

let ledger: Ledger | null = null;
let ledgerType: LedgerTypes | null = null;

const knownLedger = {
    'reef-mainnet': 0x00000333,
    'reef-testnet': 0x00000333
};

const knownGenesis = {
    'reef-mainnet': [
        '0x7834781d38e4798d548e34ec947d19deea29df148a7bf32484b7b24dacf8d4b7'
    ],
    'reef-testnet': [
        '0x0f89efd7bf650f2d521afef7456ed98dff138f54b5b7915cc9bce437ab728660'
    ]
};

const ledgerChains = Object.keys(knownGenesis).filter((n) => knownLedger[n]);

export function retrieveLedger(api: any): Ledger {
    const currType = uiSettings.ledgerConn as LedgerTypes;

    if (!ledger || ledgerType !== currType) {
        const genesisHex = api.genesisHash.toHex();
        const network = ledgerChains.find((network) => knownGenesis[network].includes(genesisHex));

        // assert(network, `Unable to find a known Ledger config for genesisHash ${genesisHex}`);

        ledger = new Ledger(currType, network);
        ledgerType = currType;
    }

    console.log("ledger===",ledger.getAddress(false,0,0))

    return ledger;
}

let id = 0;

export class LedgerSigner implements Signer {
  readonly #accountOffset: number;
  readonly #addressOffset: number;
  readonly #getLedger: () => Ledger;
  readonly #registry: Registry;

  constructor (registry: Registry, getLedger: () => Ledger, accountOffset: number, addressOffset: number) {
    this.#accountOffset = accountOffset;
    this.#addressOffset = addressOffset;
    this.#getLedger = getLedger;
    this.#registry = registry;
  }

  public async signPayload (payload: SignerPayloadJSON): Promise<SignerResult> {
    const raw = this.#registry.createType('ExtrinsicPayload', payload, { version: payload.version });
    const { signature } = await this.#getLedger().sign(raw.toU8a(true), this.#accountOffset, this.#addressOffset);

    return { id: ++id, signature };
  }
}
