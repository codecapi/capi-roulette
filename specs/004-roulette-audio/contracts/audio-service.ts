/**
 * AudioService Contract
 *
 * Client-side service for managing roulette audio playback.
 * This is the primary interface for the audio system.
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Configuration for initializing the AudioService
 */
export interface AudioServiceConfig {
  /** Base URL path for audio files (default: '/audio') */
  basePath?: string;
  /** Master volume 0.0-1.0 (default: 1.0) */
  volume?: number;
  /** Enable console logging for debugging (default: false) */
  debug?: boolean;
}

/**
 * Options for playing ball audio
 */
export interface PlayBallOptions {
  /** Target spin duration in milliseconds */
  spinDuration: number;
}

/**
 * Options for announcing a result
 */
export interface AnnounceResultOptions {
  /** Winning number (0-36) */
  winningNumber: number;
}

/**
 * Current state of the audio service
 */
export interface AudioServiceState {
  /** Whether audio has been unlocked by user interaction */
  unlocked: boolean;
  /** Whether all audio files have been preloaded */
  loaded: boolean;
  /** Whether ball audio is currently playing */
  ballPlaying: boolean;
  /** Whether voice audio is currently playing */
  voicePlaying: boolean;
}

// ============================================================================
// AudioService Interface
// ============================================================================

/**
 * AudioService manages all roulette audio playback.
 *
 * Usage:
 * 1. Call unlock() on first user interaction
 * 2. Call preload() to load all audio files
 * 3. Use play methods as needed during gameplay
 *
 * @example
 * ```typescript
 * const audio = new AudioService({ volume: 0.8 });
 *
 * // On first user click
 * await audio.unlock();
 * await audio.preload();
 *
 * // During gameplay
 * await audio.playBallAudio({ spinDuration: 9000 });
 * await audio.playNoMoreBets();
 * await audio.stopBallAudio();
 * await audio.announceResult({ winningNumber: 17 });
 * ```
 */
export interface IAudioService {
  /**
   * Get current service state
   */
  getState(): AudioServiceState;

  /**
   * Unlock audio playback (must be called from user gesture handler)
   * Creates and resumes AudioContext.
   *
   * @returns Promise that resolves when audio is unlocked
   * @throws Never - failures are logged but don't throw
   */
  unlock(): Promise<void>;

  /**
   * Preload all audio files into memory.
   * Should be called after unlock() completes.
   *
   * @returns Promise that resolves when all files are loaded
   * @throws Never - partial failures are logged but don't throw
   */
  preload(): Promise<void>;

  /**
   * Play a randomly selected ball spinning sound.
   * Adjusts playback rate to match the target spin duration.
   * Ensures variety (no more than 3 consecutive same sounds).
   *
   * @param options.spinDuration - Target duration in milliseconds
   * @returns Promise that resolves when playback starts
   * @throws Never - failures are logged but don't throw
   */
  playBallAudio(options: PlayBallOptions): Promise<void>;

  /**
   * Stop the currently playing ball audio.
   * Call this when the spin animation completes.
   *
   * @returns void (synchronous)
   */
  stopBallAudio(): void;

  /**
   * Play the "No more bets" voice announcement.
   * Plays over any currently playing ball audio.
   *
   * @returns Promise that resolves when playback starts
   * @throws Never - failures are logged but don't throw
   */
  playNoMoreBets(): Promise<void>;

  /**
   * Announce the winning result.
   * Plays "The winning number is..." followed by the result (e.g., "seven red odd").
   *
   * @param options.winningNumber - The winning number (0-36)
   * @returns Promise that resolves when announcement completes
   * @throws Never - failures are logged but don't throw
   */
  announceResult(options: AnnounceResultOptions): Promise<void>;

  /**
   * Set the master volume.
   *
   * @param volume - Volume level 0.0 (muted) to 1.0 (full)
   */
  setVolume(volume: number): void;

  /**
   * Clean up resources.
   * Call when the display page is unmounted.
   */
  dispose(): void;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Number of ball audio files available
 */
export const BALL_AUDIO_COUNT = 7;

/**
 * Total roulette numbers (0-36 for European roulette)
 */
export const ROULETTE_NUMBER_COUNT = 37;

/**
 * Maximum consecutive plays of the same ball audio
 */
export const MAX_CONSECUTIVE_SAME_BALL = 3;

/**
 * Minimum playback rate (Web Audio API constraint)
 */
export const MIN_PLAYBACK_RATE = 0.25;

/**
 * Maximum playback rate (Web Audio API constraint)
 */
export const MAX_PLAYBACK_RATE = 4.0;
