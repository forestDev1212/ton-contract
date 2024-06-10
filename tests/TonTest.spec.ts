import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { TonTest } from '../wrappers/TonTest';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('TonTest', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('TonTest');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let tonTest: SandboxContract<TonTest>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        tonTest = blockchain.openContract(TonTest.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await tonTest.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: tonTest.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and tonTest are ready to use
    });
});
