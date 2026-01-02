import type { Address } from 'viem';

/**
 * Format an Ethereum address to a shortened version
 * Example: 0x1234...5678
 */
export function formatAddress(address: Address | undefined | null): string {
	if (!address) return '';
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format wei to ETH with specified decimals
 */
export function formatEther(value: bigint, decimals: number = 4): string {
	const divisor = BigInt(10 ** 18);
	const whole = value / divisor;
	const remainder = value % divisor;
	const decimal = Number(remainder) / Number(divisor);

	if (decimal === 0) {
		return whole.toString();
	}

	return (Number(whole) + decimal).toFixed(decimals);
}

/**
 * Parse ETH string to wei
 */
export function parseEther(value: string): bigint {
	const floatValue = parseFloat(value);
	if (isNaN(floatValue)) {
		throw new Error('Invalid ether value');
	}
	return BigInt(Math.floor(floatValue * 10 ** 18));
}

