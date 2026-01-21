# WebSocket Contracts: Simplified Roulette Display

**Date**: 2026-01-20
**Feature**: 002-display-dealer-only

## Connection

### Display Client

```
ws://localhost:3000/ws?type=display
```

Display clients are read-only and receive game state updates.

### Dealer Client

```
ws://localhost:3000/ws?type=dealer
```

Dealer clients can send control commands and receive game state + statistics.

## Message Format

All messages are JSON with a `type` field.

```typescript
interface Message {
  type: string;
  data?: unknown;
}
```

## Client → Server Messages (Dealer Only)

### bets_open

Signals that betting is now open on the physical table.

```json
{
  "type": "bets_open"
}
```

**Precondition**: Phase is `idle`
**Effect**: Phase → `betting_open`

### bets_close

Signals that betting is now closed.

```json
{
  "type": "bets_close"
}
```

**Precondition**: Phase is `betting_open`
**Effect**: Phase → `betting_closed`

### spin

Triggers the wheel spin animation with the winning number from the real table.

```json
{
  "type": "spin",
  "data": {
    "winningNumber": 17
  }
}
```

**Precondition**: Phase is `betting_closed`
**Validation**: `winningNumber` must be 0-36 inclusive
**Effect**: Phase → `spinning`, wheel animation starts

### new_round

Resets for the next round after showing results.

```json
{
  "type": "new_round"
}
```

**Precondition**: Phase is `showing_result`
**Effect**: Phase → `idle`, statistics updated

### end_session

Ends the current session.

```json
{
  "type": "end_session"
}
```

**Effect**: Session status → `ended`, all clients notified

## Server → Client Messages

### game_state

Full game state sync (sent on connect and major state changes).

```json
{
  "type": "game_state",
  "data": {
    "phase": "idle",
    "currentRound": 5,
    "lastResult": {
      "number": 17,
      "color": "black"
    },
    "hotNumbers": [17, 32, 5, 21, 0],
    "coldNumbers": [8, 24, 1, 13, 20]
  }
}
```

### phase_change

Notifies of game phase transition.

```json
{
  "type": "phase_change",
  "data": {
    "phase": "betting_open",
    "roundNumber": 6
  }
}
```

### wheel_update

Animation frame for wheel spin (broadcast at ~30fps during spin).

```json
{
  "type": "wheel_update",
  "data": {
    "wheelAngle": 12.566,
    "ballAngle": 18.849,
    "ballRadius": 120,
    "isSpinning": true
  }
}
```

### round_result

Announces the round result (after spin animation completes).

```json
{
  "type": "round_result",
  "data": {
    "roundNumber": 6,
    "winningNumber": 17,
    "winningColor": "black"
  }
}
```

**Note**: No `topWinners` field - removed per spec.

### stats_update (Dealer Only)

Updated round history for dealer statistics panel.

```json
{
  "type": "stats_update",
  "data": {
    "rounds": [
      {
        "roundNumber": 1,
        "winningNumber": 32,
        "winningColor": "red",
        "timestamp": "2026-01-20T14:30:00Z"
      },
      {
        "roundNumber": 2,
        "winningNumber": 17,
        "winningColor": "black",
        "timestamp": "2026-01-20T14:32:00Z"
      }
    ]
  }
}
```

### session_ended

Notifies all clients that the session has ended.

```json
{
  "type": "session_ended",
  "data": {
    "message": "Game session has ended. Thank you for playing!",
    "totalRounds": 42
  }
}
```

**Note**: No `topPlayer` field - removed per spec.

### error

Error response for invalid actions.

```json
{
  "type": "error",
  "code": "INVALID_STATE",
  "message": "Cannot spin while betting is open"
}
```

Error codes:
- `INVALID_STATE`: Action not valid for current game phase
- `INVALID_NUMBER`: Winning number out of range (0-36)
- `NOT_AUTHORIZED`: Dealer action attempted by display client
- `NO_SESSION`: No active session

## Removed Messages

The following message types from the original implementation are **removed**:

### Client → Server (Removed)
- `place_bet` - No betting
- `clear_bets` - No betting
- `rebet` - No betting

### Server → Client (Removed)
- `bet_confirmed` - No betting
- `bet_error` - No betting
- `balance_update` - No players
- `players_update` - No players
- `betting_locked` - Replaced by `phase_change`
- `betting_open` (old format) - Replaced by `phase_change`
- `countdown` - No automatic countdown

## Connection Lifecycle

### Display Client

1. Connect to `ws://host/ws?type=display`
2. Receive `game_state` with current state
3. Receive updates: `phase_change`, `wheel_update`, `round_result`
4. On disconnect: attempt reconnect with exponential backoff
5. On reconnect: receive fresh `game_state`

### Dealer Client

1. Connect to `ws://host/ws?type=dealer` (after HTTP auth)
2. Receive `game_state` with current state
3. Receive `stats_update` with round history
4. Send control messages: `bets_open`, `bets_close`, `spin`, `new_round`
5. Receive same updates as display plus `stats_update`

## State Diagram

```
                    ┌─────────────────┐
                    │      idle       │
                    └────────┬────────┘
                             │ bets_open
                             ▼
                    ┌─────────────────┐
                    │  betting_open   │
                    └────────┬────────┘
                             │ bets_close
                             ▼
                    ┌─────────────────┐
                    │ betting_closed  │
                    └────────┬────────┘
                             │ spin (with number)
                             ▼
                    ┌─────────────────┐
                    │    spinning     │
                    └────────┬────────┘
                             │ (animation complete)
                             ▼
                    ┌─────────────────┐
                    │ showing_result  │
                    └────────┬────────┘
                             │ new_round
                             ▼
                    ┌─────────────────┐
                    │      idle       │
                    └─────────────────┘
```
