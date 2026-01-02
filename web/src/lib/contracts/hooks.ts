import { readContract, writeContract, waitForTransactionReceipt, getConnection } from '@wagmi/core';
import type { Address } from 'viem';
import { wagmiConfig } from '../wagmi/config';
import { ESCROW_CONTRACT_ADDRESS, ESCROW_CONTRACT_ABI } from './config';
import type { EscrowState } from './types';

/**
 * Contract interaction hooks and utilities
 * Provides type-safe functions for interacting with the SimpleEscrow contract
 */

export interface EscrowData {
	buyer: Address;
	seller: Address;
	amount: bigint;
	state: EscrowState;
}

/**
 * Get the total number of escrows
 */
export async function getEscrowCount(): Promise<bigint> {
	const result = await readContract(wagmiConfig, {
		address: ESCROW_CONTRACT_ADDRESS,
		abi: ESCROW_CONTRACT_ABI,
		functionName: 'escrowCount'
	});
	return result as bigint;
}

/**
 * Get escrow details by ID
 */
export async function getEscrow(escrowId: bigint): Promise<EscrowData> {
	const result = await readContract(wagmiConfig, {
		address: ESCROW_CONTRACT_ADDRESS,
		abi: ESCROW_CONTRACT_ABI,
		functionName: 'getEscrow',
		args: [escrowId]
	}) as readonly [Address, Address, bigint, number];

	return {
		buyer: result[0],
		seller: result[1],
		amount: result[2],
		state: result[3] as EscrowState
	};
}

/**
 * Create a new escrow
 */
export async function createEscrow(seller: Address, value: bigint): Promise<{ hash: `0x${string}` }> {
	const connection = getConnection(wagmiConfig);
	if (!connection.isConnected || !connection.address) {
		throw new Error('Wallet not connected');
	}

	const hash = await writeContract(wagmiConfig, {
		address: ESCROW_CONTRACT_ADDRESS,
		abi: ESCROW_CONTRACT_ABI,
		functionName: 'createEscrow',
		args: [seller],
		value
	});

	return { hash };
}

/**
 * Release funds to seller
 */
export async function releaseFunds(escrowId: bigint): Promise<{ hash: `0x${string}` }> {
	const connection = getConnection(wagmiConfig);
	if (!connection.isConnected || !connection.address) {
		throw new Error('Wallet not connected');
	}

	const hash = await writeContract(wagmiConfig, {
		address: ESCROW_CONTRACT_ADDRESS,
		abi: ESCROW_CONTRACT_ABI,
		functionName: 'releaseFunds',
		args: [escrowId]
	});

	return { hash };
}

/**
 * Refund escrow to buyer
 */
export async function refund(escrowId: bigint): Promise<{ hash: `0x${string}` }> {
	const connection = getConnection(wagmiConfig);
	if (!connection.isConnected || !connection.address) {
		throw new Error('Wallet not connected');
	}

	const hash = await writeContract(wagmiConfig, {
		address: ESCROW_CONTRACT_ADDRESS,
		abi: ESCROW_CONTRACT_ABI,
		functionName: 'refund',
		args: [escrowId]
	});

	return { hash };
}

/**
 * Wait for transaction receipt
 */
export async function waitForTransaction(hash: `0x${string}`) {
	return await waitForTransactionReceipt(wagmiConfig, { hash });
}

