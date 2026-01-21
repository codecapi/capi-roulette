# Implementation Plan: Simplified Roulette Display for Real Table

**Branch**: `002-display-dealer-only` | **Date**: 2026-01-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-display-dealer-only/spec.md`

## Summary

Simplify the existing roulette application to serve as a display companion for a real physical roulette table. Remove all player functionality (betting, player registration, score tracking) and enhance the display page to use provided design images (wheel.png, last-result-hot-cold-numers.png). Modify dealer controls to support explicit game phases: Bets Open, Bets Close, Spin (with manual winning number entry), and New Round.

## Technical Context

**Language/Version**: TypeScript 5.4+ (Bun runtime 1.1+)
**Primary Dependencies**:
- Server: Bun native WebSocket, no external frameworks
- Client: SvelteKit 2.49+, Svelte 5.45+, Vite 7.2+, Tailwind CSS 4.0
**Storage**: In-memory session storage (no persistence beyond browser session)
**Testing**: Bun test (server), Playwright (client e2e)
**Target Platform**: Web (modern browsers), designed for TV/projector display + tablet/phone dealer control
**Project Type**: Web application (separate server + client)
**Performance Goals**:
- Display updates within 1 second of dealer action
- Wheel animation 8-12 seconds
- Page load under 3 seconds
**Constraints**:
- Must use provided wheel.png image for display
- Must match last-result-hot-cold-numers.png layout exactly
- 4+ hour continuous operation without degradation
**Scale/Scope**: Single dealer, single display, no concurrent games

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution template has not been customized for this project. No specific architectural constraints are defined. The following general principles apply:

| Principle | Status | Notes |
|-----------|--------|-------|
| Simplicity | ✅ Pass | Removing complexity (player system) |
| Test coverage | ✅ Pass | Existing tests, will update for new flow |
| Clear boundaries | ✅ Pass | Display (read-only) vs Dealer (control) separation maintained |

**No gate violations detected.**

## Project Structure

### Documentation (this feature)

```text
specs/002-display-dealer-only/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
server/
├── src/
│   ├── game/
│   │   ├── session-store.ts    # Simplified: remove player storage
│   │   ├── state-machine.ts    # Modified: new game phases, manual number entry
│   │   ├── constants.ts        # Keep: wheel order, colors
│   │   ├── rng.ts              # Remove: no longer needed (manual entry)
│   │   ├── bet-validator.ts    # Remove: no betting
│   │   └── payout.ts           # Remove: no payouts
│   ├── routes/
│   │   ├── index.ts            # Modified: remove player routes
│   │   ├── dealer.ts           # Modified: new endpoints for game controls
│   │   ├── session.ts          # Keep: session management
│   │   ├── auth.ts             # Keep: dealer auth
│   │   └── players.ts          # Remove: entire file
│   ├── websocket/
│   │   ├── server.ts           # Modified: remove player type handling
│   │   ├── broadcast.ts        # Modified: remove player broadcasts
│   │   ├── topics.ts           # Modified: remove player topics
│   │   └── handlers/
│   │       ├── dealer.ts       # Modified: new message types
│   │       └── player.ts       # Remove: entire file
│   ├── server.ts               # Minor updates
│   └── index.ts                # Keep as-is
└── tests/
    └── *.test.ts               # Update for new flow

client/
├── src/
│   ├── routes/
│   │   ├── +layout.svelte      # Keep
│   │   ├── +page.svelte        # Simplify: remove player option
│   │   ├── display/
│   │   │   └── +page.svelte    # Major rewrite: use design images
│   │   ├── dealer/
│   │   │   └── +page.svelte    # Major rewrite: new controls, statistics
│   │   └── play/               # Remove: entire directory
│   │       └── +page.svelte
│   ├── lib/
│   │   ├── components/
│   │   │   ├── display/
│   │   │   │   ├── ResultsOverlay.svelte  # Modify: remove winners
│   │   │   │   ├── WheelDisplay.svelte    # New: image-based wheel
│   │   │   │   └── StatsPanel.svelte      # New: hot/cold from design
│   │   │   └── wheel/
│   │   │       └── WheelCanvas.svelte     # Remove or repurpose for animation
│   │   ├── stores/
│   │   │   └── game.ts                    # Simplify: remove player stores
│   │   └── services/
│   │       └── websocket.ts               # Simplify: remove player type
│   └── static/
│       ├── wheel.png                      # Already present
│       └── last-result-hot-cold-numers.png # Already present
└── tests/
    └── *.spec.ts                          # Update for new flow
```

**Structure Decision**: Maintaining existing web application structure with server/ and client/ separation. Major simplification by removing player-related code from both sides.

## Complexity Tracking

> No constitution violations to justify.

| Change | Rationale |
|--------|-----------|
| Remove player system | Core requirement - using real table |
| Image-based wheel | Spec requires using provided designs |
| Manual number entry | Dealer enters real table result |
| Explicit game phases | Better control flow for real table scenario |
