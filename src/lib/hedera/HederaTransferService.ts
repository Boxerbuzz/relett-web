
import {
  TransferTransaction,
  Hbar,
  HbarUnit,
  AccountId,
  PrivateKey
} from "@hashgraph/sdk";
import { HederaClientCore } from './HederaClientCore';

export class HederaTransferService extends HederaClientCore {
  async transferHbar(params: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    fromPrivateKey: string;
  }) {
    if (this.isMockMode()) {
      console.log('Mock mode: HBAR transfer simulated');
      return {
        transactionId: `mock_tx_${Date.now()}`,
        status: 'SUCCESS',
      };
    }

    try {
      const fromAccount = AccountId.fromString(params.fromAccountId);
      const toAccount = AccountId.fromString(params.toAccountId);
      const fromKey = PrivateKey.fromStringECDSA(params.fromPrivateKey);

      const transaction = new TransferTransaction()
        .addHbarTransfer(fromAccount, Hbar.from(-params.amount, HbarUnit.Hbar))
        .addHbarTransfer(toAccount, Hbar.from(params.amount, HbarUnit.Hbar))
        .freezeWith(this.client);

      const signedTx = await transaction.sign(fromKey);
      const response = await signedTx.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      return {
        transactionId: response.transactionId.toString(),
        status: receipt.status.toString(),
      };
    } catch (error) {
      console.error("Error transferring HBAR:", error);
      throw error;
    }
  }
}
