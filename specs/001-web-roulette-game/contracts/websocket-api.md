# WebSocket API Contract

**Protocol**: WebSocket (ws:// or wss://)
**Endpoint**: `ws://localhost:3000/ws`
**Format**: JSON messages

## Connection

### Connect
```
ws://localhost:3000/ws?type={clientType}&playerId={playerId}
```

**Query Parameters**:
| Parameter | Required | Values | Description |
|-----------|----------|--------|-------------|
| type | Yes | `display`, `dealer`, `player` | Client type |
| playerId | If player | UUID | Player ID from /api/players/join |

### Connection Response
```json
{
  "type": "connected",
  "clientId": "uuid",
  "gameState": { /* current GameState */ }
}
```

---

## Server → Client Messages

### Game State Update
Sent when game state changes. All clients receive this.

```json
{
  "type": "game_state",
  "data": {
    "sessionId": "uuid",
    "roundId": "uuid | null",
    "phase": "waiting | countdown | spinning | showing_results | session_ended",
    "countdownSeconds": 5,
    "lastResult": { "number": 17, "color": "black" },
    "hotNumbers": [17, 32, 5, 21, 0],
    "coldNumbers": [8, 24, 1, 13, 20],
    "topWinners": [
      { "username": "Alice", "earnings": 350 },
      { "username": "Bob", "earnings": 175 }
    ]
  }
}
```

### Countdown Tick
Sent every second during countdown phase.

```json
{
  "type": "countdown",
  "seconds": 4
}
```

### Wheel Animation
Sent during spinning phase (~30fps).

```json
{
  "type": "wheel_update",
  "data": {
    "wheelAngle": 3.14159,
    "ballAngle": 1.5708,
    "ballRadius": 120,
    "isSpinning": true
  }
}
```

### Round Result
Sent when ball settles.

```json
{
  "type": "round_result",
  "data": {
    "roundNumber": 5,
    "winningNumber": 17,
    "winningColor": "black",
    "topWinners": [
      { "username": "Alice", "earnings": 350, "rank": 1 },
      { "username": "Bob", "earnings": 175, "rank": 2 },
      { "username": "Carol", "earnings": 50, "rank": 3 }
    ]
  }
}
```

### Player Balance Update
Sent to specific player after round completes.

```json
{
  "type": "balance_update",
  "data": {
    "currentBalance": 650,
    "lastWin": 350,
    "totalSpent": 100,
    "totalEarnings": 450
  }
}
```

### Player List Update (Dealer Only)
Sent to dealer when player list changes.

```json
{
  "type": "players_update",
  "data": {
    "players": [
      {
        "playerNumber": 1,
        "username": "Alice",
        "currentBalance": 650,
        "totalSpent": 100,
        "totalEarnings": 450,
        "status": "active",
        "currentBetAmount": 25
      }
    ],
    "activeCount": 15,
    "totalCount": 20
  }
}
```

### Betting Locked
Sent when dealer starts spin.

```json
{
  "type": "betting_locked",
  "roundId": "uuid"
}
```

### Betting Open
Sent when new round begins.

```json
{
  "type": "betting_open",
  "roundId": "uuid"
}
```

### Session Ended
Sent when dealer ends session.

```json
{
  "type": "session_ended",
  "data": {
    "message": "Game session has ended. Thank you for playing!",
    "finalStats": {
      "totalRounds": 25,
      "topPlayer": { "username": "Alice", "netEarnings": 350 }
    }
  }
}
```

### Error
Sent on error conditions.

```json
{
  "type": "error",
  "code": "INSUFFICIENT_BALANCE",
  "message": "Not enough points to place this bet"
}
```

**Error Codes**:
| Code | Description |
|------|-------------|
| BETTING_CLOSED | Attempted bet while round in progress |
| INSUFFICIENT_BALANCE | Bet exceeds available balance |
| INVALID_BET | Invalid bet type or position |
| SESSION_ENDED | Action attempted after session end |
| UNAUTHORIZED | Dealer action without auth |

---

## Client → Server Messages

### Place Bet (Player)
```json
{
  "type": "place_bet",
  "data": {
    "betType": "straight",
    "position": "17",
    "amount": 10
  }
}
```

**Response**: `balance_update` or `error`

### Clear Bets (Player)
```json
{
  "type": "clear_bets"
}
```

**Response**: `balance_update`

### Re-Bet (Player)
```json
{
  "type": "rebet"
}
```

**Response**: `balance_update` or `error` (if insufficient balance)

### Start Spin (Dealer)
```json
{
  "type": "start_spin"
}
```

**Response**: Broadcasts `betting_locked`, `countdown`, then `wheel_update` stream

### End Session (Dealer)
```json
{
  "type": "end_session"
}
```

**Response**: Broadcasts `session_ended` to all clients

### Heartbeat
Sent by clients to maintain connection.

```json
{
  "type": "ping"
}
```

**Response**:
```json
{
  "type": "pong"
}
```

---

## Message Flow Examples

### Round Lifecycle

```
1. Dealer connects → receives current game_state
2. Players connect → each receives current game_state
3. Players place bets → each receives balance_update
4. Dealer starts spin → all receive betting_locked
5. All receive countdown (5, 4, 3, 2, 1)
6. All receive wheel_update stream (~8-12 seconds)
7. All receive round_result
8. Players receive individual balance_update
9. Dealer receives players_update
10. After 30s → all receive game_state (phase: waiting)
11. All receive betting_open
```

### Player Reconnection

```
1. Player connects with existing playerId
2. Server restores player state
3. Player receives connected with restored balance
4. Player receives current game_state
5. If betting open, player can place bets immediately
```

---

## Pub/Sub Topics (Internal)

Used by Bun WebSocket pub/sub:

| Topic | Subscribers | Purpose |
|-------|-------------|---------|
| `game-state` | All clients | Game state broadcasts |
| `dealer` | Dealer only | Player list updates |
| `player:{playerId}` | Specific player | Balance updates |
