# Data Model: Web-Based Roulette Game

**Date**: 2026-01-20
**Feature**: 001-web-roulette-game

## Entities

### Session

Represents a game session (typically one evening of play).

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| id | string | Unique session identifier | UUID format |
| createdAt | timestamp | When session started | Auto-generated |
| endedAt | timestamp | When session ended | null until ended |
| status | enum | Session state | "active" \| "ended" |
| dealerPassword | string | Hashed password for dealer auth | Required, min 4 chars |
| players | Player[] | All players in session | Array |
| rounds | Round[] | All rounds played | Array |

**State Transitions**:
```
[created] → active → ended
```

---

### Player

A participant with a unique username within the session.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| id | string | Unique player identifier | UUID format |
| sessionId | string | Parent session | Required |
| username | string | Display name | Required, unique per session, 1-20 chars |
| initialBalance | number | Starting points | 1-500 |
| currentBalance | number | Current point balance | >= 0 |
| totalSpent | number | Sum of all bets placed | >= 0 |
| totalEarnings | number | Sum of all winnings | >= 0 |
| joinedAt | timestamp | When player joined | Auto-generated |
| lastActiveAt | timestamp | Last activity time | Updated on actions |
| status | enum | Connection state | "active" \| "disconnected" |
| playerNumber | number | Sequential join order | Auto-increment from 1 |
| lastBets | Bet[] | Bets from previous round | For Re-Bet feature |

**Computed Fields**:
- `netEarnings`: totalEarnings - totalSpent
- `isActive`: status === "active" && lastActiveAt within 30 seconds

---

### Round

A single spin of the wheel.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| id | string | Unique round identifier | UUID format |
| sessionId | string | Parent session | Required |
| roundNumber | number | Sequential round number | Auto-increment from 1 |
| status | enum | Round state | See state machine below |
| winningNumber | number \| null | Result (0-36) | null until determined |
| winningColor | enum \| null | Result color | "red" \| "black" \| "green" \| null |
| bets | Bet[] | All bets for this round | Array |
| startedAt | timestamp | When spin initiated | Auto-generated |
| completedAt | timestamp | When result shown | null until complete |

**State Transitions**:
```
[created] → betting → countdown → spinning → showing_results → completed
                ↑                                      |
                └──────────────────────────────────────┘
                         (next round)
```

**Timing**:
- `betting`: Indefinite (until dealer presses spin)
- `countdown`: 5 seconds
- `spinning`: ~8-12 seconds (animation duration)
- `showing_results`: 30 seconds

---

### Bet

A wager placed by a player on a specific position.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| id | string | Unique bet identifier | UUID format |
| roundId | string | Parent round | Required |
| playerId | string | Betting player | Required |
| betType | enum | Type of bet | See bet types below |
| position | string | Specific position | Depends on betType |
| amount | number | Chip value wagered | 1 \| 5 \| 10 \| 25 \| 50 |
| payout | number | Amount won (0 if lost) | Calculated on result |
| isWinner | boolean | Whether bet won | Calculated on result |

**Bet Types and Positions**:

| betType | position format | Example | Payout |
|---------|-----------------|---------|--------|
| straight | "0" to "36" | "17" | 35:1 |
| red | "red" | "red" | 1:1 |
| black | "black" | "black" | 1:1 |
| odd | "odd" | "odd" | 1:1 |
| even | "even" | "even" | 1:1 |
| low | "1-18" | "1-18" | 1:1 |
| high | "19-36" | "19-36" | 1:1 |
| dozen | "1st12" \| "2nd12" \| "3rd12" | "1st12" | 2:1 |
| column | "col1" \| "col2" \| "col3" | "col1" | 2:1 |

---

### GameState

The current state shared across all connected pages.

| Field | Type | Description |
|-------|------|-------------|
| sessionId | string | Current session |
| roundId | string \| null | Current round (null between sessions) |
| phase | enum | Current game phase |
| countdownSeconds | number | Remaining countdown (0-5) |
| wheelAngle | number | Current wheel rotation (radians) |
| ballAngle | number | Current ball position (radians) |
| ballRadius | number | Ball distance from center |
| lastResult | object \| null | { number, color } |
| hotNumbers | number[] | 5 most frequent numbers |
| coldNumbers | number[] | 5 least frequent numbers |
| topWinners | object[] | Top 3 earners for current round |

**Phases**:
```typescript
type GamePhase =
  | "waiting"          // Between rounds, betting open
  | "countdown"        // 5-second countdown
  | "spinning"         // Wheel + ball animating
  | "showing_results"  // Results overlay visible
  | "session_ended"    // No more rounds
```

---

## Relationships

```
Session 1──────* Player
    │
    └──────────* Round 1──────* Bet *──────1 Player
```

- Session has many Players (unique username constraint)
- Session has many Rounds (sequential numbering)
- Round has many Bets
- Player has many Bets (across rounds)
- Bet belongs to one Round and one Player

---

## Roulette Number Reference

**Red Numbers**: 1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
**Black Numbers**: 2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35
**Green**: 0

**Column Layout**:
- Column 1 (col1): 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34
- Column 2 (col2): 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35
- Column 3 (col3): 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36

**Dozens**:
- 1st 12 (1st12): 1-12
- 2nd 12 (2nd12): 13-24
- 3rd 12 (3rd12): 25-36

---

## JSON Backup Schema

```json
{
  "session": {
    "id": "uuid",
    "createdAt": "ISO8601",
    "endedAt": "ISO8601 | null",
    "status": "active | ended"
  },
  "players": [
    {
      "id": "uuid",
      "username": "string",
      "playerNumber": 1,
      "initialBalance": 500,
      "finalBalance": 750,
      "totalSpent": 200,
      "totalEarnings": 450
    }
  ],
  "rounds": [
    {
      "roundNumber": 1,
      "winningNumber": 17,
      "winningColor": "black",
      "timestamp": "ISO8601",
      "bets": [
        {
          "playerId": "uuid",
          "betType": "straight",
          "position": "17",
          "amount": 10,
          "payout": 350
        }
      ]
    }
  ]
}
```

---

## TypeScript Types

```typescript
// Shared types (shared/types/index.ts)

export type SessionStatus = "active" | "ended";
export type PlayerStatus = "active" | "disconnected";
export type RoundStatus = "betting" | "countdown" | "spinning" | "showing_results" | "completed";
export type GamePhase = "waiting" | "countdown" | "spinning" | "showing_results" | "session_ended";
export type BetType = "straight" | "red" | "black" | "odd" | "even" | "low" | "high" | "dozen" | "column";
export type Color = "red" | "black" | "green";
export type ChipValue = 1 | 5 | 10 | 25 | 50;

export interface Session {
  id: string;
  createdAt: Date;
  endedAt: Date | null;
  status: SessionStatus;
  players: Player[];
  rounds: Round[];
}

export interface Player {
  id: string;
  sessionId: string;
  username: string;
  playerNumber: number;
  initialBalance: number;
  currentBalance: number;
  totalSpent: number;
  totalEarnings: number;
  joinedAt: Date;
  lastActiveAt: Date;
  status: PlayerStatus;
  lastBets: Bet[];
}

export interface Round {
  id: string;
  sessionId: string;
  roundNumber: number;
  status: RoundStatus;
  winningNumber: number | null;
  winningColor: Color | null;
  bets: Bet[];
  startedAt: Date;
  completedAt: Date | null;
}

export interface Bet {
  id: string;
  roundId: string;
  playerId: string;
  betType: BetType;
  position: string;
  amount: ChipValue;
  payout: number;
  isWinner: boolean;
}

export interface GameState {
  sessionId: string;
  roundId: string | null;
  phase: GamePhase;
  countdownSeconds: number;
  lastResult: { number: number; color: Color } | null;
  hotNumbers: number[];
  coldNumbers: number[];
  topWinners: { username: string; earnings: number }[];
}
```
