# Quickstart: Roulette Audio System

**Feature**: 004-roulette-audio | **Date**: 2026-01-21

## Overview

This guide walks through implementing audio support for the roulette wheel display. The implementation adds:

1. Ball spinning sounds during wheel animation
2. "No More Bets" voice announcement at betting close
3. Result announcement with number, color, and odd/even

## Prerequisites

- Existing capi-roulette codebase with working wheel
- Audio files from `/audio/roulette/` directory
- Node.js/Bun development environment

## Step 1: Copy Audio Files

Copy and rename audio files to the client's public directory:

```bash
# Create directories
mkdir -p client/public/audio/ball
mkdir -p client/public/audio/voice

# Copy ball audio files (rename for simplicity)
cp audio/roulette/ball/spinning-roulette-wheel-429832.mp3 client/public/audio/ball/ball-1.mp3
cp audio/roulette/ball/roulette-game-429833.mp3 client/public/audio/ball/ball-2.mp3
cp audio/roulette/ball/board-game-casino-429829.mp3 client/public/audio/ball/ball-3.mp3
cp audio/roulette/ball/a-roulette-ball-429831.mp3 client/public/audio/ball/ball-4.mp3
cp audio/roulette/ball/roulette_casino_evianaif-14446.mp3 client/public/audio/ball/ball-5.mp3
cp "audio/roulette/ball/366494__paultherocker3000__rolling-roulette-ball.wav" client/public/audio/ball/ball-6.wav
cp "audio/roulette/ball/59194__f_ilippo__roulette_casino_evian.wav" client/public/audio/ball/ball-7.wav

# Copy voice files (strip Freesound prefixes)
for f in audio/roulette/voice/*.wav; do
  basename=$(basename "$f" | sed 's/^[0-9]*__[a-z]*__//')
  cp "$f" "client/public/audio/voice/$basename"
done
```

## Step 2: Create AudioService

Create `client/src/lib/services/audio.ts`:

```typescript
import {
  BALL_AUDIO_FILES,
  NUMBER_AUDIO_MAPPING,
  NO_MORE_BETS_FILE,
  WINNING_NUMBER_IS_FILE,
  getBallAudioPath,
  getVoiceAudioPath,
  getResultAudioFilename,
} from './audio-file-mapping';

export class AudioService {
  private audioContext: AudioContext | null = null;
  private unlocked = false;
  private loaded = false;

  // Audio buffers
  private ballBuffers: AudioBuffer[] = [];
  private voiceBuffers = new Map<number, AudioBuffer>();
  private noMoreBetsBuffer: AudioBuffer | null = null;
  private winningNumberIsBuffer: AudioBuffer | null = null;

  // Playback state
  private currentBallSource: AudioBufferSourceNode | null = null;
  private recentBallSelections: number[] = [];
  private gainNode: GainNode | null = null;

  constructor(private basePath = '/audio', private debug = false) {}

  async unlock(): Promise<void> {
    if (this.unlocked) return;

    try {
      this.audioContext = new AudioContext();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);

      // Play silent buffer to unlock
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

  async preload(): Promise<void> {
    if (!this.audioContext || this.loaded) return;

    try {
      // Load ball audio files in parallel
      const ballPromises = BALL_AUDIO_FILES.map(async (_, index) => {
        const path = getBallAudioPath(index, this.basePath);
        this.ballBuffers[index] = await this.loadAudioBuffer(path);
      });

      // Load voice files for all numbers
      const voicePromises = NUMBER_AUDIO_MAPPING.map(async ({ number, filename }) => {
        const path = getVoiceAudioPath(filename, this.basePath);
        this.voiceBuffers.set(number, await this.loadAudioBuffer(path));
      });

      // Load special announcements
      const specialPromises = [
        this.loadAudioBuffer(getVoiceAudioPath(NO_MORE_BETS_FILE, this.basePath))
          .then(b => this.noMoreBetsBuffer = b),
        this.loadAudioBuffer(getVoiceAudioPath(WINNING_NUMBER_IS_FILE, this.basePath))
          .then(b => this.winningNumberIsBuffer = b),
      ];

      await Promise.all([...ballPromises, ...voicePromises, ...specialPromises]);

      this.loaded = true;
      this.log('All audio preloaded');
    } catch (error) {
      this.log('Preload error (continuing):', error);
    }
  }

  async playBallAudio(spinDuration: number): Promise<void> {
    if (!this.audioContext || !this.unlocked) return;

    try {
      // Stop any existing ball audio
      this.stopBallAudio();

      // Select random ball audio (avoiding too many repeats)
      const index = this.selectRandomBallIndex();
      const buffer = this.ballBuffers[index];
      if (!buffer) return;

      // Calculate playback rate to match spin duration
      const targetDurationSec = spinDuration / 1000;
      let playbackRate = buffer.duration / targetDurationSec;

      // Clamp to valid range
      playbackRate = Math.max(0.25, Math.min(4.0, playbackRate));

      // Create and start playback
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = playbackRate;
      source.connect(this.gainNode!);
      source.start();

      this.currentBallSource = source;
      this.log(`Playing ball audio ${index + 1}, rate: ${playbackRate.toFixed(2)}`);
    } catch (error) {
      this.log('Ball audio error:', error);
    }
  }

  stopBallAudio(): void {
    if (this.currentBallSource) {
      try {
        this.currentBallSource.stop();
      } catch (e) {
        // Already stopped
      }
      this.currentBallSource = null;
    }
  }

  async playNoMoreBets(): Promise<void> {
    if (!this.audioContext || !this.noMoreBetsBuffer) return;

    try {
      const source = this.audioContext.createBufferSource();
      source.buffer = this.noMoreBetsBuffer;
      source.connect(this.gainNode!);
      source.start();
      this.log('Playing "No more bets"');
    } catch (error) {
      this.log('No more bets error:', error);
    }
  }

  async announceResult(winningNumber: number): Promise<void> {
    if (!this.audioContext || !this.winningNumberIsBuffer) return;

    try {
      // Play "The winning number is..."
      await this.playBufferAndWait(this.winningNumberIsBuffer);

      // Then play the result
      const resultBuffer = this.voiceBuffers.get(winningNumber);
      if (resultBuffer) {
        await this.playBufferAndWait(resultBuffer);
      }

      this.log(`Announced result: ${winningNumber}`);
    } catch (error) {
      this.log('Result announcement error:', error);
    }
  }

  setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  dispose(): void {
    this.stopBallAudio();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  // Private helpers

  private async loadAudioBuffer(path: string): Promise<AudioBuffer> {
    const response = await fetch(path);
    const arrayBuffer = await response.arrayBuffer();
    return this.audioContext!.decodeAudioData(arrayBuffer);
  }

  private selectRandomBallIndex(): number {
    // Filter out indices that have been used 3 times recently
    const available = [0, 1, 2, 3, 4, 5, 6].filter(
      i => this.recentBallSelections.filter(r => r === i).length < 3
    );

    const index = available[Math.floor(Math.random() * available.length)];

    this.recentBallSelections.push(index);
    if (this.recentBallSelections.length > 3) {
      this.recentBallSelections.shift();
    }

    return index;
  }

  private playBufferAndWait(buffer: AudioBuffer): Promise<void> {
    return new Promise((resolve) => {
      const source = this.audioContext!.createBufferSource();
      source.buffer = buffer;
      source.connect(this.gainNode!);
      source.onended = () => resolve();
      source.start();
    });
  }

  private log(...args: any[]): void {
    if (this.debug) {
      console.log('[AudioService]', ...args);
    }
  }
}
```

## Step 3: Integrate with Display Page

Update `client/src/routes/display/+page.svelte`:

```svelte
<script lang="ts">
  import { AudioService } from '$lib/services/audio';

  let audioService: AudioService | null = null;
  let audioUnlocked = $state(false);

  async function unlockAudio() {
    audioService = new AudioService('/audio', true);
    await audioService.unlock();
    await audioService.preload();
    audioUnlocked = true;
  }

  // When spin starts
  function onSpinStart(spinDuration: number) {
    audioService?.playBallAudio(spinDuration);
  }

  // At halfway point (when "No More Bets" shows)
  function onNoMoreBets() {
    audioService?.playNoMoreBets();
  }

  // When result is revealed
  function onResultRevealed(winningNumber: number) {
    audioService?.stopBallAudio();
    audioService?.announceResult(winningNumber);
  }

  onDestroy(() => {
    audioService?.dispose();
  });
</script>

{#if !audioUnlocked}
  <button onclick={unlockAudio} class="audio-unlock-btn">
    Click to Enable Audio
  </button>
{/if}
```

## Step 4: Update Wheel Component

Modify `client/src/lib/components/wheel/CSSRouletteWheel.svelte` to expose audio trigger callbacks:

```svelte
<script lang="ts">
  let {
    onSpinComplete,
    onSpinStart,      // NEW: Called when spin begins
    onNoMoreBets,     // NEW: Called at halfway point
    onResultRevealed, // NEW: Called when result shows
    spinDuration = 9000,
    overrideResult = null,
  } = $props();

  export function spin() {
    if (isSpinning) return;

    isSpinning = true;

    // Trigger audio for spin start
    onSpinStart?.(spinDuration);

    // ... existing spin logic ...

    // At halfway point
    setTimeout(() => {
      maskText = 'No More Bets';
      onNoMoreBets?.();
    }, spinDuration / 2);

    // When result reveals
    setTimeout(() => {
      isRevealed = true;
      onResultRevealed?.(resultNumber);
      onSpinComplete?.(resultNumber);
    }, spinDuration);
  }
</script>
```

## Step 5: Test

1. Start the dev server: `bun run dev`
2. Open the display page
3. Click "Enable Audio" button
4. Trigger a spin from the dealer page
5. Verify:
   - Ball sound plays immediately
   - "No more bets" plays at midpoint
   - Result announcement plays when number reveals

## Troubleshooting

### Audio doesn't play
- Check browser console for errors
- Ensure user clicked the unlock button first
- Verify audio files exist in `client/public/audio/`

### Audio out of sync
- Ball audio should start within 100ms of spin start
- Playback rate may need adjustment for very short/long spins

### Browser compatibility
- Works in Chrome, Firefox, Safari, Edge
- iOS Safari requires explicit user tap to unlock
