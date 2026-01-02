import { writable, derived } from 'svelte/store';
import { getConnection, watchConnection, getChainId, watchChainId, type GetConnectionReturnType } from '@wagmi/core';
import { wagmiConfig } from './config';
import type { Address } from 'viem';

/**
 * Svelte stores for wagmi state management
 * Provides reactive stores for account, connection status, and chain ID
 */

// Account/Connection store
function createConnectionStore() {
	const { subscribe, set } = writable<GetConnectionReturnType | null>(null);

	// Initialize with current connection
	const connection = getConnection(wagmiConfig);
	set(connection);

	// Watch for connection changes
	const unwatch = watchConnection(wagmiConfig, {
		onChange(connection) {
			set(connection);
		}
	});

	return {
		subscribe,
		unwatch
	};
}

export const connectionStore = createConnectionStore();

// Derived stores for convenience
export const isConnected = derived(connectionStore, ($connection) => $connection?.isConnected ?? false);
export const address = derived(connectionStore, ($connection) => $connection?.address);
export const isConnecting = derived(connectionStore, ($connection) => $connection?.status === 'connecting');

// Chain ID store
function createChainIdStore() {
	const { subscribe, set } = writable<number | undefined>(undefined);

	// Initialize with current chain ID
	const chainId = getChainId(wagmiConfig);
	set(chainId);

	// Watch for chain ID changes
	const unwatch = watchChainId(wagmiConfig, {
		onChange(chainId) {
			set(chainId);
		}
	});

	return {
		subscribe,
		unwatch
	};
}

export const chainIdStore = createChainIdStore();

