<script lang="ts">
	import { connect, disconnect, getConnectors } from '@wagmi/core';
	import { wagmiConfig } from '../wagmi/config';
	import { isConnected, address, isConnecting } from '../wagmi/stores';
	import { formatAddress } from '../utils/format';

	let connecting = $state(false);
	let error = $state<string | null>(null);

	async function handleConnect() {
		connecting = true;
		error = null;

		try {
			const connectors = getConnectors(wagmiConfig);
			const injectedConnector = connectors.find((c) => c.id === 'injected' || c.id === 'metaMaskSDK');

			if (!injectedConnector) {
				throw new Error('No wallet connector found. Please install MetaMask or another Web3 wallet.');
			}

			await connect(wagmiConfig, {
				connector: injectedConnector
			});
		} catch (err) {
			console.error('Connection error:', err);
			error = err instanceof Error ? err.message : 'Failed to connect wallet';
		} finally {
			connecting = false;
		}
	}

	async function handleDisconnect() {
		try {
			await disconnect(wagmiConfig);
		} catch (err) {
			console.error('Disconnect error:', err);
			error = err instanceof Error ? err.message : 'Failed to disconnect wallet';
		}
	}
</script>

<div class="wallet-connect">
	{#if $isConnected && $address}
		<div class="flex items-center gap-3">
			<div class="flex flex-col items-end">
				<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Connected</span>
				<span class="text-xs text-gray-500 dark:text-gray-400 font-mono">{formatAddress($address)}</span>
			</div>
			<button
				onclick={handleDisconnect}
				class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
			>
				Disconnect
			</button>
		</div>
	{:else}
		<button
			onclick={handleConnect}
			disabled={connecting || $isConnecting}
			class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
		>
			{connecting || $isConnecting ? 'Connecting...' : 'Connect Wallet'}
		</button>
	{/if}

	{#if error}
		<div class="mt-2 text-sm text-red-600 dark:text-red-400">{error}</div>
	{/if}
</div>

