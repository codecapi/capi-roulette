# Feature Specification: Simplified Roulette Display for Real Table

**Feature Branch**: `002-display-dealer-only`
**Created**: 2026-01-20
**Status**: Clarified
**Input**: User description: "Simplified roulette display for real table - display and dealer controls only, using provided design images"

## Overview

This feature simplifies the existing roulette application to support a **real physical roulette table** scenario. The application will serve as a visual display companion showing the wheel animation, last result, and hot/cold number statistics. Players place bets on the physical table, so all player/betting functionality is removed.

**Key Changes from Original**:
- Remove player page (`/play`) entirely
- Remove player list and score tracking
- Remove winner overlay after rounds
- Simplify dealer panel to game controls only
- Use provided design images for display layout
- Add explicit dealer controls: Bets Open, Bets Close, Spin, New Round

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dealer Controls Game Flow (Priority: P1)

The dealer operates a real roulette table and uses the web application on a tablet/phone to control what appears on the display screen. They need simple, clear buttons to advance through the game phases: opening bets, closing bets, triggering the wheel spin animation, and starting a new round.

**Why this priority**: Without dealer controls, the display cannot function. This is the core interaction that drives the entire system.

**Independent Test**: Open dealer panel, press each control button in sequence - display should respond to each action with appropriate visual state changes.

**Acceptance Scenarios**:

1. **Given** dealer is authenticated, **When** they press "Bets Open", **Then** display shows betting is open
2. **Given** betting is open, **When** dealer presses "Bets Close", **Then** display shows betting is closed
3. **Given** betting is closed, **When** dealer presses "Spin" and enters the winning number, **Then** display shows wheel animation and result
4. **Given** result is showing, **When** dealer presses "New Round", **Then** display resets to waiting state with updated statistics

---

### User Story 2 - Display Shows Wheel and Result (Priority: P1)

A TV/projector connected to the display page shows the roulette wheel (using the provided wheel.png design), the last winning number with its color, and hot/cold number statistics. The layout must match the provided design images.

**Why this priority**: The display is the primary value of the application - it's what all players at the table see.

**Independent Test**: Load display page, verify wheel image appears as designed, trigger a result and verify it displays correctly with proper colors.

**Acceptance Scenarios**:

1. **Given** display page is loaded, **When** viewing the screen, **Then** the roulette wheel image (wheel.png) is prominently displayed
2. **Given** a round result is announced, **When** the winning number is displayed, **Then** it shows with the correct color (red/black/green) matching the design
3. **Given** multiple rounds have been played, **When** viewing the statistics panel, **Then** hot numbers (most frequent) and cold numbers (least frequent) are displayed matching the design layout

---

### User Story 3 - Statistics Tracking (Priority: P2)

The dealer panel shows a log of round results with timestamps, allowing the dealer to review the session history. The display shows aggregated hot/cold statistics.

**Why this priority**: Enhances the experience but game can function without historical tracking.

**Independent Test**: Play several rounds, verify dealer panel shows chronological history and display shows correct hot/cold calculations.

**Acceptance Scenarios**:

1. **Given** rounds have been played, **When** dealer views control panel, **Then** a statistics section shows each round's result and timestamp
2. **Given** the same number hits multiple times, **When** viewing hot numbers, **Then** that number appears in the hot numbers list
3. **Given** a number hasn't been hit in many rounds, **When** viewing cold numbers, **Then** that number appears in the cold numbers list

---

### Edge Cases

- What happens when dealer tries to spin before closing bets? System should prevent this with appropriate feedback.
- How does display handle WebSocket disconnection? Auto-reconnect with visual indicator.
- What if dealer enters an invalid winning number? Validation must accept only 0-36.
- What happens if session ends mid-round? Display should show session ended state.

## Requirements *(mandatory)*

### Functional Requirements

**Display Page Requirements**:
- **FR-001**: Display MUST show the roulette wheel using the provided wheel.png image
- **FR-002**: Display MUST show the last winning number with its color (red/black/green) in the exact layout from last-result-hot-cold-numers.png
- **FR-003**: Display MUST show hot numbers (top 5 most frequent) matching the design layout
- **FR-004**: Display MUST show cold numbers (top 5 least frequent) matching the design layout
- **FR-005**: Display MUST animate the wheel rotation when a spin is triggered
- **FR-006**: Display MUST show current game phase visually (betting open, betting closed, spinning, result)
- **FR-007**: Display MUST NOT show any player list or winner podium after rounds

**Dealer Panel Requirements**:
- **FR-008**: Dealer panel MUST provide a "Bets Open" button to signal betting is open
- **FR-009**: Dealer panel MUST provide a "Bets Close" button to signal betting is closed
- **FR-010**: Dealer panel MUST provide a "Spin" control that requires entering the winning number (0-36)
- **FR-011**: Dealer panel MUST provide a "New Round" button to reset for the next round
- **FR-012**: Dealer panel MUST show a statistics section with round history (round number, result, timestamp)
- **FR-013**: Dealer panel MUST require password authentication
- **FR-014**: Dealer panel MUST NOT show any player list or betting amounts
- **FR-015**: Dealer panel MUST disable controls that are invalid for current game state (e.g., can't spin while betting is open)

**State Machine Requirements**:
- **FR-016**: System MUST enforce game state flow: Idle → Betting Open → Betting Closed → Spinning → Showing Result → Idle
- **FR-017**: System MUST validate that winning number is between 0 and 36 inclusive
- **FR-018**: System MUST persist round results for the current session

**Real-time Sync Requirements**:
- **FR-019**: Display MUST receive updates from dealer actions within 1 second
- **FR-020**: Display MUST auto-reconnect if WebSocket connection is lost

**Cleanup Requirements**:
- **FR-021**: System MUST remove the player page (`/play`) and all related routes
- **FR-022**: System MUST remove player registration, betting, and balance tracking functionality
- **FR-023**: System MUST remove winner overlay/podium from results display

### Key Entities

- **Round**: Represents a single spin of the roulette wheel. Contains: round number, winning number, winning color, timestamp.
- **Session**: Represents a game session. Contains: list of rounds, start time, status (active/ended).
- **Game State**: Current phase of the game. Values: idle, betting_open, betting_closed, spinning, showing_result.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Dealer can complete a full round (open bets → close bets → spin → new round) in under 30 seconds of interaction time
- **SC-002**: Display updates are visible within 1 second of dealer action
- **SC-003**: Wheel animation completes within 8-12 seconds of triggering spin
- **SC-004**: Display page loads and shows wheel within 3 seconds on standard network
- **SC-005**: Hot/cold statistics accurately reflect the top 5 most/least frequent numbers from session history
- **SC-006**: Display layout matches the provided design images for wheel, last result, and hot/cold numbers
- **SC-007**: System supports continuous operation for a 4+ hour event without degradation

## Design Reference

The display must use the exact visual style from the provided images:

1. **wheel.png**: Realistic roulette wheel with wood frame, green felt background, ball visible on track
2. **last-result-hot-cold-numers.png**:
   - "LAST RESULT:" header with large number and color label (e.g., "17 BLACK")
   - "HOT NUMBERS" section with red-tinted background, showing 5 numbers in circles with appropriate colors
   - "COLD NUMBERS" section with blue-tinted background, showing 5 numbers in circles with appropriate colors
   - Numbers displayed in colored circles: red numbers in red, black numbers with dark background, zero in green

## Assumptions

- Dealer is using a separate device (tablet/phone) to control the game
- Physical table handles all actual betting and payouts
- Single display device (TV/projector) for the audience
- Session data does not need to persist beyond the current browser session
- Standard European roulette rules (single zero, numbers 0-36)
