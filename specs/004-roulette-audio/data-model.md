# Data Model: Roulette Audio System

**Feature**: 004-roulette-audio | **Date**: 2026-01-21

## Entities

### AudioFile

Represents a single audio asset.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier (filename without extension) |
| path | string | URL path to the audio file |
| duration | number | Duration in seconds (populated after loading) |
| type | 'ball' \| 'voice' | Category of audio |

### AudioCache

Client-side cache of preloaded audio buffers.

| Field | Type | Description |
|-------|------|-------------|
| ballBuffers | AudioBuffer[] | 7 preloaded ball spin sounds |
| voiceBuffers | Map<number, AudioBuffer> | Result announcements keyed by number (0-36) |
| noMoreBetsBuffer | AudioBuffer | "No more bets" announcement |
| winningNumberIsBuffer | AudioBuffer | "The winning number is" prefix |
| loaded | boolean | Whether all audio has been preloaded |

### AudioState

Runtime state for audio playback.

| Field | Type | Description |
|-------|------|-------------|
| unlocked | boolean | Whether AudioContext is unlocked by user gesture |
| currentBallSource | AudioBufferSourceNode \| null | Currently playing ball audio (for stopping) |
| recentBallSelections | number[] | Last 3 ball audio indices (for variety) |
| volume | number | Master volume (0.0 - 1.0), default 1.0 |

## Audio File Mapping

### Ball Audio Files (7 files)

| Index | Filename | Source | Format |
|-------|----------|--------|--------|
| 0 | ball-1.mp3 | spinning-roulette-wheel-429832.mp3 | MP3 |
| 1 | ball-2.mp3 | roulette-game-429833.mp3 | MP3 |
| 2 | ball-3.mp3 | board-game-casino-429829.mp3 | MP3 |
| 3 | ball-4.mp3 | a-roulette-ball-429831.mp3 | MP3 |
| 4 | ball-5.mp3 | roulette_casino_evianaif-14446.mp3 | MP3 |
| 5 | ball-6.wav | rolling-roulette-ball.wav | WAV |
| 6 | ball-7.wav | roulette_casino_evian.wav | WAV |

### Voice Audio Files (40 files)

| Number | Color | Odd/Even | Filename |
|--------|-------|----------|----------|
| 0 | green | - | zero.wav |
| 1 | red | odd | one-red-odd.wav |
| 2 | black | even | two-black-even.wav |
| 3 | red | odd | three-red-odd.wav |
| 4 | black | even | four-black-even.wav |
| 5 | red | odd | five-red-odd.wav |
| 6 | black | even | six-black-even.wav |
| 7 | red | odd | seven-red-odd.wav |
| 8 | black | even | eight-black-even.wav |
| 9 | red | odd | nine-red-odd.wav |
| 10 | black | even | ten-black-even.wav |
| 11 | black | odd | eleven-black-odd.wav |
| 12 | red | even | twelve-red-even.wav |
| 13 | black | odd | thirteen-black-odd.wav |
| 14 | red | even | fourteen-red-even.wav |
| 15 | black | odd | fifteen-black-odd.wav |
| 16 | red | even | sixteen-red-even.wav |
| 17 | black | odd | seventeen-black-odd.wav |
| 18 | red | even | eighteen-red-even.wav |
| 19 | red | odd | nineteen-red-odd.wav |
| 20 | black | even | twenty-black-even.wav |
| 21 | red | odd | twenty-one-red-odd.wav |
| 22 | black | even | twenty-two-black-even.wav |
| 23 | red | odd | twenty-three-red-odd.wav |
| 24 | black | even | twenty-four-black-even.wav |
| 25 | red | odd | twenty-five-red-odd.wav |
| 26 | black | even | twenty-six-black-even.wav |
| 27 | red | odd | twenty-seven-red-odd.wav |
| 28 | black | even | twenty-eight-black-even.wav |
| 29 | black | odd | twenty-nine-black-odd.wav |
| 30 | red | even | thirty-red-even.wav |
| 31 | black | odd | thirty-one-black-odd.wav |
| 32 | red | even | thirty-two-red-even.wav |
| 33 | black | odd | thirty-three-black-odd.wav |
| 34 | red | even | thirty-four-red-even.wav |
| 35 | black | odd | thirty-five-black-odd.wav |
| 36 | red | even | thirty-six-red-even.wav |
| - | - | - | no-more-bets.wav |
| - | - | - | the-winning-number-is.wav |

## TypeScript Interfaces

```typescript
// Audio file types
type AudioType = 'ball' | 'voice';

interface AudioFileInfo {
  id: string;
  path: string;
  type: AudioType;
}

// Audio cache (client-side)
interface AudioCache {
  ballBuffers: AudioBuffer[];
  voiceBuffers: Map<number, AudioBuffer>;
  noMoreBetsBuffer: AudioBuffer | null;
  winningNumberIsBuffer: AudioBuffer | null;
  loaded: boolean;
}

// Audio playback state
interface AudioState {
  unlocked: boolean;
  currentBallSource: AudioBufferSourceNode | null;
  recentBallSelections: number[];
  volume: number;
}

// Result audio sequence
interface ResultAudioSequence {
  winningNumber: number;
  announcements: AudioBuffer[]; // [winningNumberIs, resultNumber]
}
```

## Relationships

```
AudioService (1) ──────> AudioCache (1)
     │                        │
     │                        ├── ballBuffers[7]
     │                        ├── voiceBuffers[37]
     │                        └── specialBuffers[2]
     │
     └──> AudioState (1)
                │
                └── recentBallSelections[0..3]
```

## State Transitions

### AudioService State Machine

```
[Uninitialized] ──(construct)──> [Created]
                                     │
                       (user click)  │
                                     ▼
                                [Unlocked]
                                     │
                       (preload)     │
                                     ▼
                                 [Ready]
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
   [PlayingBall]              [PlayingVoice]              [PlayingResult]
         │                           │                           │
         └───────────────────────────┴───────────────────────────┘
                                     │
                        (audio ends) │
                                     ▼
                                 [Ready]
```

### Audio Playback Timeline (per spin)

```
Time: 0ms                spinDuration/2              spinDuration          +~3s
      │                        │                          │                  │
      ├── Ball audio starts ───┼── "No More Bets" ────────┼── Ball stops ───┤
      │   (playbackRate adj.)  │   plays over ball        │                  │
      │                        │                          │                  │
      │                        │                          ├── "The winning   │
      │                        │                          │   number is..."  │
      │                        │                          │                  │
      │                        │                          ├── Result number  │
      │                        │                          │   announcement   │
      │                        │                          │                  │
      └────────────────────────┴──────────────────────────┴──────────────────┘
```

## Validation Rules

1. **Ball index**: Must be 0-6 (7 available files)
2. **Result number**: Must be 0-36 (European roulette)
3. **Volume**: Must be 0.0-1.0
4. **Playback rate**: Must be 0.25-4.0 (Web Audio API constraint)
5. **Recent selections**: Max 3 items stored
6. **Consecutive repeats**: Same ball audio cannot play more than 3 times consecutively
