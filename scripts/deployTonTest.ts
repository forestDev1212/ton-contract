import { toNano } from '@ton/core';
import { TonTest } from '../wrappers/TonTest';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const tonTest = provider.open(TonTest.createFromConfig({}, await compile('TonTest')));

    await tonTest.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(tonTest.address);

    // run methods on `tonTest`
}
