import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type TonTestConfig = {};

export function tonTestConfigToCell(config: TonTestConfig): Cell {
    return beginCell().endCell();
}

export class TonTest implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new TonTest(address);
    }

    static createFromConfig(config: TonTestConfig, code: Cell, workchain = 0) {
        const data = tonTestConfigToCell(config);
        const init = { code, data };
        return new TonTest(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
