# Feature Specification: Web-Based Roulette Game

**Feature Branch**: `001-web-roulette-game`
**Created**: 2026-01-20
**Status**: Draft
**Input**: User description: "Web-based roulette game for company casino night party with display page, dealer controls, player betting interface, and real-time connectivity"

## Clarifications

### Session 2026-01-20

- Q: How long do players have to place bets between rounds? → A: Betting remains open until dealer presses spin (dealer controls pace entirely)
- Q: What constraints apply to player starting points? → A: Maximum 500 points (players may choose less). Chip values: white=1, red=5, blue=10, green=25, black=50
- Q: Should advanced bet types (splits, streets, corners, lines) be supported? → A: No, basic bets only
- Q: What happens when a player reconnects with the same username? → A: Restore previous balance and history (resume playing)
- Q: How does a session end? → A: Dealer explicitly ends session via control page button

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dealer Controls Game Flow (Priority: P1)

The dealer (croupier) manages the entire game session from a dedicated control page. They can start each round by pressing a large spin button, which triggers the roulette animation on the display and locks betting for all players. The dealer sees a list of all players who have joined the session, showing each player's name, current balance, spendings, and earnings. The list is sortable to help track player activity throughout the evening.

**Why this priority**: The game cannot function without dealer control. This is the central orchestration point that enables all other features.

**Independent Test**: Can be tested by accessing the dealer page, authenticating, and verifying the spin button triggers a round (even without players connected). Delivers the core game control capability.

**Acceptance Scenarios**:

1. **Given** a dealer accesses the dealer page URL, **When** they enter the correct password, **Then** they see the dealer control interface with the spin button
2. **Given** the dealer is on the control page, **When** they press the spin button, **Then** a new round begins and betting is locked for all connected players
3. **Given** players have joined the session, **When** the dealer views the player list, **Then** they see each player's number, name, spendings, and earnings
4. **Given** the dealer views the player list, **When** they click a column header, **Then** the list sorts by that column (number, name, spendings, or earnings)

---

### User Story 2 - Roulette Display Shows Game Animation (Priority: P1)

The roulette display page is shown on a TV or projector for all party guests to watch. It shows a realistic European-style roulette wheel that spins when a round starts. A ball enters the wheel, rolls around the track, and bounces across numbers before settling on the winning number. The page also shows the last result (number and color) and lists of hot numbers (frequently hit) and cold numbers (least frequent). Before each round, a 5-second countdown overlay appears to build anticipation.

**Why this priority**: This is the visual centerpiece of the casino night experience. Without it, players cannot see game results and the event loses its entertainment value.

**Independent Test**: Can be tested by loading the display page and triggering a round from dealer controls. The wheel animation plays and results display correctly.

**Acceptance Scenarios**:

1. **Given** the display page is loaded, **When** a round starts, **Then** a 5-second countdown overlay appears before the wheel begins spinning
2. **Given** the countdown completes, **When** the wheel spins, **Then** a ball enters the wheel, rolls around the track, and bounces realistically across numbers
3. **Given** the wheel is spinning, **When** the ball settles, **Then** the wheel gradually slows and stops with the ball on the winning number
4. **Given** a round completes, **When** the result is determined, **Then** the last result panel updates to show the winning number and its color (red, black, or green for zero)
5. **Given** multiple rounds have been played, **When** viewing the display, **Then** hot numbers (5 most frequent) and cold numbers (5 least frequent) are shown

---

### User Story 3 - Player Places Bets on Mobile (Priority: P1)

Players join the game using their mobile phones by visiting the player page URL. On first visit, they enter a username and starting point amount. The page then shows a traditional roulette betting table where players can place bets by selecting chip values and tapping betting positions. Players can re-do their last bet, clear their current bet, and see their balance, current bet amount, last win/loss, and total earnings/loss.

**Why this priority**: Without player betting capability, there is no game. This enables the core gambling experience.

**Independent Test**: Can be tested by accessing the player page, registering as a player, and placing bets on the table layout. Bet placement works independently of other pages.

**Acceptance Scenarios**:

1. **Given** a new player visits the player page, **When** they enter a username and starting points, **Then** they see the roulette betting table interface
2. **Given** a player is on the betting interface, **When** they select a chip value and tap a betting position, **Then** a chip is placed on that position and the current bet amount updates
3. **Given** a player has placed bets, **When** they tap the "Re-Bet" button, **Then** their previous round's bets are placed again
4. **Given** a player has placed bets, **When** they tap "Clear Bet", **Then** all current bets are removed and chips returned to their balance
5. **Given** a player has placed bets, **When** viewing their info panel, **Then** they see their username, balance, current bet amount, last win/loss, and total earnings/loss
6. **Given** a player selects different chip values (1, 5, 10, 25, or 50), **When** they place bets, **Then** the chip of that value and corresponding color is used

---

### User Story 4 - Results Display with Winners (Priority: P2)

When a round ends, a results overlay appears on the display page showing the winning number and color prominently. Below the result, the top three earning players from that round are shown. This creates excitement and recognition for winners. The overlay automatically closes after 30 seconds, returning to the ready state for the next round.

**Why this priority**: This enhances the entertainment experience but the game can technically function without showing top winners.

**Independent Test**: Can be tested by completing a round with multiple players who have bets, verifying the results overlay appears with correct winners.

**Acceptance Scenarios**:

1. **Given** a round completes, **When** the ball lands on a number, **Then** a results overlay appears showing the winning number and color prominently
2. **Given** players had winning bets, **When** the results overlay appears, **Then** the top three earners from that round are displayed with their names and winnings
3. **Given** the results overlay is displayed, **When** 30 seconds pass, **Then** the overlay automatically closes

---

### User Story 5 - Real-Time Synchronization (Priority: P1)

All pages (display, dealer, player) stay synchronized in real-time. When the dealer starts a round, all player pages lock betting and all displays show the countdown and animation simultaneously. When the ball lands, all pages see the result at the same time. Players and dealer can connect by being on the same local network.

**Why this priority**: Without synchronization, the multi-page experience falls apart. This is essential for the coordinated party experience.

**Independent Test**: Can be tested with multiple browser windows open to different pages, verifying actions on one page reflect on others within 1 second.

**Acceptance Scenarios**:

1. **Given** multiple devices are connected (display, dealer, players), **When** the dealer starts a round, **Then** all devices show the countdown within 1 second of each other
2. **Given** a round is in progress, **When** the wheel animation plays, **Then** all devices show synchronized animation state
3. **Given** betting is open, **When** a player places a bet, **Then** the dealer's player list updates to reflect current activity
4. **Given** a round completes, **When** the result is determined, **Then** all player balances update simultaneously

---

### User Story 6 - Session Data Backup (Priority: P3)

All game results and player data for the session are saved to a backup file. This preserves the record of the evening's games. The backup is updated after each round if performance allows, or can be manually triggered from the dealer page.

**Why this priority**: This is a nice-to-have for record keeping but does not affect core gameplay.

**Independent Test**: Can be tested by playing several rounds and verifying the backup file contains complete round and player data.

**Acceptance Scenarios**:

1. **Given** rounds have been played, **When** viewing the backup file, **Then** it contains all round results with timestamps
2. **Given** players participated, **When** viewing the backup file, **Then** it contains player names, final balances, and betting history
3. **Given** the dealer is on the control page, **When** they trigger a manual backup, **Then** the current session state is saved

---

### Edge Cases

- What happens when a player loses connection mid-round? Their existing bets remain valid for that round.
- What happens when a player reconnects with the same username? Their previous balance and history are restored, allowing them to resume playing.
- What happens when a player runs out of points? They can no longer place new bets but can watch the game.
- What happens when the dealer closes their browser? The current round completes but no new rounds can start until they reconnect.
- How does the system handle players with duplicate usernames? Usernames must be unique within a session; duplicate attempts are rejected with an error message.
- What happens if no players have placed bets when dealer spins? The round proceeds normally with no payouts.
- What happens when the display page loses connection? It reconnects automatically and syncs to current game state.
- What happens when the dealer ends the session? All players are notified, final backup is saved, and no new rounds can be started.

## Requirements *(mandatory)*

### Functional Requirements

**Display Page (Roulette View)**
- **FR-001**: System MUST display a European-style roulette wheel matching the provided design (wheel.png)
- **FR-002**: System MUST animate the wheel spinning with realistic physics (gradual acceleration and deceleration)
- **FR-003**: System MUST animate a ball entering the wheel, rolling around the track, and bouncing across numbers before settling
- **FR-004**: System MUST display the last winning number with its color (red, black, or green)
- **FR-005**: System MUST display a list of hot numbers (5 most frequently hit) and cold numbers (5 least frequently hit)
- **FR-006**: System MUST show a 5-second countdown overlay before each round begins
- **FR-007**: System MUST generate random results with equal probability for all 37 numbers (0-36)

**Dealer/Croupier Page**
- **FR-008**: System MUST require password authentication to access the dealer page
- **FR-009**: System MUST provide a prominent spin button to start new rounds
- **FR-010**: System MUST display a list of all players showing: sequential number, username, total spendings, and total earnings
- **FR-011**: System MUST allow sorting the player list by number, name, spendings, or earnings
- **FR-012**: System MUST distinguish between currently active players and all players who played today
- **FR-013**: System MUST provide a manual backup trigger option
- **FR-033**: System MUST provide an "End Session" button that finalizes the session, saves the backup, and notifies all connected players

**Player Page**
- **FR-014**: System MUST prompt new players to enter a username and starting point amount (1-500 points)
- **FR-015**: System MUST display a roulette betting table layout matching the provided design (player-page.png)
- **FR-016**: System MUST provide chip value selection options: 1 (white), 5 (red), 10 (blue), 25 (green), 50 (black)
- **FR-017**: System MUST allow players to place bets on: individual numbers (0-36), red/black, odd/even, 1-18/19-36, dozens (1st/2nd/3rd 12), columns (2to1)
- **FR-018**: System MUST provide a "Re-Bet" button to repeat the previous round's bets
- **FR-019**: System MUST provide a "Clear Bet" button to remove all current bets
- **FR-020**: System MUST display: username, current balance, current bet amount, last win/loss, and total earnings/loss
- **FR-021**: System MUST prevent betting when a round is in progress (from spin button press until results overlay closes)
- **FR-022**: System MUST enforce that players cannot bet more than their available balance
- **FR-032**: System MUST keep betting open indefinitely between rounds until dealer presses spin (no automatic timer)

**Results Display**
- **FR-023**: System MUST show a results overlay displaying the winning number and color prominently
- **FR-024**: System MUST show the top three player earners for the round on the results overlay
- **FR-025**: System MUST automatically close the results overlay after 30 seconds

**Real-Time Connectivity**
- **FR-026**: System MUST synchronize all connected pages in real-time (within 1 second)
- **FR-027**: System MUST work when all devices are connected to the same local network
- **FR-028**: System MUST handle device disconnection and reconnection gracefully

**Data Persistence**
- **FR-029**: System MUST save session data to a backup file
- **FR-030**: System MUST include all round results and player data in the backup

**Payout Calculations**
- **FR-031**: System MUST calculate payouts using standard European roulette odds:
  - Single number (straight up): 35 to 1
  - Red/Black, Odd/Even, 1-18/19-36: 1 to 1
  - Dozens (1st/2nd/3rd 12): 2 to 1
  - Columns (2to1): 2 to 1

### Key Entities

- **Session**: Represents a game session (typically one evening); contains all rounds and player registrations for that session
- **Player**: A participant with a unique username within the session; tracks balance, total spendings, total earnings, and bet history
- **Round**: A single spin of the wheel; includes timestamp, winning number, winning color, and all player bets for that round
- **Bet**: A wager placed by a player; includes bet type (number, color, dozen, etc.), position, chip value, and outcome (win/loss amount)
- **Game State**: The current state of the game (waiting for bets, countdown, spinning, showing results); shared across all connected pages

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All connected devices display synchronized game state within 1 second of any state change
- **SC-002**: The roulette wheel animation plays smoothly at 30+ frames per second on standard devices
- **SC-003**: 100% of winning bets receive correct payouts according to standard European roulette odds
- **SC-004**: Players can place a bet within 3 taps/clicks from the betting interface
- **SC-005**: The game supports at least 20 concurrent players without degradation
- **SC-006**: Session backup file is recoverable and contains complete game history
- **SC-007**: New players can join and start betting within 30 seconds of first visiting the page
- **SC-008**: The results overlay displays within 2 seconds of the ball settling on a number
- **SC-009**: Random number generation produces statistically fair results (within expected variance over 1000+ spins)
- **SC-010**: The dealer can start a new round within 5 seconds of the previous round's results overlay closing

## Assumptions

- All participants have smartphones or devices with modern web browsers capable of displaying animations
- All devices (display TV/projector, dealer device, player phones) are connected to the same local WiFi network
- The party environment has reliable WiFi connectivity
- Points are used as a fun/social currency; no real money is involved
- A European-style wheel (single zero) is used rather than American (double zero)
- The backup file format is JSON, human-readable for potential manual review
- Password for dealer access will be set during initial configuration
- Hot/cold numbers are calculated based on all rounds in the current session
- The 5-second countdown is a fixed duration (not configurable)
- The 30-second results overlay duration is a fixed duration (not configurable)
- Advanced bet types (split, street, corner, line, basket) are out of scope; only basic bets supported
