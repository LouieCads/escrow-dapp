# Smart Contract Integration Guide

This document describes how the SimpleEscrow smart contract is integrated with the SvelteKit frontend using wagmi v3 and viem.

## Architecture

### Technologies Used
- **@wagmi/core v3**: Core wallet connection and state management
- **@wagmi/connectors**: Wallet connectors (MetaMask, etc.)
- **viem**: Ethereum utilities and contract interaction
- **Svelte 5**: Reactive UI framework
- **TypeScript**: Type safety

### Project Structure

```
web/src/lib/
├── contracts/
│   ├── config.ts          # Contract address (from env) and ABI exports
│   ├── hooks.ts           # Contract interaction functions
│   ├── types.ts           # TypeScript types for escrow states
│   ├── simpleEscrow.abi.ts # Contract ABI
│   └── index.ts           # Public exports
├── wagmi/
│   ├── config.ts          # Wagmi configuration (chains, connectors)
│   └── stores.ts          # Svelte stores for wallet state
├── components/
│   ├── WalletConnect.svelte    # Wallet connection UI
│   ├── CreateEscrow.svelte     # Create new escrow form
│   ├── EscrowList.svelte       # List of all escrows
│   └── EscrowActions.svelte    # Actions for escrows (release/refund)
└── utils/
    └── format.ts          # Address and ether formatting utilities
```

## Configuration

### Environment Variables

The contract address is loaded from environment variables to avoid hard-coding:

```bash
# .env
PUBLIC_ESCROW_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

The contract address defaults to the local Hardhat network address if not set. In production, set this via environment variables.

### Wagmi Configuration

The wagmi configuration (`src/lib/wagmi/config.ts`) supports:
- **localhost** (Hardhat): `http://127.0.0.1:8545`
- **Sepolia** testnet: Via public RPC

Connectors:
- **Injected**: MetaMask and other injected wallets

## Usage

### Wallet Connection

The `WalletConnect` component handles wallet connection and disconnection:

```svelte
<script>
  import WalletConnect from '$lib/components/WalletConnect.svelte';
</script>

<WalletConnect />
```

### Contract Interactions

All contract interactions are handled through the hooks in `src/lib/contracts/hooks.ts`:

```typescript
import { createEscrow, releaseFunds, refund, getEscrow } from '$lib/contracts/hooks';

// Create escrow
const { hash } = await createEscrow(sellerAddress, amountInWei);

// Release funds
await releaseFunds(escrowId);

// Refund
await refund(escrowId);

// Read escrow data
const escrow = await getEscrow(escrowId);
```

### State Management

Wallet state is managed through Svelte stores:

```typescript
import { isConnected, address, chainIdStore } from '$lib/wagmi/stores';

// Reactive access
$: console.log('Connected:', $isConnected);
$: console.log('Address:', $address);
$: console.log('Chain ID:', $chainIdStore);
```

## Features

### ✅ Best Practices Implemented

1. **Dynamic Contract Configuration**: Contract address loaded from environment variables
2. **Type Safety**: Full TypeScript types for contract ABI and interactions
3. **Error Handling**: Comprehensive error handling with user-friendly messages
4. **State Management**: Reactive Svelte stores for wallet and contract state
5. **UI Feedback**: Loading states, success/error messages, transaction status
6. **Clean UI**: Modern, consistent design with Tailwind CSS and dark mode support

### Security Considerations

- Wallet connection validation
- Transaction confirmation before execution
- Proper error handling for failed transactions
- Input validation for addresses and amounts

## Development

### Setup

1. Install dependencies:
```bash
cd web
bun install
```

2. Set environment variables (optional for local development):
```bash
cp .env.example .env
# Edit .env with your contract address
```

3. Start development server:
```bash
bun run dev
```

### Testing with Local Hardhat Network

1. Start Hardhat node:
```bash
cd contracts
npx hardhat node
```

2. Deploy contract (if not already deployed):
```bash
npx hardhat ignition deploy ignition/modules/SimpleEscrow.ts --network localhost
```

3. Update contract address in `.env` if needed

4. Connect MetaMask to `http://127.0.0.1:8545`

## Production Deployment

1. Deploy contract to your target network
2. Set `PUBLIC_ESCROW_CONTRACT_ADDRESS` environment variable to deployed address
3. Build the application:
```bash
bun run build
```

The contract address will be loaded at build time from the environment variable.

