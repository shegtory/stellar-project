# Signal — Yellow Belt Payment Tracker

Signal is a multi-wallet Stellar Testnet dApp that writes authenticated payment
records to a Soroban smart contract and synchronizes its activity feed from
contract state and events. It extends the White Belt payment-console project for
Level 2 of Stellar Journey to Mastery.

## Yellow Belt requirements

- **Multi-wallet:** Stellar Wallets Kit supports Freighter, xBull, Albedo,
  Rabet, LOBSTR, Hana and other compatible wallets.
- **Three error types:** wallet unavailable, user rejection/wrong network, and
  insufficient balance are shown as readable UI errors.
- **Contract read/write:** `record` writes authenticated data; `recent`, `get`,
  and `count` read contract state.
- **Events:** every record emits a `payment` event; the UI refreshes events and
  state every six seconds.
- **Transaction tracking:** awaiting-signature, pending, success, and failure
  states are visible with an Explorer transaction link.

## Stack

- React 19 + Vite
- `@creit.tech/stellar-wallets-kit`
- `@stellar/stellar-sdk` (Horizon + Stellar RPC)
- Rust + Soroban SDK smart contract

## Run locally

```bash
npm install
copy .env.example .env.local
# Replace VITE_CONTRACT_ID with the deployed Testnet contract ID.
npm run dev
```

## Smart contract

The source and unit test are in [`contracts/payment-tracker`](./contracts/payment-tracker).

```powershell
stellar contract build --manifest-path contracts/payment-tracker/Cargo.toml
stellar keys generate signal-deployer --network testnet --fund
stellar contract deploy `
  --wasm contracts/payment-tracker/target/wasm32v1-none/release/signal_payment_tracker.wasm `
  --source-account signal-deployer `
  --network testnet `
  --alias signal-payment-tracker
```

After deployment, put the returned `C...` contract address in `.env.local`:

```dotenv
VITE_CONTRACT_ID=C...
```

## Deployment evidence

- Testnet contract and verification call: see [`DEPLOYMENT.md`](./DEPLOYMENT.md)
- Live demo: _add after deploying the frontend_
- Wallet-options screenshot: _add before submission_

## Error handling

The interface provides dedicated messages for a missing/unavailable wallet,
rejected connection/signature or wrong network, insufficient XLM balance,
invalid destination/amount, RPC rejection, on-chain failure, and confirmation
timeout.

All network operations are pinned to Stellar Testnet.
