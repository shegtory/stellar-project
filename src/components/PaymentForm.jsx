import { useState } from "react";

const STELLAR_ADDRESS_RE = /^G[A-Z2-7]{55}$/;

export default function PaymentForm({ onSend, sending, disabled }) {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [formError, setFormError] = useState(null);

  function validate() {
    if (!STELLAR_ADDRESS_RE.test(destination.trim())) {
      return "Enter a valid Stellar public key (starts with G, 56 characters).";
    }
    const num = Number(amount);
    if (!amount || Number.isNaN(num) || num <= 0) {
      return "Enter an amount greater than 0.";
    }
    return null;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setFormError(err);
      return;
    }
    setFormError(null);
    onSend({ destination: destination.trim(), amount });
  }

  return (
    <form className="panel payment-form" onSubmit={handleSubmit}>
      <div className="panel__label">
        <span>Transmit Payment</span>
      </div>

      <label className="field">
        <span className="field__label">Destination address</span>
        <input
          className="field__input field__input--mono"
          type="text"
          placeholder="GABCDEF...WXYZ"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          disabled={disabled || sending}
          autoComplete="off"
          spellCheck={false}
        />
      </label>

      <label className="field">
        <span className="field__label">Amount (XLM)</span>
        <input
          className="field__input field__input--mono"
          type="number"
          step="0.0000001"
          min="0"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={disabled || sending}
        />
      </label>

      {formError && <p className="field__error">{formError}</p>}

      <button
        type="submit"
        className={`btn btn--primary btn--transmit ${sending ? "btn--transmit-active" : ""}`}
        disabled={disabled || sending}
      >
        {sending ? "Transmitting…" : "Transmit"}
      </button>

      {disabled && !sending && (
        <p className="payment-form__hint">Connect your wallet to send a payment.</p>
      )}
    </form>
  );
}
