import { useCallback, useEffect, useState } from "react";
import StatusBar from "./components/StatusBar";
import BalancePanel from "./components/BalancePanel";
import PaymentForm from "./components/PaymentForm";
import TxResult from "./components/TxResult";
import {
  checkFreighterInstalled,
  connectWallet,
  fetchXlmBalance,
  sendPayment,
} from "./lib/stellar";
import "./App.css";

export default function App() {
  const [address, setAddress] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [freighterMissing, setFreighterMissing] = useState(false);

  const [balance, setBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [unfunded, setUnfunded] = useState(false);

  const [sending, setSending] = useState(false);
  const [txResult, setTxResult] = useState(null);
  const [globalError, setGlobalError] = useState(null);

  const refreshBalance = useCallback(async (pubKey) => {
    if (!pubKey) return;
    setBalanceLoading(true);
    try {
      const bal = await fetchXlmBalance(pubKey);
      if (bal === null) {
        setUnfunded(true);
        setBalance(null);
      } else {
        setUnfunded(false);
        setBalance(bal);
      }
    } catch (err) {
      setGlobalError(err.message || "Could not fetch balance.");
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  // On load, check whether Freighter is present at all.
  useEffect(() => {
    checkFreighterInstalled()
      .then((present) => setFreighterMissing(!present))
      .catch(() => setFreighterMissing(true));
  }, []);

  useEffect(() => {
    if (address) refreshBalance(address);
  }, [address, refreshBalance]);

  async function handleConnect() {
    setGlobalError(null);
    setConnecting(true);
    try {
      const pubKey = await connectWallet();
      setAddress(pubKey);
    } catch (err) {
      setGlobalError(err.message || "Could not connect to Freighter.");
    } finally {
      setConnecting(false);
    }
  }

  function handleDisconnect() {
    // Freighter authorizes per-origin from inside the extension itself;
    // there's no app-triggered revoke call, so "disconnect" here resets
    // this app's local session. Full revocation can be done from the
    // Freighter extension's connected-sites settings.
    setAddress(null);
    setBalance(null);
    setUnfunded(false);
    setTxResult(null);
  }

  async function handleSend({ destination, amount }) {
    setGlobalError(null);
    setSending(true);
    setTxResult(null);
    try {
      const result = await sendPayment({
        sourceAddress: address,
        destination,
        amount,
      });
      setTxResult({ status: "success", hash: result.hash });
      refreshBalance(address);
    } catch (err) {
      const message =
        err?.response?.data?.extras?.result_codes?.operations?.join(", ") ||
        err.message ||
        "Transaction failed.";
      setTxResult({ status: "error", message });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="app">
      <StatusBar
        address={address}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        connecting={connecting}
        freighterMissing={freighterMissing}
      />

      <main className="app__main">
        {globalError && <div className="alert alert--error">{globalError}</div>}

        {!address && !freighterMissing && (
          <div className="empty-state">
            <p>No wallet linked. Connect Freighter to view your balance and send XLM.</p>
          </div>
        )}

        {address && (
          <div className="console-grid">
            <BalancePanel
              balance={balance}
              loading={balanceLoading}
              unfunded={unfunded}
              onRefresh={() => refreshBalance(address)}
            />
            <PaymentForm onSend={handleSend} sending={sending} disabled={!address || unfunded} />
            <TxResult result={txResult} />
          </div>
        )}
      </main>

      <footer className="app__footer">
        <span>Stellar Testnet · Horizon</span>
      </footer>
    </div>
  );
}
