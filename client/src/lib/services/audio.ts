/**
 * AudioService for Roulette Audio System
 *
 * Manages audio playback for ball spin sounds, voice announcements,
 * and result announcements.
 */

import {
	BALL_AUDIO_FILES,
	NUMBER_AUDIO_MAPPING,
	NO_MORE_BETS_FILE,
	WINNING_NUMBER_IS_FILE,
	getBallAudioPath,
	getVoiceAudioPath,
} from './audio-file-mapping';

export class AudioService {
	private audioContext: AudioContext | null = null;
	private gainNode: GainNode | null = null;
	private unlocked = false;
	private loaded = false;

	// Audio buffer cache
	private ballBuffers: AudioBuffer[] = [];
	private voiceBuffers = new Map<number, AudioBuffer>();
	private noMoreBetsBuffer: AudioBuffer | null = null;
	private winningNumberIsBuffer: AudioBuffer | null = null;

	// Playback state
	private currentBallSource: AudioBufferSourceNode | null = null;
	private recentBallSelections: number[] = [];

	constructor(
		private basePath = '/audio',
		private debug = false
	) {}

	/**
	 * Get current service state
	 */
	getState() {
		return {
			unlocked: this.unlocked,
			loaded: this.loaded,
			ballPlaying: this.currentBallSource !== null,
		};
	}

	/**
	 * Unlock audio playback (must be called from user gesture handler)
	 */
	async unlock(): Promise<void> {
		if (this.unlocked) return;

		try {
			this.audioContext = new AudioContext();
			this.gainNode = this.audioContext.createGain();
			this.gainNode.connect(this.audioContext.destination);

			// Play silent buffer to unlock (required for some browsers)
			const buffer = this.audioContext.createBuffer(1, 1, 22050);
			const source = this.audioContext.createBufferSource();
			source.buffer = buffer;
			source.connect(this.audioContext.destination);
			source.start();

			this.unlocked = true;
			this.log('Audio unlocked');
		} catch (error) {
			this.log('Failed to unlock audio:', error);
		}
	}

	/**
	 * Preload all audio files into memory
	 */
	async preload(): Promise<void> {
		if (!this.audioContext || this.loaded) return;

		try {
			this.log('Starting audio preload...');

			// Load ball audio files in parallel
			const ballPromises = BALL_AUDIO_FILES.map(async (_, index) => {
				const path = getBallAudioPath(index, this.basePath);
				this.ballBuffers[index] = await this.loadAudioBuffer(path);
				this.log(`Loaded ball audio ${index + 1}`);
			});

			// Load voice files for all numbers
			const voicePromises = NUMBER_AUDIO_MAPPING.map(async ({ number, filename }) => {
				const path = getVoiceAudioPath(filename, this.basePath);
				this.voiceBuffers.set(number, await this.loadAudioBuffer(path));
			});

			// Load special announcements
			const specialPromises = [
				this.loadAudioBuffer(getVoiceAudioPath(NO_MORE_BETS_FILE, this.basePath)).then(
					(b) => (this.noMoreBetsBuffer = b)
				),
				this.loadAudioBuffer(getVoiceAudioPath(WINNING_NUMBER_IS_FILE, this.basePath)).then(
					(b) => (this.winningNumberIsBuffer = b)
				),
			];

			await Promise.all([...ballPromises, ...voicePromises, ...specialPromises]);

			this.loaded = true;
			this.log('All audio preloaded successfully');
		} catch (error) {
			this.log('Preload error (continuing):', error);
		}
	}

	/**
	 * Load a single audio file into an AudioBuffer
	 */
	private async loadAudioBuffer(path: string): Promise<AudioBuffer> {
		const response = await fetch(path);
		if (!response.ok) {
			throw new Error(`Failed to fetch audio: ${path}`);
		}
		const arrayBuffer = await response.arrayBuffer();
		return this.audioContext!.decodeAudioData(arrayBuffer);
	}

	/**
	 * Select a random ball audio index, avoiding too many consecutive repeats
	 */
	private selectRandomBallIndex(): number {
		// Filter out indices that have been used 3 times in recent selections
		const available = [0, 1, 2, 3, 4, 5, 6].filter(
			(i) => this.recentBallSelections.filter((r) => r === i).length < 3
		);

		// If somehow all are filtered out (shouldn't happen), use all
		const pool = available.length > 0 ? available : [0, 1, 2, 3, 4, 5, 6];
		const index = pool[Math.floor(Math.random() * pool.length)];

		// Track this selection
		this.recentBallSelections.push(index);
		if (this.recentBallSelections.length > 3) {
			this.recentBallSelections.shift();
		}

		return index;
	}

	/**
	 * Play ball spin audio with duration matching
	 */
	async playBallAudio(spinDuration: number): Promise<void> {
		if (!this.audioContext || !this.unlocked || !this.loaded) {
			this.log('Cannot play ball audio: not ready');
			return;
		}

		try {
			// Stop any existing ball audio first
			this.stopBallAudio();

			// Select random ball audio
			const index = this.selectRandomBallIndex();
			const buffer = this.ballBuffers[index];
			if (!buffer) {
				this.log(`Ball buffer ${index} not loaded`);
				return;
			}

			// Calculate playback rate to match spin duration
			const targetDurationSec = spinDuration / 1000;
			let playbackRate = buffer.duration / targetDurationSec;

			// Clamp to valid range (0.25 - 4.0 per Web Audio spec)
			playbackRate = Math.max(0.25, Math.min(4.0, playbackRate));

			// Create and start playback
			const source = this.audioContext.createBufferSource();
			source.buffer = buffer;
			source.playbackRate.value = playbackRate;
			source.connect(this.gainNode!);
			source.start();

			// Track current source for stopping later
			this.currentBallSource = source;

			// Auto-clear reference when audio ends
			source.onended = () => {
				if (this.currentBallSource === source) {
					this.currentBallSource = null;
				}
			};

			this.log(
				`Playing ball audio ${index + 1}, rate: ${playbackRate.toFixed(2)}, target: ${targetDurationSec}s`
			);
		} catch (error) {
			this.log('Ball audio playback error:', error);
		}
	}

	/**
	 * Stop currently playing ball audio
	 */
	stopBallAudio(): void {
		if (this.currentBallSource) {
			try {
				this.currentBallSource.stop();
				this.log('Ball audio stopped');
			} catch {
				// Already stopped, ignore
			}
			this.currentBallSource = null;
		}
	}

	/**
	 * Play "No more bets" voice announcement
	 */
	async playNoMoreBets(): Promise<void> {
		if (!this.audioContext || !this.unlocked || !this.noMoreBetsBuffer) {
			this.log('Cannot play no more bets: not ready');
			return;
		}

		try {
			const source = this.audioContext.createBufferSource();
			source.buffer = this.noMoreBetsBuffer;
			source.connect(this.gainNode!);
			source.start();
			this.log('Playing "No more bets"');
		} catch (error) {
			this.log('No more bets playback error:', error);
		}
	}

	/**
	 * Play a buffer and wait for it to complete
	 */
	private playBufferAndWait(buffer: AudioBuffer): Promise<void> {
		return new Promise((resolve) => {
			if (!this.audioContext) {
				resolve();
				return;
			}

			const source = this.audioContext.createBufferSource();
			source.buffer = buffer;
			source.connect(this.gainNode!);
			source.onended = () => resolve();
			source.start();
		});
	}

	/**
	 * Announce the winning result
	 */
	async announceResult(winningNumber: number): Promise<void> {
		if (!this.audioContext || !this.unlocked || !this.winningNumberIsBuffer) {
			this.log('Cannot announce result: not ready');
			return;
		}

		try {
			// Stop ball audio first
			this.stopBallAudio();

			// Play "The winning number is..."
			this.log('Playing "The winning number is..."');
			await this.playBufferAndWait(this.winningNumberIsBuffer);

			// Then play the result number
			const resultBuffer = this.voiceBuffers.get(winningNumber);
			if (resultBuffer) {
				this.log(`Playing result for ${winningNumber}`);
				await this.playBufferAndWait(resultBuffer);
			} else {
				this.log(`No voice buffer for number ${winningNumber}`);
			}

			this.log(`Result announcement complete: ${winningNumber}`);
		} catch (error) {
			this.log('Result announcement error:', error);
		}
	}

	/**
	 * Set master volume
	 */
	setVolume(volume: number): void {
		if (this.gainNode) {
			this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
			this.log(`Volume set to ${volume}`);
		}
	}

	/**
	 * Clean up resources
	 */
	dispose(): void {
		this.stopBallAudio();
		if (this.audioContext) {
			this.audioContext.close();
			this.audioContext = null;
		}
		this.gainNode = null;
		this.ballBuffers = [];
		this.voiceBuffers.clear();
		this.noMoreBetsBuffer = null;
		this.winningNumberIsBuffer = null;
		this.log('AudioService disposed');
	}

	/**
	 * Debug logging
	 */
	private log(...args: unknown[]): void {
		if (this.debug) {
			console.log('[AudioService]', ...args);
		}
	}
}
