<script lang="ts">
	import { onMount } from 'svelte';
	import { getEscrowCount, getEscrow, type EscrowData } from '../contracts/hooks';
	import { formatEther, formatAddress } from '../utils/format';
	import { getEscrowStateName } from '../contracts/types';
	import EscrowActions from './EscrowActions.svelte';
	import type { Address } from 'viem';

	interface Props {
		onUpdate?: () => void;
	}

	let { onUpdate }: Props = $props();

	let escrows = $state<Array<EscrowData & { id: bigint }>>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let count = $state<bigint>(0n);

	$effect(() => {
		loadEscrows();
	});

	async function loadEscrows() {
		loading = true;
		error = null;

		try {
			const escrowCount = await getEscrowCount();
			count = escrowCount;

			const escrowPromises: Promise<EscrowData & { id: bigint }>[] = [];
			for (let i = 0n; i < escrowCount; i++) {
				escrowPromises.push(
					getEscrow(i).then((data) => ({
						...data,
						id: i
					}))
				);
			}

			escrows = await Promise.all(escrowPromises);
		} catch (err) {
			console.error('Error loading escrows:', err);
			error = err instanceof Error ? err.message : 'Failed to load escrows';
		} finally {
			loading = false;
		}
	}

	function handleUpdate() {
		loadEscrows();
		onUpdate?.();
	}
</script>

<div class="escrow-list">
	<div class="mb-4 flex items-center justify-between">
		<h2 class="text-2xl font-bold text-gray-900 dark:text-white">Escrows ({count.toString()})</h2>
		<button
			onclick={loadEscrows}
			disabled={loading}
			class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
		>
			Refresh
		</button>
	</div>

	{#if loading}
		<div class="text-center py-8 text-gray-500 dark:text-gray-400">Loading escrows...</div>
	{:else if error}
		<div class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
			{error}
		</div>
	{:else if escrows.length === 0}
		<div class="text-center py-8 text-gray-500 dark:text-gray-400">No escrows found</div>
	{:else}
		<div class="space-y-4">
			{#each escrows as escrow (escrow.id)}
				<div
					class="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
				>
					<div class="flex items-start justify-between mb-4">
						<div>
							<div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Escrow #{escrow.id.toString()}</div>
							<div
								class="inline-block px-3 py-1 rounded-full text-xs font-semibold {
									escrow.state === 0
										? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
										: escrow.state === 1
											? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
											: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
								}"
							>
								{getEscrowStateName(escrow.state)}
							</div>
						</div>
						<div class="text-right">
							<div class="text-2xl font-bold text-gray-900 dark:text-white">
								{formatEther(escrow.amount)} ETH
							</div>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
						<div>
							<div class="text-gray-500 dark:text-gray-400 mb-1">Buyer</div>
							<div class="font-mono text-gray-900 dark:text-white">{formatAddress(escrow.buyer)}</div>
						</div>
						<div>
							<div class="text-gray-500 dark:text-gray-400 mb-1">Seller</div>
							<div class="font-mono text-gray-900 dark:text-white">{formatAddress(escrow.seller)}</div>
						</div>
					</div>

					<EscrowActions {escrow} onUpdate={handleUpdate} />
				</div>
			{/each}
		</div>
	{/if}
</div>

