/**
 * Audio File Mapping for Roulette Audio System
 *
 * Defines the mapping between roulette numbers and their corresponding audio files.
 */

export type RouletteColor = 'red' | 'black' | 'green';
export type OddEven = 'odd' | 'even' | null;

export interface NumberAudioMapping {
	number: number;
	color: RouletteColor;
	oddEven: OddEven;
	filename: string;
}

/**
 * Ball audio file paths (relative to /audio/ball/)
 */
export const BALL_AUDIO_FILES = [
	'ball-1.mp3',
	'ball-2.mp3',
	'ball-3.mp3',
	'ball-4.mp3',
	'ball-5.mp3',
	'ball-6.mp3',
	'ball-7.mp3',
] as const;

/**
 * "No more bets" announcement file
 */
export const NO_MORE_BETS_FILE = 'no-more-bets.wav';

/**
 * "The winning number is" prefix file
 */
export const WINNING_NUMBER_IS_FILE = 'the-winning-number-is.wav';

/**
 * Complete mapping of all 37 numbers to their audio files.
 * Follows European roulette color/odd-even rules.
 */
export const NUMBER_AUDIO_MAPPING: readonly NumberAudioMapping[] = [
	{ number: 0, color: 'green', oddEven: null, filename: 'zero.wav' },
	{ number: 1, color: 'red', oddEven: 'odd', filename: 'one-red-odd.wav' },
	{ number: 2, color: 'black', oddEven: 'even', filename: 'two-black-even.wav' },
	{ number: 3, color: 'red', oddEven: 'odd', filename: 'three-red-odd.wav' },
	{ number: 4, color: 'black', oddEven: 'even', filename: 'four-black-even.wav' },
	{ number: 5, color: 'red', oddEven: 'odd', filename: 'five-red-odd.wav' },
	{ number: 6, color: 'black', oddEven: 'even', filename: 'six-black-even.wav' },
	{ number: 7, color: 'red', oddEven: 'odd', filename: 'seven-red-odd.wav' },
	{ number: 8, color: 'black', oddEven: 'even', filename: 'eight-black-even.wav' },
	{ number: 9, color: 'red', oddEven: 'odd', filename: 'nine-red-odd.wav' },
	{ number: 10, color: 'black', oddEven: 'even', filename: 'ten-black-even.wav' },
	{ number: 11, color: 'black', oddEven: 'odd', filename: 'eleven-black-odd.wav' },
	{ number: 12, color: 'red', oddEven: 'even', filename: 'twelve-red-even.wav' },
	{ number: 13, color: 'black', oddEven: 'odd', filename: 'thirteen-black-odd.wav' },
	{ number: 14, color: 'red', oddEven: 'even', filename: 'fourteen-red-even.wav' },
	{ number: 15, color: 'black', oddEven: 'odd', filename: 'fifteen-black-odd.wav' },
	{ number: 16, color: 'red', oddEven: 'even', filename: 'sixteen-red-even.wav' },
	{ number: 17, color: 'black', oddEven: 'odd', filename: 'seventeen-black-odd.wav' },
	{ number: 18, color: 'red', oddEven: 'even', filename: 'eighteen-red-even.wav' },
	{ number: 19, color: 'red', oddEven: 'odd', filename: 'nineteen-red-odd.wav' },
	{ number: 20, color: 'black', oddEven: 'even', filename: 'twenty-black-even.wav' },
	{ number: 21, color: 'red', oddEven: 'odd', filename: 'twenty-one-red-odd.wav' },
	{ number: 22, color: 'black', oddEven: 'even', filename: 'twenty-two-black-even.wav' },
	{ number: 23, color: 'red', oddEven: 'odd', filename: 'twenty-three-red-odd.wav' },
	{ number: 24, color: 'black', oddEven: 'even', filename: 'twenty-four-black-even.wav' },
	{ number: 25, color: 'red', oddEven: 'odd', filename: 'twenty-five-red-odd.wav' },
	{ number: 26, color: 'black', oddEven: 'even', filename: 'twenty-six-black-even.wav' },
	{ number: 27, color: 'red', oddEven: 'odd', filename: 'twenty-seven-red-odd.wav' },
	{ number: 28, color: 'black', oddEven: 'even', filename: 'twenty-eight-black-even.wav' },
	{ number: 29, color: 'black', oddEven: 'odd', filename: 'twenty-nine-black-odd.wav' },
	{ number: 30, color: 'red', oddEven: 'even', filename: 'thirty-red-even.wav' },
	{ number: 31, color: 'black', oddEven: 'odd', filename: 'thirty-one-black-odd.wav' },
	{ number: 32, color: 'red', oddEven: 'even', filename: 'thirty-two-red-even.wav' },
	{ number: 33, color: 'black', oddEven: 'odd', filename: 'thirty-three-black-odd.wav' },
	{ number: 34, color: 'red', oddEven: 'even', filename: 'thirty-four-red-even.wav' },
	{ number: 35, color: 'black', oddEven: 'odd', filename: 'thirty-five-black-odd.wav' },
	{ number: 36, color: 'red', oddEven: 'even', filename: 'thirty-six-red-even.wav' },
] as const;

/**
 * Get the audio filename for a given roulette number.
 */
export function getResultAudioFilename(number: number): string {
	const mapping = NUMBER_AUDIO_MAPPING.find((m) => m.number === number);
	if (!mapping) {
		throw new Error(`Invalid roulette number: ${number}`);
	}
	return mapping.filename;
}

/**
 * Get the full audio path for a ball audio file.
 */
export function getBallAudioPath(index: number, basePath = '/audio'): string {
	if (index < 0 || index >= BALL_AUDIO_FILES.length) {
		throw new Error(`Invalid ball audio index: ${index}`);
	}
	return `${basePath}/ball/${BALL_AUDIO_FILES[index]}`;
}

/**
 * Get the full audio path for a voice announcement.
 */
export function getVoiceAudioPath(filename: string, basePath = '/audio'): string {
	return `${basePath}/voice/${filename}`;
}
