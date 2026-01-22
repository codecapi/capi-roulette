# Research: Roulette Audio System

**Feature**: 004-roulette-audio | **Date**: 2026-01-21

## Research Questions

### 1. Web Audio Playback Approach

**Question**: Should we use HTML5 Audio elements or the Web Audio API?

**Decision**: HTML5 Audio with Web Audio API for playback rate control

**Rationale**:
- HTML5 Audio (`<audio>` element / `Audio()` constructor) is simpler and sufficient for basic playback
- Web Audio API (`AudioContext`) is needed specifically for playback rate adjustment (FR-003)
- Combination approach: Load audio via HTML5 Audio, connect to AudioContext for rate control

**Alternatives Considered**:
- Pure HTML5 Audio: Cannot adjust playback rate dynamically with duration matching
- Pure Web Audio API: More complex for simple playback scenarios
- Third-party library (Howler.js, Tone.js): Unnecessary dependency for our use case

### 2. Audio Playback Rate for Duration Matching

**Question**: How to match ball audio duration to configurable spin duration?

**Decision**: Use `AudioBufferSourceNode.playbackRate` from Web Audio API

**Rationale**:
- Web Audio API allows real-time playback rate adjustment
- Formula: `playbackRate = audioFileDuration / targetSpinDuration`
- Example: 15s audio file playing over 9s spin = playbackRate of 1.67
- For longer spins than audio: loop with crossfade or slow playback rate (e.g., 0.6)

**Implementation Notes**:
```typescript
// Create audio context and load buffer
const audioContext = new AudioContext();
const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

// Calculate playback rate to match spin duration
const playbackRate = audioBuffer.duration / (spinDuration / 1000);

// Play with adjusted rate
const source = audioContext.createBufferSource();
source.buffer = audioBuffer;
source.playbackRate.value = playbackRate;
source.connect(audioContext.destination);
source.start();
```

**Constraints**:
- Playback rate range: 0.25 to 4.0 (per Web Audio spec)
- Below 0.5 sounds unnatural; above 2.0 sounds sped up
- For very long/short spins, may need to loop or select appropriate audio file

### 3. Browser Autoplay Policy Handling

**Question**: How to handle browser autoplay restrictions?

**Decision**: Require user interaction (click/touch) before first audio, then preload and unlock

**Rationale**:
- All modern browsers block autoplay until user gesture
- First user interaction on display page unlocks AudioContext
- After unlock, all subsequent audio plays automatically

**Implementation Pattern**:
```typescript
class AudioService {
  private audioContext: AudioContext | null = null;
  private unlocked = false;

  async unlock(): Promise<void> {
    if (this.unlocked) return;

    this.audioContext = new AudioContext();

    // Create and play silent buffer to unlock
    const buffer = this.audioContext.createBuffer(1, 1, 22050);
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start();

    this.unlocked = true;
  }
}
```

**User Experience**:
- Display page shows "Click to enable audio" overlay on first load
- Single click/touch unlocks audio for the session
- No further user interaction required

### 4. Audio Preloading Strategy

**Question**: When and how to preload audio files?

**Decision**: Preload all audio on page load using `fetch` + `decodeAudioData`

**Rationale**:
- Total audio size is ~50MB (47 files)
- Network latency would cause noticeable delays if loaded on-demand
- Browser caching makes subsequent loads fast
- Preloading ensures instant playback

**Implementation**:
```typescript
interface AudioCache {
  ball: AudioBuffer[];      // 7 files
  voice: Map<number, AudioBuffer>; // 37 result files
  noMoreBets: AudioBuffer;
  winningNumberIs: AudioBuffer;
}

async function preloadAudio(): Promise<AudioCache> {
  const cache: AudioCache = {
    ball: [],
    voice: new Map(),
    noMoreBets: null!,
    winningNumberIs: null!,
  };

  // Parallel loading
  await Promise.all([
    ...BALL_FILES.map(async (file, i) => {
      cache.ball[i] = await loadAudioBuffer(`/audio/ball/${file}`);
    }),
    ...VOICE_FILES.map(async ({ number, file }) => {
      cache.voice.set(number, await loadAudioBuffer(`/audio/voice/${file}`));
    }),
    loadAudioBuffer('/audio/voice/no-more-bets.wav').then(b => cache.noMoreBets = b),
    loadAudioBuffer('/audio/voice/the-winning-number-is.wav').then(b => cache.winningNumberIs = b),
  ]);

  return cache;
}
```

### 5. Audio File Naming Convention

**Question**: What naming convention for simplified audio file references?

**Decision**: Rename files to match spec convention, removing Freesound IDs

**Current Files** (in `/audio/roulette/voice/`):
```
106410__timkahn__one-red-odd.wav
106474__timkahn__no-more-bets.wav
```

**Target Files** (in `client/public/audio/voice/`):
```
one-red-odd.wav
no-more-bets.wav
```

**Rationale**:
- Simpler paths in code
- Matches spec audio file mapping
- Preserves original Freesound attribution in README

### 6. Audio-Game Synchronization

**Question**: How to synchronize audio with wheel animation phases?

**Decision**: Client-side triggers based on game phase and local timers

**Implementation**:
- Ball audio: Start immediately when `trigger_spin` message received
- "No More Bets": Trigger at `spinDuration / 2` (matches existing mask text change)
- Result announcement: Trigger when `isRevealed` becomes true in wheel component

**Rationale**:
- Existing wheel component already has timers for "No More Bets" at halfway point
- Adding server-side audio commands would add latency
- Client-side timing matches visual animation exactly

### 7. Random Ball Audio Selection

**Question**: How to ensure variety in ball audio selection (no more than 3 consecutive repeats)?

**Decision**: Track last 3 selections, weighted random avoiding recent files

**Implementation**:
```typescript
class AudioService {
  private recentBallSelections: number[] = [];

  getRandomBallIndex(): number {
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
}
```

### 8. Error Handling and Graceful Degradation

**Question**: How to handle audio failures without affecting gameplay?

**Decision**: Wrap all audio operations in try-catch, log errors, continue gameplay

**Implementation**:
```typescript
async playBallAudio(spinDuration: number): Promise<void> {
  try {
    if (!this.unlocked || !this.audioContext) {
      console.warn('Audio not unlocked, skipping playback');
      return;
    }

    const buffer = this.getBallBuffer();
    // ... playback logic
  } catch (error) {
    console.error('Ball audio playback failed:', error);
    // Gameplay continues unaffected
  }
}
```

**Error Scenarios Handled**:
- AudioContext not supported (old browsers)
- Audio file failed to load (network error)
- Playback interrupted (browser tab backgrounded)
- AudioContext suspended (user hasn't interacted)

## Summary

| Topic | Decision | Key Reason |
|-------|----------|------------|
| Audio API | HTML5 Audio + Web Audio API | Playback rate control needed |
| Duration matching | `playbackRate` property | Real-time adjustment |
| Autoplay policy | Click-to-unlock overlay | Browser requirement |
| Preloading | Load all on page init | Instant playback |
| File naming | Simplified without IDs | Matches spec |
| Synchronization | Client-side timers | Matches animation |
| Random selection | Weighted with history | Prevent 3+ repeats |
| Error handling | Try-catch, log, continue | Graceful degradation |
