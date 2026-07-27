export default function BalancePanel({ balance, loading, unfunded, onRefresh }) {
  return (
    <section className="panel balance-panel">
      <div className="panel__label">
        <span>Account Balance</span>
        <button className="btn btn--icon" onClick={onRefresh} title="Refresh balance">
          ↻
        </button>
      </div>

      {unfunded ? (
        <div className="balance-panel__empty">
          <p>This account has no testnet history yet.</p>
          <a
            className="btn btn--ghost btn--sm"
            href="https://friendbot.stellar.org/"
            target="_blank"
            rel="noreferrer"
          >
            Fund with Friendbot ↗
          </a>
        </div>
      ) : (
        <div className="balance-panel__value">
          <span className="balance-panel__amount">
            {loading ? "—" : Number(balance).toLocaleString(undefined, { maximumFractionDigits: 7 })}
          </span>
          <span className="balance-panel__unit">XLM</span>
        </div>
      )}
    </section>
  );
}
