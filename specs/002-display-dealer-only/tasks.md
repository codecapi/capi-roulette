# Tasks: Simplified Roulette Display for Real Table

**Input**: Design documents from `/specs/002-display-dealer-only/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3)
- Exact file paths included in descriptions

## Path Conventions

- **Server**: `server/src/`
- **Client**: `client/src/`
- **Shared Types**: `shared/types.ts`

---

## Phase 1: Setup (Cleanup & Foundation)

**Purpose**: Remove player system and prepare codebase for simplified flow

- [x] T001 Delete player routes file at server/src/routes/players.ts
- [x] T002 [P] Delete player WebSocket handler at server/src/websocket/handlers/player.ts
- [x] T003 [P] Delete RNG module at server/src/game/rng.ts
- [x] T004 [P] Delete bet validator at server/src/game/bet-validator.ts
- [x] T005 [P] Delete payout calculator at server/src/game/payout.ts
- [x] T006 Delete player page directory at client/src/routes/play/
- [x] T007 Remove player route registration from server/src/routes/index.ts
- [x] T008 [P] Update shared types in shared/types.ts: remove Player, Bet, BetType; add new GamePhase type with 'idle', 'betting_open', 'betting_closed', 'spinning', 'showing_result'

**Checkpoint**: Codebase cleaned of player-related code

---

## Phase 2: Foundational (Core Infrastructure)

**Purpose**: Update core server infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 Simplify session-store.ts: remove all player functions (addPlayer, getPlayer, getPlayers, updatePlayerStatus), keep session and round management in server/src/game/session-store.ts
- [ ] T010 Update state-machine.ts: change phases from 'waiting/countdown/spinning/showing_results' to new flow 'idle/betting_open/betting_closed/spinning/showing_result' in server/src/game/state-machine.ts
- [ ] T011 Remove player-related broadcast functions (broadcastToPlayer) from server/src/websocket/broadcast.ts
- [ ] T012 [P] Remove player topic handling from server/src/websocket/topics.ts
- [ ] T013 Update WebSocket server to remove 'player' client type handling in server/src/websocket/server.ts
- [ ] T014 Simplify game store: remove playerBalance, playersList stores from client/src/lib/stores/game.ts
- [ ] T015 [P] Simplify WebSocket service: remove 'player' type option from client/src/lib/services/websocket.ts

**Checkpoint**: Foundation ready - user story implementation can begin

---

## Phase 3: User Story 1 - Dealer Controls Game Flow (Priority: P1) 🎯 MVP

**Goal**: Dealer can control game phases: Bets Open → Bets Close → Spin (with number) → New Round

**Independent Test**: Open dealer panel, press each control button in sequence, verify display responds with appropriate visual state changes.

### Server Implementation for US1

- [ ] T016 [US1] Add new dealer WebSocket message handlers (bets_open, bets_close, spin with winningNumber, new_round) in server/src/websocket/handlers/dealer.ts
- [ ] T017 [US1] Implement state transition functions in state-machine.ts: openBetting(), closeBetting(), triggerSpin(winningNumber), startNewRound() in server/src/game/state-machine.ts
- [ ] T018 [US1] Add winning number validation (0-36 inclusive) in state-machine.ts spin handler at server/src/game/state-machine.ts
- [ ] T019 [US1] Implement phase_change broadcast message when state transitions in server/src/websocket/broadcast.ts
- [ ] T020 [P] [US1] Add HTTP fallback endpoints for dealer controls (POST /api/dealer/bets-open, bets-close, spin, new-round) in server/src/routes/dealer.ts

### Client Implementation for US1

- [ ] T021 [US1] Rewrite dealer page with new control buttons layout: "Bets Open", "Bets Close", "Spin" (with number input), "New Round" in client/src/routes/dealer/+page.svelte
- [ ] T022 [US1] Add winning number input field (0-36) with validation in dealer page at client/src/routes/dealer/+page.svelte
- [ ] T023 [US1] Implement state-aware button enabling/disabling based on current game phase in dealer page at client/src/routes/dealer/+page.svelte
- [ ] T024 [US1] Update WebSocket message sending to use new message types (bets_open, bets_close, spin, new_round) in client/src/lib/services/websocket.ts
- [ ] T025 [US1] Update game store to handle phase_change messages in client/src/lib/stores/game.ts

**Checkpoint**: Dealer can complete full game cycle: open → close → spin → new round

---

## Phase 4: User Story 2 - Display Shows Wheel and Result (Priority: P1)

**Goal**: Display page shows wheel.png image, last result with color, and hot/cold numbers matching design

**Independent Test**: Load display page, verify wheel image appears, trigger a result from dealer panel, verify display updates correctly with proper colors.

### Display Components for US2

- [ ] T026 [P] [US2] Create WheelDisplay.svelte component using wheel.png image with CSS rotation animation in client/src/lib/components/display/WheelDisplay.svelte
- [ ] T027 [P] [US2] Create StatsPanel.svelte component matching last-result-hot-cold-numers.png design layout in client/src/lib/components/display/StatsPanel.svelte
- [ ] T028 [US2] Update ResultsOverlay.svelte: remove topWinners section, show only winning number and color in client/src/lib/components/display/ResultsOverlay.svelte

### Display Page for US2

- [ ] T029 [US2] Rewrite display page layout: wheel on left, stats panel on right, phase indicator at bottom in client/src/routes/display/+page.svelte
- [ ] T030 [US2] Integrate WheelDisplay component with wheel_update WebSocket messages for rotation animation in client/src/routes/display/+page.svelte
- [ ] T031 [US2] Integrate StatsPanel component showing last result and hot/cold numbers in client/src/routes/display/+page.svelte
- [ ] T032 [US2] Add visual phase indicators for all states (idle, betting_open, betting_closed, spinning, showing_result) in client/src/routes/display/+page.svelte
- [ ] T033 [US2] Remove WheelCanvas.svelte canvas-based wheel (replaced by image-based WheelDisplay) from client/src/lib/components/wheel/

### Server Support for US2

- [ ] T034 [US2] Update round_result broadcast to include only roundNumber, winningNumber, winningColor (no topWinners) in server/src/game/state-machine.ts
- [ ] T035 [US2] Ensure wheel_update broadcasts continue during spin animation in server/src/game/state-machine.ts

**Checkpoint**: Display shows wheel image, results with colors, hot/cold numbers per design

---

## Phase 5: User Story 3 - Statistics Tracking (Priority: P2)

**Goal**: Dealer sees round history with timestamps; display shows accurate hot/cold calculations

**Independent Test**: Play several rounds, verify dealer panel shows chronological history, verify display hot/cold numbers update correctly.

### Server Statistics for US3

- [ ] T036 [US3] Implement getHotNumbers() function returning top 5 most frequent numbers in server/src/game/session-store.ts
- [ ] T037 [US3] Implement getColdNumbers() function returning top 5 least frequent numbers in server/src/game/session-store.ts
- [ ] T038 [US3] Add stats_update WebSocket message broadcast to dealer after each round in server/src/websocket/broadcast.ts
- [ ] T039 [P] [US3] Add GET /api/dealer/history endpoint returning round history with timestamps in server/src/routes/dealer.ts

### Client Statistics for US3

- [ ] T040 [US3] Add round history table to dealer page showing roundNumber, result, color, timestamp in client/src/routes/dealer/+page.svelte
- [ ] T041 [US3] Handle stats_update WebSocket message in game store, update round history in client/src/lib/stores/game.ts
- [ ] T042 [US3] Update StatsPanel to use computed hot/cold numbers from game state in client/src/lib/components/display/StatsPanel.svelte

**Checkpoint**: Statistics tracking complete - dealer sees history, display shows accurate hot/cold

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, error handling, final cleanup

- [ ] T043 [P] Implement WebSocket auto-reconnect with visual indicator for display page in client/src/lib/services/websocket.ts
- [ ] T044 [P] Add error feedback when dealer tries invalid state transitions in client/src/routes/dealer/+page.svelte
- [ ] T045 [P] Update session_ended handling: remove topPlayer stats, show only totalRounds in server/src/websocket/handlers/dealer.ts
- [ ] T046 Simplify home page: remove player option, show only Display and Dealer links in client/src/routes/+page.svelte
- [ ] T047 Update server tests for new state machine flow in server/tests/
- [ ] T048 Run full end-to-end test: dealer cycle through phases, verify display updates
- [ ] T049 Validate quickstart.md workflow works correctly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 - BLOCKS all user stories
- **Phase 3 (US1)**: Depends on Phase 2 - MVP delivery
- **Phase 4 (US2)**: Depends on Phase 2 - Can run in parallel with US1
- **Phase 5 (US3)**: Depends on Phases 3 & 4 (needs working round flow)
- **Phase 6 (Polish)**: Depends on all user stories

### User Story Dependencies

- **US1 (Dealer Controls)**: Core flow - no dependency on other stories
- **US2 (Display)**: Core display - no dependency on US1, can develop in parallel
- **US3 (Statistics)**: Depends on rounds being completed (needs US1 working)

### Within Each User Story

- Server implementation before client
- Models/store changes before UI components
- Core functionality before polish

### Parallel Opportunities

**Phase 1 (Cleanup)** - 5 tasks can run in parallel:
```
T002, T003, T004, T005, T008 - different files, no dependencies
```

**Phase 2 (Foundational)** - 2 tasks can run in parallel:
```
T012, T015 - different services
```

**Phase 4 (US2 Display)** - 2 component tasks can run in parallel:
```
T026, T027 - different components
```

---

## Parallel Example: US2 Components

```bash
# Launch display component creation in parallel:
Task: "Create WheelDisplay.svelte component in client/src/lib/components/display/WheelDisplay.svelte"
Task: "Create StatsPanel.svelte component in client/src/lib/components/display/StatsPanel.svelte"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1: Cleanup player code
2. Complete Phase 2: Foundation updates
3. Complete Phase 3: Dealer controls (US1)
4. Complete Phase 4: Display page (US2)
5. **STOP and VALIDATE**: Full dealer-display cycle works
6. Deploy/demo if ready (MVP achieved)

### Incremental Delivery

1. Cleanup + Foundation → Clean codebase ready
2. Add US1 (Dealer) → Dealer can control phases → Test
3. Add US2 (Display) → Display responds to dealer → Test (MVP!)
4. Add US3 (Statistics) → Enhanced experience → Test
5. Polish → Production ready

### Single Developer Strategy

1. Complete phases sequentially: 1 → 2 → 3 → 4 → 5 → 6
2. US1 and US2 could be interleaved (server work, then client work)
3. Stop at US2 checkpoint for MVP validation

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to user story for traceability
- Each user story is independently testable after completion
- Commit after each task or logical group
- Stop at any checkpoint to validate progress
- Avoid: vague tasks, same-file conflicts, cross-story dependencies
