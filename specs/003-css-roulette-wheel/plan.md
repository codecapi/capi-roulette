# Implementation Plan: CSS Roulette Wheel Animation

**Branch**: `003-css-roulette-wheel` | **Date**: 2026-01-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-css-roulette-wheel/spec.md`

## Summary

Replace the current image-based wheel display with a pure CSS-drawn roulette wheel inspired by the [CodePen by PDER](https://codepen.io/pder/pen/WYrRQm). The wheel will feature 37 segments (0-36) rendered via CSS transforms, with a ball element that animates around the wheel before settling on the winning number. Spin duration will be configurable (8-12 seconds default) with random variation per round.

## Technical Context

**Language/Version**: TypeScript 5.4+ (Bun runtime 1.1+)
**Primary Dependencies**:
- Server: Bun native WebSocket, no external frameworks
- Client: SvelteKit 2.49+, Svelte 5.45+, Vite 7.2+, Tailwind CSS 4.0
**Storage**: In-memory (spin configuration as server constants)
**Testing**: Bun test (server), Playwright (client e2e)
**Target Platform**: Web (modern browsers), designed for TV/projector display
**Project Type**: Web application (separate server + client)
**Performance Goals**:
- Animation at 30+ fps
- Spin duration 8-12 seconds (configurable)
- Smooth deceleration easing
**Constraints**:
- Pure CSS wheel rendering (no image assets for wheel)
- Must match European roulette number order and colors
- Animation driven client-side, server provides winning number only
**Scale/Scope**: Single display page modification, minimal server changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution template has not been customized. General principles apply:

| Principle | Status | Notes |
|-----------|--------|-------|
| Simplicity | ✅ Pass | Replacing image with CSS - same complexity, different approach |
| Test coverage | ✅ Pass | Will add visual tests for wheel rendering |
| Clear boundaries | ✅ Pass | Display-only changes, dealer controls unchanged |

**No gate violations detected.**

## Project Structure

### Documentation (this feature)

```text
specs/003-css-roulette-wheel/
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
│   │   ├── constants.ts        # Update: add SPIN_CONFIG with min/max duration
│   │   └── state-machine.ts    # Update: send spin duration with wheel_update
│   └── websocket/
│       └── broadcast.ts        # Minor: include duration in spin messages

client/
├── src/
│   ├── routes/
│   │   └── display/
│   │       └── +page.svelte    # Major: replace wheel.png with CSS wheel component
│   ├── lib/
│   │   ├── components/
│   │   │   └── wheel/
│   │   │       └── CSSRouletteWheel.svelte  # New: CSS-drawn wheel with ball animation
│   │   └── stores/
│   │       └── game.ts                       # Minor: handle duration from server
│   └── static/
│       └── wheel.png                         # Remove: no longer needed
└── tests/
    └── wheel.spec.ts                         # New: visual tests for wheel
```

**Structure Decision**: Maintaining existing web application structure. Main change is replacing image-based wheel with a new CSS component. Server changes are minimal (adding configurable duration).

## Complexity Tracking

> No constitution violations to justify.

| Change | Rationale |
|--------|-----------|
| Pure CSS wheel | User clarification: CodePen-style CSS drawing preferred |
| Variable spin duration | Spec requirement for engaging user experience |
| New component | Encapsulates wheel rendering logic cleanly |
