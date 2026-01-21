# Implementation Plan: Web-Based Roulette Game

**Branch**: `001-web-roulette-game` | **Date**: 2026-01-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-web-roulette-game/spec.md`

## Summary

Build a multi-page web-based roulette game for a company casino night party. The system consists of four interconnected pages: a display page (TV/projector) with realistic wheel animation, a dealer control page (password-protected), a mobile player betting interface, and a results overlay. All pages synchronize in real-time via WebSocket on a local network. Players bet with points (1-500 max), using chips valued 1/5/10/25/50. European roulette rules with basic bet types only.

## Technical Context

**Language/Version**: TypeScript 5.x (both frontend and backend)
**Primary Dependencies**: Svelte 5, SvelteKit 2, Bun 1.1+, Tailwind CSS 4
**Storage**: JSON file (session backup via Bun.write()), in-memory during gameplay
**Testing**: Vitest (unit), Playwright (E2E)
**Target Platform**: Modern web browsers (Chrome, Safari, Firefox) on desktop TV display, tablets, and mobile phones
**Project Type**: web (frontend + backend)
**Performance Goals**: 30+ FPS animations, <1s sync latency, 20+ concurrent players
**Constraints**: Local network only, single server instance, no external dependencies during gameplay
**Scale/Scope**: Single session at a time, up to ~50 players, ~100 rounds per evening
**Animation**: HTML5 Canvas 2D (native, no library)
**WebSocket**: Bun native WebSocket with pub/sub (no Socket.IO)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The constitution file contains only template placeholders without defined principles. Proceeding without specific gate checks. Standard software engineering best practices apply:

- [x] Code should be testable
- [x] Clear separation of concerns
- [x] Documentation for setup and usage
- [x] Error handling for edge cases

## Project Structure

### Documentation (this feature)

```text
specs/001-web-roulette-game/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
server/
├── src/
│   ├── index.ts           # Entry point, server setup
│   ├── game/              # Game logic (state machine, payouts, RNG)
│   ├── websocket/         # WebSocket handlers and broadcast
│   ├── routes/            # HTTP routes (auth, backup)
│   └── types/             # Shared TypeScript types
└── tests/

client/
├── src/
│   ├── pages/
│   │   ├── display/       # TV/projector roulette display
│   │   ├── dealer/        # Dealer control panel
│   │   ├── player/        # Mobile betting interface
│   │   └── results/       # Results overlay (may be part of display)
│   ├── components/
│   │   ├── wheel/         # Roulette wheel + ball animation
│   │   ├── table/         # Betting table layout
│   │   └── shared/        # Buttons, chips, overlays
│   ├── services/          # WebSocket client, game state
│   └── assets/            # Design images (wheel.png, etc.)
└── tests/

shared/
└── types/                 # Shared types between client/server
```

**Structure Decision**: Web application with separate client and server directories. The client serves multiple page types (display, dealer, player) as routes within a single SPA or separate entry points. Server handles game state, WebSocket broadcasting, and backup persistence.

## Complexity Tracking

No constitution violations to justify.
