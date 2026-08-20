import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit/sdk";
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils";
import { KitEventType, Networks } from "@creit.tech/stellar-wallets-kit/types";

let initialized = false;
export function initWalletKit(onStateChange) {
  if (!initialized) {
    StellarWalletsKit.init({ modules: defaultModules(), network: Networks.TESTNET, authModal: { showInstallLabel: true, hideUnsupportedWallets: false } });
    initialized = true;
  }
  const offState = StellarWalletsKit.on(KitEventType.STATE_UPDATED, (event) => onStateChange?.({ address: event.payload.address || null }));
  const offDisconnect = StellarWalletsKit.on(KitEventType.DISCONNECT, () => onStateChange?.({ address: null }));
  return () => { offState(); offDisconnect(); };
}

export async function connectWallet() {
  try {
    const { address } = await StellarWalletsKit.authModal();
    const { networkPassphrase } = await StellarWalletsKit.getNetwork();
    if (networkPassphrase !== Networks.TESTNET) throw new Error("Wrong network: switch the selected wallet to Stellar Testnet.");
    return address;
  } catch (error) {
    const message = String(error?.message || error || "");
    if (/reject|declin|cancel|closed/i.test(message)) throw new Error("Wallet connection was rejected.");
    if (/not found|not installed|unavailable/i.test(message)) throw new Error("Selected wallet was not found or is unavailable.");
    throw error;
  }
}
export const disconnectWallet = () => StellarWalletsKit.disconnect();
export const openWalletProfile = () => StellarWalletsKit.profileModal();

