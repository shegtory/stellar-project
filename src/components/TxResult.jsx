import { shorten } from "../lib/stellar";

export default function TxResult({ result }) {
  if (!result) return null;

  const { status, hash, message } = result;

  return (
    <section
      className={`panel tx-result tx-result--${status}`}
      role="status"
      aria-live="polite"
    >
      <div className="panel__label">
        <span>{status === "success" ? "Transmission confirmed" : "Transmission failed"}</span>
      </div>

      {status === "success" ? (
        <>
          <p className="tx-result__hash">{shorten(hash, 10, 10)}</p>
          <a
            className="btn btn--ghost btn--sm"
            href={`https://stellar.expert/explorer/testnet/tx/${hash}`}
            target="_blank"
            rel="noreferrer"
          >
            View on Stellar Expert ↗
          </a>
        </>
      ) : (
        <p className="tx-result__message">{message}</p>
      )}
    </section>
  );
}
