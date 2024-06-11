import dotenv from 'dotenv'

dotenv.config({ path: "../../.env" })

import * as fs from 'fs';
import { getHttpEndpoint } from '@orbs-network/ton-access';
import { mnemonicToWalletKey } from 'ton-crypto';
import { TonClient, Cell, WalletContractV4, WalletContractV1R1 } from '@ton/ton';
import Counter from '../wrappers/Counter';
import { sleep } from '@ton/blueprint';

export async function run() {
  const endpoint = await getHttpEndpoint({ network: "testnet" });
  const client = new TonClient({ endpoint });

  const counterCode = Cell.fromBoc(fs.readFileSync("build/counter.cell"))[0];
  const initialCounterValue = Date.now();
  const counter = Counter.createForDeploy(counterCode, initialCounterValue);

  console.log("contract address : ", counter.address.toString());

  if (await client.isContractDeployed(counter.address)) {
    return console.log("Counter already deployed.");
  }

  const mnemonic = process.env.MNEMONIC;
  if (!mnemonic) {
    throw new Error("Mnemonic is undefined. Please ")
  }
  const key = await mnemonicToWalletKey(mnemonic.split(" "));
  const wallet = WalletContractV4.create({
    publicKey: key.publicKey,
    workchain: 0,
  });
  if (!await client.isContractDeployed(wallet.address)) {
    return console.log("Wallet is not deployed.");
  }

  const walletContract = client.open(wallet)
  const walletSender = walletContract.sender(key.secretKey);
  const seqno = await walletContract.getSeqno();

  const counterContract = client.open(counter);
  await counterContract.sendDeploy(walletSender);

  let currentSeqno = seqno;

  while (currentSeqno == seqno) {
    console.log("waiting for deploy transaction to confirm....");
    await sleep(1500);
    currentSeqno = await walletContract.getSeqno();
  }

  console.log("deploy transaction confirmed!");

  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}