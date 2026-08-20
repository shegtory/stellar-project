# Signal — Yellow Belt Payment Tracker

Signal is a multi-wallet Stellar Testnet dApp that transfers XLM and records authenticated payment data through a deployed Soroban smart contract. New contract events are synchronized with the live activity feed.

**Live Demo:** https://stellar-project-lime.vercel.app

## Yellow Belt Features

- Multi-wallet integration using Stellar Wallets Kit
- Freighter, xBull, Albedo, Rabet and other compatible wallets
- Rust Soroban smart contract deployed on Testnet
- Smart contract calls from the frontend
- Contract state reading and writing
- Real-time contract event synchronization
- Visible pending, success and failure transaction states
- Actual XLM transfers between Stellar accounts
- Automatic activation of unfunded destination accounts
- Explorer links for transaction verification
- More than 10 meaningful Git commits

## Error Handling

The interface handles and displays readable messages for:

- User-rejected transactions
- Insufficient XLM balance
- Invalid Stellar destination addresses
- Missing or unavailable wallets
- Wrong network
- RPC and on-chain transaction failures
- Confirmation timeouts

## Technology Stack

- React 19
- Vite
- Stellar Wallets Kit
- Stellar SDK
- Rust
- Soroban SDK
- Stellar Horizon and RPC
- Vercel

## Run Locally

```bash
npm install
copy .env.example .env.local
npm run dev
