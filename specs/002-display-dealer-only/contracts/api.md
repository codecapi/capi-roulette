# API Contracts: Simplified Roulette Display

**Date**: 2026-01-20
**Feature**: 002-display-dealer-only

## REST API Endpoints

### Session Management

#### Create Session

Creates a new game session (requires dealer password).

```
POST /api/session
Content-Type: application/json

Request:
{
  "dealerPassword": "string"
}

Response 201:
{
  "sessionId": "string",
  "status": "active",
  "startTime": "ISO8601 datetime"
}

Response 401:
{
  "error": "Invalid dealer password"
}

Response 409:
{
  "error": "Session already active"
}
```

#### Get Session

Gets current session status.

```
GET /api/session

Response 200:
{
  "sessionId": "string",
  "status": "active" | "ended",
  "startTime": "ISO8601 datetime",
  "roundCount": number,
  "currentPhase": "idle" | "betting_open" | "betting_closed" | "spinning" | "showing_result"
}

Response 404:
{
  "error": "No active session"
}
```

### Dealer Authentication

#### Verify Dealer

Verifies dealer password for existing session.

```
POST /api/dealer/auth
Authorization: Basic base64(dealer:password)

Response 200:
{
  "authenticated": true
}

Response 401:
{
  "error": "Invalid credentials"
}
```

### Game State

#### Get Game State

Gets current game state for display.

```
GET /api/game/state

Response 200:
{
  "phase": "idle" | "betting_open" | "betting_closed" | "spinning" | "showing_result",
  "currentRound": number | null,
  "lastResult": {
    "number": number,
    "color": "red" | "black" | "green"
  } | null,
  "hotNumbers": number[],
  "coldNumbers": number[]
}
```

### Dealer Controls (HTTP fallback)

These actions are primarily via WebSocket but HTTP fallback available.

#### Open Betting

```
POST /api/dealer/bets-open
Authorization: Basic base64(dealer:password)

Response 200:
{
  "phase": "betting_open",
  "roundNumber": number
}

Response 400:
{
  "error": "Invalid state transition",
  "currentPhase": "string"
}
```

#### Close Betting

```
POST /api/dealer/bets-close
Authorization: Basic base64(dealer:password)

Response 200:
{
  "phase": "betting_closed"
}

Response 400:
{
  "error": "Invalid state transition"
}
```

#### Trigger Spin

```
POST /api/dealer/spin
Authorization: Basic base64(dealer:password)
Content-Type: application/json

Request:
{
  "winningNumber": number  // 0-36
}

Response 200:
{
  "phase": "spinning",
  "winningNumber": number,
  "winningColor": "red" | "black" | "green"
}

Response 400:
{
  "error": "Invalid winning number" | "Invalid state transition"
}
```

#### New Round

```
POST /api/dealer/new-round
Authorization: Basic base64(dealer:password)

Response 200:
{
  "phase": "idle",
  "roundNumber": number  // next round
}

Response 400:
{
  "error": "Invalid state transition"
}
```

#### Get Round History

```
GET /api/dealer/history
Authorization: Basic base64(dealer:password)

Response 200:
{
  "rounds": [
    {
      "roundNumber": number,
      "winningNumber": number,
      "winningColor": "red" | "black" | "green",
      "timestamp": "ISO8601 datetime"
    }
  ]
}
```

#### End Session

```
POST /api/dealer/end-session
Authorization: Basic base64(dealer:password)

Response 200:
{
  "status": "ended",
  "totalRounds": number
}
```

## Removed Endpoints

The following endpoints from the original implementation are **removed**:

- `GET /api/players` - No players
- `POST /api/players/join` - No player registration
- `POST /api/players/reconnect` - No players
- `GET /api/players/:playerId` - No players
