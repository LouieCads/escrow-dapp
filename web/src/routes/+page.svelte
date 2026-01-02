<script lang="ts">
	import WalletConnect from '$lib/components/WalletConnect.svelte';
	import CreateEscrow from '$lib/components/CreateEscrow.svelte';
	import EscrowList from '$lib/components/EscrowList.svelte';

	let refreshKey = $state(0);

	function handleEscrowCreated() {
		refreshKey++;
	}
</script>

<svelte:head>
	<title>Escrow dApp</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<header class="mb-8">
		<div class="flex items-center justify-between mb-6">
			<h1 class="text-4xl font-bold text-gray-900 dark:text-white">Escrow dApp</h1>
			<WalletConnect />
		</div>
	</header>

	<main class="space-y-8">
		<CreateEscrow onCreated={handleEscrowCreated} />

		<EscrowList onUpdate={handleEscrowCreated} />
	</main>
</div>



