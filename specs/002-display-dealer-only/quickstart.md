# Quickstart: Simplified Roulette Display

**Date**: 2026-01-20
**Feature**: 002-display-dealer-only

## Prerequisites

- Bun 1.1+ installed
- Node.js 18+ (for some tooling)

## Development Setup

```bash
# Navigate to app directory
cd app

# Install dependencies
bun install
cd client && bun install && cd ..

# Start development server (both server + client)
bun run dev
```

This starts:
- Server at `http://localhost:3000`
- Client dev server at `http://localhost:5173` (proxied through server)

## Usage

### Display Screen (TV/Projector)

Open in browser on the display device:
```
http://localhost:3000/display
```

This shows:
- Roulette wheel (using wheel.png)
- Last result with color
- Hot/Cold numbers panel
- Current game phase indicator

### Dealer Controls (Tablet/Phone)

Open in browser on dealer device:
```
http://localhost:3000/dealer
```

1. Enter dealer password (default: `dealer123` for dev)
2. Use control buttons:
   - **Bets Open** - Signal betting has started
   - **Bets Close** - Signal betting has ended
   - **Spin** - Enter winning number (0-36), triggers animation
   - **New Round** - Reset for next round
3. View round history in statistics section

## Game Flow

```
1. Dealer presses "Bets Open"
   → Display shows "BETTING OPEN"

2. Players place bets on physical table

3. Dealer presses "Bets Close"
   → Display shows "BETTING CLOSED"

4. Real table wheel is spun, ball lands

5. Dealer enters winning number and presses "Spin"
   → Display shows wheel animation
   → Animation settles on winning number
   → Display shows result with color

6. Dealer presses "New Round"
   → Statistics updated
   → Ready for next round
```

## Production Build

```bash
# Build client
bun run build

# Start production server
bun run start
```

Server serves built client from `/client/build/`.

## Testing

```bash
# Run server tests
bun test

# Run e2e tests
bun run test:e2e
```

## Configuration

### Dealer Password

Set via environment variable:
```bash
DEALER_PASSWORD=your_secure_password bun run start
```

Default for development: `dealer123`

### Port

Default: 3000. Change via:
```bash
PORT=8080 bun run start
```

## File Structure

```
app/
├── server/
│   └── src/
│       ├── index.ts          # Entry point
│       ├── server.ts         # HTTP + WebSocket server
│       ├── game/             # Game logic
│       ├── routes/           # HTTP endpoints
│       └── websocket/        # WebSocket handlers
├── client/
│   └── src/
│       ├── routes/
│       │   ├── display/      # TV display page
│       │   └── dealer/       # Dealer control panel
│       ├── lib/
│       │   ├── components/   # Svelte components
│       │   ├── stores/       # State management
│       │   └── services/     # WebSocket client
│       └── static/           # Design images
└── specs/
    └── 002-display-dealer-only/
        └── [design docs]
```

## Key Components

### Display Page
- `WheelDisplay.svelte` - Wheel image with CSS rotation animation
- `StatsPanel.svelte` - Hot/Cold numbers matching design
- `ResultsOverlay.svelte` - Result announcement

### Dealer Panel
- Game control buttons (state-aware enabling)
- Winning number input (0-36 validation)
- Round history table with timestamps

## Troubleshooting

### Display not updating
- Check WebSocket connection (browser console)
- Verify dealer and display are on same server
- Check network/firewall if on different devices

### Wheel animation not smooth
- Ensure CSS transitions are working
- Check GPU acceleration in browser

### Invalid state errors
- Follow the correct game flow sequence
- Check current phase before actions
