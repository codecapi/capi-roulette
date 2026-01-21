# Data Model: Simplified Roulette Display for Real Table

**Date**: 2026-01-20
**Feature**: 002-display-dealer-only

## Overview

Simplified data model for display-only roulette companion. All player-related entities removed.

## Entities

### Session

Represents a single game session from start to end.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | string | Unique session identifier | UUID format |
| status | enum | Current session status | 'active' \| 'ended' |
| startTime | Date | When session started | Required |
| endTime | Date \| null | When session ended | Null while active |
| rounds | Round[] | All rounds in session | Ordered by roundNumber |

**Validation Rules**:
- Only one active session at a time
- Cannot modify ended session
- Rounds only added to active session

### Round

Represents a single spin of the roulette wheel.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | string | Unique round identifier | UUID format |
| roundNumber | number | Sequential round number | Starts at 1, auto-increment |
| winningNumber | number \| null | The result (0-36) | Null until spin triggered |
| winningColor | enum \| null | Color of winning number | 'red' \| 'black' \| 'green' \| null |
| status | enum | Current round status | See state machine |
| createdAt | Date | When round was created | Auto-set |
| completedAt | Date \| null | When round completed | Null until complete |

**Validation Rules**:
- winningNumber must be 0-36 inclusive
- winningColor derived from winningNumber (not stored separately, computed)
- Cannot modify completed round

**Color Mapping** (European Roulette):
```
Green: 0
Red: 1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
Black: 2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35
```

### GameState

Current state of the game (derived, not stored).

| Field | Type | Description |
|-------|------|-------------|
| phase | enum | Current game phase |
| currentRound | number \| null | Current round number |
| lastResult | LastResult \| null | Previous round result |
| hotNumbers | number[] | Top 5 most frequent numbers |
| coldNumbers | number[] | Top 5 least frequent numbers |

### LastResult

Display data for most recent result.

| Field | Type | Description |
|-------|------|-------------|
| number | number | Winning number (0-36) |
| color | enum | 'red' \| 'black' \| 'green' |

### RoundHistory (Dealer View)

Statistics entry for dealer panel.

| Field | Type | Description |
|-------|------|-------------|
| roundNumber | number | Round identifier |
| winningNumber | number | Result |
| winningColor | enum | Color of result |
| timestamp | Date | When round completed |

## State Machine

### Game Phases

```
idle → betting_open → betting_closed → spinning → showing_result → idle
```

| Phase | Description | Valid Actions |
|-------|-------------|---------------|
| idle | Waiting for dealer to start | Dealer: "Bets Open" |
| betting_open | Betting is open on physical table | Dealer: "Bets Close" |
| betting_closed | Betting closed, ready for spin | Dealer: "Spin" (with number) |
| spinning | Wheel animation in progress | None (wait for animation) |
| showing_result | Displaying result | Dealer: "New Round" |

### State Transitions

```typescript
type GamePhase = 'idle' | 'betting_open' | 'betting_closed' | 'spinning' | 'showing_result';

const transitions: Record<GamePhase, GamePhase[]> = {
  idle: ['betting_open'],
  betting_open: ['betting_closed'],
  betting_closed: ['spinning'],
  spinning: ['showing_result'],
  showing_result: ['idle'],
};
```

## Removed Entities

The following entities from the original implementation are **removed**:

- **Player**: No player registration
- **Bet**: No betting through the app
- **BetType**: Not needed
- **PlayerBalance**: Not tracked

## Relationships

```
Session 1──* Round
```

Simple one-to-many: A session contains multiple rounds.

## Computed Values

### Hot Numbers

Top 5 most frequently hit numbers in the session.

```typescript
function getHotNumbers(rounds: Round[]): number[] {
  const counts = new Map<number, number>();
  for (const round of rounds) {
    if (round.winningNumber !== null) {
      counts.set(round.winningNumber, (counts.get(round.winningNumber) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([num]) => num);
}
```

### Cold Numbers

Top 5 least frequently hit numbers (numbers that haven't appeared or appeared least).

```typescript
function getColdNumbers(rounds: Round[]): number[] {
  const counts = new Map<number, number>();
  // Initialize all numbers with 0
  for (let i = 0; i <= 36; i++) {
    counts.set(i, 0);
  }
  // Count occurrences
  for (const round of rounds) {
    if (round.winningNumber !== null) {
      counts.set(round.winningNumber, counts.get(round.winningNumber)! + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => a[1] - b[1])
    .slice(0, 5)
    .map(([num]) => num);
}
```

## Type Definitions

```typescript
// Shared types (server + client)

export type GamePhase = 'idle' | 'betting_open' | 'betting_closed' | 'spinning' | 'showing_result';

export type Color = 'red' | 'black' | 'green';

export type SessionStatus = 'active' | 'ended';

export type RoundStatus = 'betting' | 'closed' | 'spinning' | 'showing_result' | 'completed';

export interface Session {
  id: string;
  status: SessionStatus;
  startTime: Date;
  endTime: Date | null;
  rounds: Round[];
}

export interface Round {
  id: string;
  roundNumber: number;
  winningNumber: number | null;
  winningColor: Color | null;
  status: RoundStatus;
  createdAt: Date;
  completedAt: Date | null;
}

export interface GameState {
  phase: GamePhase;
  currentRound: number | null;
  lastResult: { number: number; color: Color } | null;
  hotNumbers: number[];
  coldNumbers: number[];
}

export interface RoundHistory {
  roundNumber: number;
  winningNumber: number;
  winningColor: Color;
  timestamp: Date;
}
```
