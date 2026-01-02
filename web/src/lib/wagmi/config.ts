import { createConfig, http } from '@wagmi/core';
import { injected } from '@wagmi/connectors';
import { localhost, sepolia } from 'viem/chains';
import type { Config } from '@wagmi/core';

/**
 * Wagmi configuration for wallet connections
 * Supports localhost (Hardhat) and Sepolia testnet
 */

const supportedChains = [localhost, sepolia] as const;

export const wagmiConfig: Config = createConfig({
	chains: supportedChains,
	connectors: [
		injected() // MetaMask and other injected wallets
	],
	transports: {
		[localhost.id]: http('http://127.0.0.1:8545'),
		[sepolia.id]: http()
	},
	ssr: false // Disable SSR for wallet connections
});

