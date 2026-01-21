# Research: Simplified Roulette Display for Real Table

**Date**: 2026-01-20
**Feature**: 002-display-dealer-only

## Overview

This document captures research findings for simplifying the existing roulette application from a full player-betting system to a display-only companion for a real physical roulette table.

## Research Areas

### 1. Wheel Animation with Static Image

**Decision**: Use CSS transforms to rotate the wheel.png image

**Rationale**:
- The spec requires using the provided wheel.png image exactly
- CSS transform: rotate() provides smooth 60fps animation with GPU acceleration
- No need for canvas-based rendering for a static image rotation
- Simpler implementation than the current WheelCanvas.svelte approach

**Alternatives Considered**:
- Canvas animation of wheel.png: Unnecessary complexity for a single rotating image
- Keep existing canvas wheel: Violates spec requirement to use provided design
- WebGL/Three.js: Massive overkill for 2D rotation

**Implementation Notes**:
```css
/* Example approach */
.wheel {
  transition: transform 10s cubic-bezier(0.17, 0.67, 0.12, 0.99);
}
.wheel.spinning {
  transform: rotate(var(--target-angle));
}
```

### 2. Hot/Cold Numbers Display Design

**Decision**: Replicate exact layout from last-result-hot-cold-numers.png

**Rationale**:
- Spec explicitly requires matching the design
- Design shows vertical layout with colored circles
- Numbers colored based on roulette color (red/black/green)

**Design Analysis** (from image):
- "LAST RESULT:" header with large number (e.g., "17") and color label (e.g., "BLACK")
- Two columns: HOT NUMBERS (left, warm red tint) and COLD NUMBERS (right, cool blue tint)
- Each column shows 5 numbers vertically in colored circles
- Number colors: red numbers get red circle, black numbers get dark circle, zero gets green

**Implementation Notes**:
- Use Tailwind for styling consistency
- Red tint background: `bg-gradient-to-b from-red-900/50 to-red-950/50`
- Blue tint background: `bg-gradient-to-b from-blue-900/50 to-blue-950/50`
- Number circles sized appropriately for TV display visibility

### 3. Game State Machine Changes

**Decision**: New state flow with explicit dealer controls

**Current States** (to be modified):
```
waiting → countdown → spinning → showing_results → waiting
```

**New States** (per spec FR-016):
```
idle → betting_open → betting_closed → spinning → showing_result → idle
```

**Rationale**:
- Real table scenario needs explicit "Bets Open" announcement
- "Bets Close" is distinct from starting the spin (dealer may want to delay)
- Automatic countdown removed - dealer controls timing
- Manual winning number entry instead of RNG

**State Transitions**:
| From | Action | To |
|------|--------|-----|
| idle | Dealer: "Bets Open" | betting_open |
| betting_open | Dealer: "Bets Close" | betting_closed |
| betting_closed | Dealer: "Spin" + number | spinning |
| spinning | Animation complete | showing_result |
| showing_result | Dealer: "New Round" | idle |

### 4. WebSocket Message Types (Simplified)

**Decision**: Remove player-related messages, add new dealer control messages

**Messages to Remove**:
- `place_bet`, `clear_bets`, `rebet` (player actions)
- `balance_update`, `bet_confirmed`, `bet_error` (player feedback)
- `players_update` (dealer player list)
- Client type `player`

**Messages to Add/Modify**:
| Type | Direction | Purpose |
|------|-----------|---------|
| `bets_open` | Server→Display | Signal betting phase started |
| `bets_close` | Server→Display | Signal betting phase ended |
| `spin` | Dealer→Server | Start spin with winning number |
| `new_round` | Dealer→Server | Reset to idle state |
| `round_result` | Server→Display | Result with number, color (no winners) |
| `stats_update` | Server→Dealer | Round history for statistics panel |

### 5. Statistics Tracking (Dealer Panel)

**Decision**: Server tracks rounds with timestamps, broadcasts to dealer

**Data Structure**:
```typescript
interface RoundHistory {
  roundNumber: number;
  winningNumber: number;
  winningColor: 'red' | 'black' | 'green';
  timestamp: Date;
}
```

**Rationale**:
- Spec FR-012 requires statistics section with round history
- Simple append-only list sufficient
- No persistence needed beyond session (per assumptions)

### 6. Removal Strategy

**Decision**: Delete files completely, don't comment out

**Files to Delete**:
- `server/src/routes/players.ts`
- `server/src/websocket/handlers/player.ts`
- `server/src/game/rng.ts`
- `server/src/game/bet-validator.ts`
- `server/src/game/payout.ts`
- `client/src/routes/play/+page.svelte`
- `client/src/routes/play/` (entire directory)

**Files to Heavily Modify**:
- `server/src/game/session-store.ts` - Remove all player-related functions
- `server/src/game/state-machine.ts` - New state flow, manual number
- `client/src/routes/display/+page.svelte` - Use design images
- `client/src/routes/dealer/+page.svelte` - New controls, remove player list

**Rationale**:
- Clean codebase without dead code
- Easier to maintain
- No confusion about what's active

### 7. Display Page Layout

**Decision**: Two-column layout with wheel left, stats right

**Layout Analysis** (combining design requirements):
```
+------------------------------------------+
|              CAPI ROULETTE               |
+------------------------------------------+
|                  |  LAST RESULT:         |
|                  |     17 BLACK          |
|    [wheel.png]   |----------------------|
|                  | HOT      | COLD      |
|                  | NUMBERS  | NUMBERS   |
|                  | 32 5 21  | 8 24 1    |
|                  | 10 0     | 13 20     |
+------------------------------------------+
|        Phase: BETTING OPEN               |
+------------------------------------------+
```

**Rationale**:
- Wheel is primary visual focus (larger, left side)
- Stats panel matches provided design layout
- Phase indicator clearly visible at bottom
- Optimized for TV/projector viewing

## Dependencies & Best Practices

### Svelte 5 Runes

The existing codebase uses Svelte 5 runes (`$state`, `$derived`, `$effect`). Continue using:
- `$state()` for reactive component state
- `$derived` for computed values
- `$effect()` for side effects

### Tailwind CSS 4

Using Tailwind 4 with Vite plugin. Key considerations:
- Use `@theme` for CSS variables
- Utility-first approach
- No `@apply` needed with component patterns

### WebSocket Reconnection

Existing implementation has reconnection logic. Ensure:
- Auto-reconnect on disconnect (FR-020)
- Visual indicator when disconnected
- State resync on reconnect

## Conclusion

All technical unknowns have been resolved. The implementation is a simplification of existing code with new UI components matching provided designs. No new dependencies required.
