import {
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE,
} from "@stellar/stellar-sdk";
import {
  isConnected,
  requestAccess,
  getAddress,
  getNetwork,
  signTransaction,
} from "@stellar/freighter-api";

// --- Network config (Testnet only, per Level 1 requirements) ---
export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const NETWORK_PASSPHRASE = Networks.TESTNET;

const server = new Horizon.Server(HORIZON_URL);

/**
 * Checks whether the Freighter browser extension is installed & unlocked.
 */
export async function checkFreighterInstalled() {
  const result = await isConnected();
  if (result.error) throw new Error(result.error);
  return result.isConnected;
}

/**
 * Requests the user to connect their Freighter wallet and returns the
 * public address. Also verifies the wallet is set to Testnet.
 */
export async function connectWallet() {
  const access = await requestAccess();
  if (access.error) throw new Error(access.error);

  const network = await getNetwork();
  if (network.error) throw new Error(network.error);

  if (network.network !== "TESTNET") {
    throw new Error(
      `Freighter is set to ${network.network}. Please switch it to Testnet and try again.`
    );
  }

  return access.address;
}

/**
 * Re-reads the currently authorized address (used on page reload if the
 * app previously connected and the user hasn't revoked access).
 */
export async function getConnectedAddress() {
  const result = await getAddress();
  if (result.error) throw new Error(result.error);
  return result.address || null;
}

/**
 * Fetches the native XLM balance for a public key from Horizon testnet.
 * Returns null if the account doesn't exist yet (unfunded).
 */
export async function fetchXlmBalance(publicKey) {
  try {
    const account = await server.loadAccount(publicKey);
    const native = account.balances.find((b) => b.asset_type === "native");
    return native ? native.balance : "0";
  } catch (err) {
    if (err?.response?.status === 404) {
      return null; // account not funded on testnet yet
    }
    throw err;
  }
}

/**
 * Builds, signs (via Freighter), and submits a native XLM payment.
 * Returns the Horizon submission result (includes the tx hash).
 */
export async function sendPayment({ sourceAddress, destination, amount }) {
  const sourceAccount = await server.loadAccount(sourceAddress);

  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.payment({
        destination,
        asset: Asset.native(),
        amount: String(amount),
      })
    )
    .setTimeout(60)
    .build();

  const signed = await signTransaction(transaction.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
    address: sourceAddress,
  });
  if (signed.error) throw new Error(signed.error);

  const signedTx = TransactionBuilder.fromXDR(
    signed.signedTxXdr,
    NETWORK_PASSPHRASE
  );

  const result = await server.submitTransaction(signedTx);
  return result;
}

/** Shortens a public key / hash for compact display: GABC...WXYZ */
export function shorten(value, front = 6, back = 6) {
  if (!value) return "";
  if (value.length <= front + back) return value;
  return `${value.slice(0, front)}…${value.slice(-back)}`;
}
