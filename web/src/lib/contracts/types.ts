/**
 * Type definitions for SimpleEscrow contract
 */

export enum EscrowState {
	AWAITING_DELIVERY = 0,
	COMPLETE = 1,
	REFUNDED = 2
}

export type EscrowStateName = 'AWAITING_DELIVERY' | 'COMPLETE' | 'REFUNDED';

export function getEscrowStateName(state: number): EscrowStateName {
	switch (state) {
		case EscrowState.AWAITING_DELIVERY:
			return 'AWAITING_DELIVERY';
		case EscrowState.COMPLETE:
			return 'COMPLETE';
		case EscrowState.REFUNDED:
			return 'REFUNDED';
		default:
			return 'AWAITING_DELIVERY';
	}
}

