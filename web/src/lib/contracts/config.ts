import { type Address } from 'viem';
import { simpleEscrowAbi } from './simpleEscrow.abi';

/**
 * Contract configuration loaded from environment variables
 * This ensures contract addresses and ABIs are not hard-coded
 */

// Get contract address from environment variable
// For local development (Hardhat), default to localhost address
// In production, this should be set via PUBLIC_ESCROW_CONTRACT_ADDRESS
export const ESCROW_CONTRACT_ADDRESS = (import.meta.env.PUBLIC_ESCROW_CONTRACT_ADDRESS ||
	'0x5FbDB2315678afecb367f032d93F642f64180aa3') as Address;

// Export the ABI
export { simpleEscrowAbi as ESCROW_CONTRACT_ABI };

// Validate that contract address is set
if (!ESCROW_CONTRACT_ADDRESS || ESCROW_CONTRACT_ADDRESS === '0x') {
	console.warn(
		'⚠️ ESCROW_CONTRACT_ADDRESS not set. Please set PUBLIC_ESCROW_CONTRACT_ADDRESS in your environment variables.'
	);
}

