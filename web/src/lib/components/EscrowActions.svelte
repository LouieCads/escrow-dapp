<script lang="ts">
	import { releaseFunds, refund, waitForTransaction } from '../contracts/hooks';
	import { address } from '../wagmi/stores';
	import type { EscrowData } from '../contracts/hooks';
	import type { Address } from 'viem';

	interface Props {
		escrow: EscrowData & { id: bigint };
		onUpdate?: () => void;
	}

	let { escrow, onUpdate }: Props = $props();

	let releasing = $state(false);
	let refunding = $state(false);
	let error = $state<string | null>(null);
	let success = $state<string | null>(null);

	// Only show actions if user is the buyer and escrow is awaiting delivery
	const canAct = $derived(
		$address && escrow.buyer.toLowerCase() === $address.toLowerCase() && escrow.state === 0
	);

	async function handleRelease() {
		releasing = true;
		error = null;
		success = null;

		try {
			const { hash } = await releaseFunds(escrow.id);
			success = `Transaction sent: ${hash.slice(0, 10)}...`;

			// Wait for confirmation
			await waitForTransaction(hash);
			success = 'Funds released successfully!';

			onUpdate?.();
		} catch (err) {
			console.error('Release error:', err);
			error = err instanceof Error ? err.message : 'Failed to release funds';
		} finally {
			releasing = false;
		}
	}

	async function handleRefund() {
		refunding = true;
		error = null;
		success = null;

		try {
			const { hash } = await refund(escrow.id);
			success = `Transaction sent: ${hash.slice(0, 10)}...`;

			// Wait for confirmation
			await waitForTransaction(hash);
			success = 'Refund processed successfully!';

			onUpdate?.();
		} catch (err) {
			console.error('Refund error:', err);
			error = err instanceof Error ? err.message : 'Failed to process refund';
		} finally {
			refunding = false;
		}
	}
</script>

{#if canAct}
	<div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
		<div class="flex gap-3">
			<button
				onclick={handleRelease}
				disabled={releasing || refunding}
				class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
			>
				{releasing ? 'Releasing...' : 'Release Funds'}
			</button>
			<button
				onclick={handleRefund}
				disabled={releasing || refunding}
				class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
			>
				{refunding ? 'Refunding...' : 'Refund'}
			</button>
		</div>

		{#if error}
			<div class="mt-2 text-sm text-red-600 dark:text-red-400">{error}</div>
		{/if}

		{#if success}
			<div class="mt-2 text-sm text-green-600 dark:text-green-400">{success}</div>
		{/if}
	</div>
{/if}

