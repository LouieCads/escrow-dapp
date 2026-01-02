<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { wagmiConfig } from '$lib/wagmi/config';
	import { hydrate } from '@wagmi/core';

	let { children } = $props();

	// Initialize wagmi on mount (client-side only)
	onMount(async () => {
		// Hydrate wagmi config for SSR compatibility
		// Note: In production, you may want to restore previous connections
		const { onMount: wagmiOnMount } = hydrate(wagmiConfig, {});
		await wagmiOnMount();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Escrow dApp</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	{@render children()}
</div>
