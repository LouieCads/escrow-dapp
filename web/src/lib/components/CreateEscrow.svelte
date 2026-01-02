<script lang="ts">
	import { createEscrow, waitForTransaction } from '../contracts/hooks';
	import { isConnected } from '../wagmi/stores';
	import { parseEther, formatAddress } from '../utils/format';
	import type { Address } from 'viem';

	interface Props {
		onCreated?: () => void;
	}

	let { onCreated }: Props = $props();

	let sellerAddress = $state('');
	let amount = $state('');
	let creating = $state(false);
	let error = $state<string | null>(null);
	let success = $state<string | null>(null);

	function validateAddress(address: string): boolean {
		return /^0x[a-fA-F0-9]{40}$/.test(address);
	}

	function validateAmount(amount: string): boolean {
		const num = parseFloat(amount);
		return !isNaN(num) && num > 0;
	}

	async function handleSubmit() {
		error = null;
		success = null;

		// Validation
		if (!validateAddress(sellerAddress)) {
			error = 'Invalid seller address';
			return;
		}

		if (!validateAmount(amount)) {
			error = 'Invalid amount. Must be a positive number.';
			return;
		}

		creating = true;

		try {
			const value = parseEther(amount);
			const { hash } = await createEscrow(sellerAddress as Address, value);
			success = `Transaction sent: ${hash.slice(0, 10)}...`;

			// Wait for confirmation
			await waitForTransaction(hash);
			success = `Escrow created successfully! Transaction: ${hash.slice(0, 10)}...`;

			// Reset form
			sellerAddress = '';
			amount = '';

			onCreated?.();
		} catch (err) {
			console.error('Create escrow error:', err);
			error = err instanceof Error ? err.message : 'Failed to create escrow';
		} finally {
			creating = false;
		}
	}
</script>

<div class="create-escrow p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
	<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Create New Escrow</h2>

	{#if !$isConnected}
		<div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-800 dark:text-yellow-400">
			Please connect your wallet to create an escrow.
		</div>
	{:else}
		<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
			<div>
				<label for="seller" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Seller Address
				</label>
				<input
					id="seller"
					type="text"
					bind:value={sellerAddress}
					placeholder="0x..."
					disabled={creating}
					class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 disabled:opacity-50 font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				/>
			</div>

			<div>
				<label for="amount" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Amount (ETH)
				</label>
				<input
					id="amount"
					type="number"
					step="0.0001"
					min="0"
					bind:value={amount}
					placeholder="0.0"
					disabled={creating}
					class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				/>
			</div>

			<button
				type="submit"
				disabled={creating || !sellerAddress || !amount}
				class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
			>
				{creating ? 'Creating...' : 'Create Escrow'}
			</button>

			{#if error}
				<div class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
					{error}
				</div>
			{/if}

			{#if success}
				<div class="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">
					{success}
				</div>
			{/if}
		</form>
	{/if}
</div>

