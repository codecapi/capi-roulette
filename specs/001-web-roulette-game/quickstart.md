# Quickstart: Web-Based Roulette Game

## Prerequisites

- **Bun** 1.1+ ([install](https://bun.sh/docs/installation))
- Modern web browser (Chrome, Safari, Firefox)
- Local network (WiFi) for multiplayer

## Setup

```bash
# Clone/navigate to project
cd capi-roulette/app

# Install dependencies
bun install

# Copy environment template
cp .env.example .env

# Edit .env to set dealer password
# DEALER_PASSWORD=your-secret-password
```

## Development

```bash
# Start development server (frontend + backend)
bun run dev

# This starts:
# - Backend: http://localhost:3000
# - Frontend: http://localhost:5173 (with HMR)
```

## Production

```bash
# Build frontend
bun run build

# Start production server
bun run start

# Server runs on http://localhost:3000
# All pages served from this single URL
```

## Accessing the Game

Once running, access different pages:

| Page | URL | Purpose |
|------|-----|---------|
| Display | http://localhost:3000/display | TV/projector view with wheel |
| Dealer | http://localhost:3000/dealer | Dealer control panel (password required) |
| Player | http://localhost:3000/play | Mobile betting interface |

### For Party Setup

1. **Find your local IP**: Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. **Share with players**: `http://YOUR_IP:3000/play`
3. **Display on TV**: Open `http://YOUR_IP:3000/display` on TV browser or connected laptop

## Game Flow

### Starting a Session

1. Open dealer page: `/dealer`
2. Enter dealer password
3. Session starts automatically

### Players Joining

1. Players visit `/play` on their phones
2. Enter username (1-20 characters)
3. Enter starting points (1-500)
4. Start betting!

### Running a Round

1. **Dealer**: Wait for players to place bets
2. **Dealer**: Press "SPIN" button
3. **All**: Watch 5-second countdown
4. **All**: Watch wheel animation
5. **All**: See results (30 seconds)
6. Repeat!

### Ending the Session

1. **Dealer**: Press "End Session"
2. All players notified
3. Backup file saved automatically

## File Structure

```
app/
├── server/
│   └── src/
│       ├── index.ts        # Entry point
│       ├── game/           # Game logic
│       ├── websocket/      # Real-time handlers
│       └── routes/         # HTTP endpoints
├── client/
│   └── src/
│       ├── routes/         # SvelteKit pages
│       │   ├── display/    # TV view
│       │   ├── dealer/     # Control panel
│       │   └── play/       # Mobile betting
│       └── lib/
│           ├── canvas/     # Wheel animation
│           └── stores/     # Game state
├── shared/
│   └── types/              # TypeScript types
└── backups/                # Session JSON files
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | Server port |
| DEALER_PASSWORD | (required) | Password for dealer auth |
| BACKUP_DIR | ./backups | Backup file location |

### Game Settings (server/src/config.ts)

```typescript
export const config = {
  countdown: 5,           // Seconds before spin
  resultDisplay: 30,      // Seconds to show results
  maxPlayers: 50,         // Max concurrent players
  maxStartingBalance: 500,// Max starting points
  chipValues: [1, 5, 10, 25, 50],
};
```

## Testing

```bash
# Run unit tests
bun test

# Run E2E tests (requires server running)
bun run test:e2e

# Run specific test file
bun test server/src/game/payout.test.ts
```

## Troubleshooting

### Players can't connect
- Ensure all devices are on same WiFi network
- Check firewall isn't blocking port 3000
- Verify using correct IP address (not localhost)

### Animation is laggy
- Reduce number of spectators on display page
- Close other browser tabs
- Check device isn't in power-saving mode

### WebSocket disconnects
- Auto-reconnect is built-in (5 second retry)
- Player state is preserved on reconnect
- If persistent issues, restart server

## Design Assets

Place provided design images in `client/static/`:
- `wheel.png` - Roulette wheel image
- `player-page.png` - Reference for betting table
- `last-result-hot-cold-numers.png` - Reference for results display

## Support

For issues or questions, check:
- `specs/001-web-roulette-game/spec.md` - Full requirements
- `specs/001-web-roulette-game/contracts/` - API documentation
