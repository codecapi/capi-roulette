import type { Color } from '@shared/types';

// European roulette numbers (0-36)
export const ROULETTE_NUMBERS = Array.from({ length: 37 }, (_, i) => i);

// Red numbers
export const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

// Black numbers
export const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

// Green (zero)
export const GREEN_NUMBERS = [0];

// Get color for a number
export function getNumberColor(num: number): Color {
	if (num === 0) return 'green';
	if (RED_NUMBERS.includes(num)) return 'red';
	return 'black';
}

// Game timing constants
export const TIMING = {
	spinDuration: { min: 8000, max: 12000 }, // milliseconds
};

// Spin configuration for CSS animation
export const SPIN_CONFIG = {
	minDuration: 8000, // milliseconds
	maxDuration: 12000, // milliseconds
	ballRotations: 5, // minimum full rotations before settling
};

// Get slot index for a winning number
export function getSlotIndex(winningNumber: number): number {
	return WHEEL_ORDER.indexOf(winningNumber);
}

// Wheel number order (European roulette, clockwise from 0)
export const WHEEL_ORDER = [
	0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14,
	31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];
