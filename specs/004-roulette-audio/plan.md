# Implementation Plan: Roulette Audio System

**Branch**: `004-roulette-audio` | **Date**: 2026-01-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-roulette-audio/spec.md`

## Summary

Add immersive audio support to the roulette wheel display with ball spin sounds during wheel animation, "No More Bets" voice announcement at betting close, and result announcements with number, color, and odd/even. Audio files already exist in `/audio/roulette/` and need to be integrated with the game state machine and wheel component.

## Technical Context

**Language/Version**: TypeScript 5.4+ (Bun backend), TypeScript 5.9+ (Svelte frontend)
**Primary Dependencies**: Bun (server), SvelteKit 2.x, Svelte 5, Vite 7.x, Web Audio API (browser)
**Storage**: Static audio files served from client/public/ or server
**Testing**: Playwright (E2E), Bun test runner (unit)
**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (client/server architecture)
**Performance Goals**: Audio playback starts within 100ms of trigger, ball audio matches spin duration within 500ms
**Constraints**: Browser autoplay policies may require user interaction before first audio; graceful degradation if audio fails
**Scale/Scope**: Single display page with ~47 audio files (7 ball + 40 voice)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution is in template form (not yet customized for this project). Proceeding with standard best practices:

| Gate | Status | Notes |
|------|--------|-------|
| No unnecessary complexity | ✅ PASS | Single AudioService class, simple WebSocket message flow |
| Test coverage | ✅ PASS | E2E tests can verify audio playback triggers |
| Type safety | ✅ PASS | Shared TypeScript types for audio messages |
| Graceful degradation | ✅ PASS | Spec requires game continues without audio on failure |

## Project Structure

### Documentation (this feature)

```text
specs/004-roulette-audio/
├── plan.md              # This file
├── research.md          # Phase 0: Audio API research
├── data-model.md        # Phase 1: Audio entity definitions
├── quickstart.md        # Phase 1: Implementation guide
├── contracts/           # Phase 1: Audio message contracts
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Web application structure (existing)
server/
├── src/
│   ├── game/
│   │   └── state-machine.ts    # MODIFY: Add audio event broadcasts
│   ├── websocket/
│   │   └── handlers/dealer.ts  # MODIFY: Forward audio events
│   └── routes/
│       └── audio.ts            # NEW: Audio file serving endpoint (if needed)

client/
├── public/
│   └── audio/                  # NEW: Audio assets copied from /audio/roulette/
│       ├── ball/               # 7 ball spin MP3 files
│       └── voice/              # 40 voice announcement WAV files
├── src/
│   ├── lib/
│   │   ├── services/
│   │   │   └── audio.ts        # NEW: AudioService class
│   │   ├── stores/
│   │   │   └── game.ts         # MODIFY: Add audio state handling
│   │   └── components/
│   │       └── wheel/
│   │           └── CSSRouletteWheel.svelte  # MODIFY: Integrate audio triggers
│   └── routes/
│       └── display/
│           └── +page.svelte    # MODIFY: Initialize audio on user interaction

shared/
└── types/
    └── index.ts                # MODIFY: Add audio message types
```

**Structure Decision**: Using existing client/server structure. Audio files will be served statically from `client/public/audio/` (Vite serves these at build time). AudioService will be a pure client-side module.

## Complexity Tracking

No violations requiring justification. The implementation follows minimal patterns:
- Single AudioService class (no abstract factories or complex inheritance)
- Direct integration with existing WebSocket message flow
- Reuse of existing game state machine phase transitions
