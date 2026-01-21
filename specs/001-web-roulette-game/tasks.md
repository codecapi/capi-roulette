# Tasks: Web-Based Roulette Game

**Input**: Design documents from `/specs/001-web-roulette-game/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in specification. Tests omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md structure:
- **Server**: `server/src/`
- **Client**: `client/src/`
- **Shared**: `shared/types/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project directory structure per plan.md (server/, client/, shared/)
- [ ] T002 Initialize Bun project with package.json in root
- [ ] T003 [P] Initialize SvelteKit project in client/ with Svelte 5
- [ ] T004 [P] Configure TypeScript 5.x in root tsconfig.json with path aliases
- [ ] T005 [P] Configure Tailwind CSS 4 in client/tailwind.config.js
- [ ] T006 [P] Create shared types from data-model.md in shared/types/index.ts
- [ ] T007 [P] Add .env.example with DEALER_PASSWORD and PORT configuration
- [ ] T008 Copy design assets to client/static/ (wheel.png, player-page.png, last-result-hot-cold-numers.png)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 Create Bun HTTP server entry point in server/src/index.ts
- [ ] T010 [P] Implement roulette constants (red/black numbers, columns, dozens) in server/src/game/constants.ts
- [ ] T011 [P] Implement random number generator (0-36) in server/src/game/rng.ts
- [ ] T011a [P] Add RNG fairness unit test (chi-square test over 10,000 samples, p-value > 0.05) in server/tests/game/rng.test.ts
- [ ] T012 [P] Implement payout calculator with European odds in server/src/game/payout.ts
- [ ] T013 [P] Implement bet validator (type, position, amount) in server/src/game/bet-validator.ts
- [ ] T014 Create in-memory session store in server/src/game/session-store.ts
- [ ] T015 Create game state machine (waiting→countdown→spinning→showing_results) in server/src/game/state-machine.ts
- [ ] T016 [P] Implement WebSocket server setup with Bun native WebSocket in server/src/websocket/server.ts
- [ ] T017 Implement WebSocket pub/sub topics (game-state, dealer, player:{id}) in server/src/websocket/topics.ts
- [ ] T018 [P] Implement HTTP Basic Auth middleware in server/src/routes/auth.ts
- [ ] T019 Create WebSocket client service in client/src/lib/services/websocket.ts
- [ ] T020 Create game state Svelte store in client/src/lib/stores/game.ts
- [ ] T021 Create SvelteKit route structure (+page.svelte for /, /display, /dealer, /play)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Dealer Controls Game Flow (Priority: P1) 🎯 MVP

**Goal**: Dealer can authenticate, see player list, start rounds, and end session

**Independent Test**: Access /dealer, authenticate with password, press spin button - round starts even without players

### Implementation for User Story 1

- [ ] T022 [US1] Implement POST /api/session endpoint in server/src/routes/session.ts
- [ ] T023 [US1] Implement POST /api/dealer/auth endpoint in server/src/routes/dealer.ts
- [ ] T024 [US1] Implement GET /api/players endpoint with sorting in server/src/routes/players.ts
- [ ] T025 [US1] Implement POST /api/session/end endpoint in server/src/routes/session.ts
- [ ] T026 [US1] Implement "start_spin" WebSocket handler in server/src/websocket/handlers/dealer.ts
- [ ] T027 [US1] Implement "end_session" WebSocket handler in server/src/websocket/handlers/dealer.ts
- [ ] T028 [US1] Implement dealer connection type in server/src/websocket/handlers/connection.ts
- [ ] T029 [US1] Create dealer login page component in client/src/routes/dealer/+page.svelte
- [ ] T030 [US1] Create dealer control panel component in client/src/lib/components/dealer/ControlPanel.svelte
- [ ] T031 [US1] Create large spin button component in client/src/lib/components/dealer/SpinButton.svelte
- [ ] T032 [US1] Create player list table component with sorting in client/src/lib/components/dealer/PlayerList.svelte
- [ ] T032a [US1] Add active/inactive status indicator (green dot for active, gray for disconnected) in client/src/lib/components/dealer/PlayerList.svelte
- [ ] T033 [US1] Create end session button component in client/src/lib/components/dealer/EndSessionButton.svelte
- [ ] T034 [US1] Implement players_update WebSocket handler in client dealer page
- [ ] T035 [US1] Style dealer page with Tailwind (responsive, large controls)

**Checkpoint**: Dealer can authenticate, start rounds, see players, end session

---

## Phase 4: User Story 2 - Roulette Display Shows Game Animation (Priority: P1)

**Goal**: TV/projector displays realistic wheel animation, countdown, last result, and hot/cold numbers

**Independent Test**: Load /display, trigger spin from dealer - see countdown, wheel spin, ball animation, result

### Implementation for User Story 2

- [ ] T036 [US2] Implement wheel drawing function using wheel.png in client/src/lib/components/wheel/WheelCanvas.svelte
- [ ] T037 [US2] Implement wheel spin animation with physics in client/src/lib/components/wheel/wheelAnimation.ts
- [ ] T038 [US2] Implement ball entry animation in client/src/lib/components/wheel/ballAnimation.ts
- [ ] T039 [US2] Implement ball rolling around track animation in client/src/lib/components/wheel/ballAnimation.ts
- [ ] T040 [US2] Implement ball bouncing and settling animation in client/src/lib/components/wheel/ballAnimation.ts
- [ ] T041 [US2] Implement wheel deceleration and stop in client/src/lib/components/wheel/wheelAnimation.ts
- [ ] T042 [US2] Create countdown overlay component (5-4-3-2-1) in client/src/lib/components/shared/CountdownOverlay.svelte
- [ ] T043 [US2] Create last result panel component in client/src/lib/components/display/LastResult.svelte
- [ ] T044 [US2] Create hot numbers list component in client/src/lib/components/display/HotNumbers.svelte
- [ ] T045 [US2] Create cold numbers list component in client/src/lib/components/display/ColdNumbers.svelte
- [ ] T046 [US2] Implement hot/cold number calculation in server/src/game/statistics.ts
- [ ] T047 [US2] Create display page layout in client/src/routes/display/+page.svelte
- [ ] T048 [US2] Implement wheel_update WebSocket handler in display page
- [ ] T049 [US2] Implement countdown WebSocket handler in display page
- [ ] T050 [US2] Style display page for TV/projector (large, dark theme matching designs)

**Checkpoint**: Display shows full wheel animation with countdown and statistics

---

## Phase 5: User Story 3 - Player Places Bets on Mobile (Priority: P1)

**Goal**: Players join with username/points, place bets on mobile-friendly table, see balance

**Independent Test**: Visit /play, enter name and points, place bets on table - chips appear, balance updates

### Implementation for User Story 3

- [ ] T051 [US3] Implement POST /api/players/join endpoint in server/src/routes/players.ts
- [ ] T052 [US3] Implement POST /api/players/reconnect endpoint in server/src/routes/players.ts
- [ ] T053 [US3] Implement GET /api/players/{playerId} endpoint in server/src/routes/players.ts
- [ ] T054 [US3] Implement "place_bet" WebSocket handler in server/src/websocket/handlers/player.ts
- [ ] T055 [US3] Implement "clear_bets" WebSocket handler in server/src/websocket/handlers/player.ts
- [ ] T056 [US3] Implement "rebet" WebSocket handler in server/src/websocket/handlers/player.ts
- [ ] T057 [US3] Implement player connection type in server/src/websocket/handlers/connection.ts
- [ ] T058 [US3] Create player registration form in client/src/lib/components/player/JoinForm.svelte
- [ ] T059 [US3] Create betting table layout matching player-page.png in client/src/lib/components/table/BettingTable.svelte
- [ ] T060 [US3] Create number grid (0-36) in client/src/lib/components/table/NumberGrid.svelte
- [ ] T061 [US3] Create outside bets section (red/black, odd/even, etc.) in client/src/lib/components/table/OutsideBets.svelte
- [ ] T062 [US3] Create chip selector (1/5/10/25/50 with colors) in client/src/lib/components/player/ChipSelector.svelte
- [ ] T063 [US3] Create placed chip display on table in client/src/lib/components/table/PlacedChips.svelte
- [ ] T064 [US3] Create Re-Bet button component in client/src/lib/components/player/ReBetButton.svelte
- [ ] T065 [US3] Create Clear Bet button component in client/src/lib/components/player/ClearBetButton.svelte
- [ ] T066 [US3] Create player info panel (username, balance, current bet, last win, total) in client/src/lib/components/player/PlayerInfo.svelte
- [ ] T067 [US3] Create player page layout in client/src/routes/play/+page.svelte
- [ ] T068 [US3] Implement balance_update WebSocket handler in player page
- [ ] T069 [US3] Implement betting_locked/betting_open handlers (disable/enable table)
- [ ] T070 [US3] Store player ID in localStorage for reconnection
- [ ] T071 [US3] Style player page for mobile (touch-friendly, responsive)

**Checkpoint**: Players can join, place bets, see balance updates

---

## Phase 6: User Story 5 - Real-Time Synchronization (Priority: P1)

**Goal**: All pages sync within 1 second - dealer spin triggers countdown on all devices

**Independent Test**: Open dealer, display, and player pages - dealer spin causes synchronized countdown on all

### Implementation for User Story 5

- [ ] T072 [US5] Implement game_state broadcast on all state changes in server/src/websocket/broadcast.ts
- [ ] T073 [US5] Implement countdown tick broadcast (every second) in server/src/game/state-machine.ts
- [ ] T074 [US5] Implement wheel_update broadcast during spinning in server/src/game/state-machine.ts
- [ ] T075 [US5] Implement round_result broadcast when ball settles in server/src/game/state-machine.ts
- [ ] T076 [US5] Implement balance_update broadcast to individual players in server/src/websocket/broadcast.ts
- [ ] T077 [US5] Implement players_update broadcast to dealer in server/src/websocket/broadcast.ts
- [ ] T078 [US5] Add WebSocket reconnection logic with state sync in client/src/lib/services/websocket.ts
- [ ] T079 [US5] Implement betting_locked handler on player page (disable interactions)
- [ ] T080 [US5] Implement betting_open handler on player page (enable interactions)
- [ ] T081 [US5] Sync animation state across display pages via wheel_update messages

**Checkpoint**: All pages stay synchronized in real-time

---

## Phase 7: User Story 4 - Results Display with Winners (Priority: P2)

**Goal**: Results overlay shows winning number/color and top 3 earners for 30 seconds

**Independent Test**: Complete round with bets - overlay shows number, color, top 3 winners, closes after 30s

### Implementation for User Story 4

- [ ] T082 [US4] Implement top winners calculation in server/src/game/statistics.ts
- [ ] T083 [US4] Include topWinners in round_result broadcast in server/src/game/state-machine.ts
- [ ] T084 [US4] Implement 30-second timer for results phase in server/src/game/state-machine.ts
- [ ] T085 [US4] Create results overlay component in client/src/lib/components/display/ResultsOverlay.svelte
- [ ] T086 [US4] Display winning number with color styling in results overlay
- [ ] T087 [US4] Display top 3 winners with names and earnings in results overlay
- [ ] T088 [US4] Implement auto-close after 30 seconds in results overlay
- [ ] T089 [US4] Add round_result handler to display page showing overlay
- [ ] T090 [US4] Style results overlay (large number, podium-style winners, matching design)

**Checkpoint**: Results display shows winners and auto-closes

---

## Phase 8: User Story 6 - Session Data Backup (Priority: P3)

**Goal**: Session data saved to JSON file, manual backup from dealer page

**Independent Test**: Play rounds, trigger backup from dealer - JSON file contains all data

### Implementation for User Story 6

- [ ] T091 [US6] Implement backup file writer using Bun.write() in server/src/game/backup.ts
- [ ] T092 [US6] Implement backup data serializer (session, players, rounds) in server/src/game/backup.ts
- [ ] T093 [US6] Implement POST /api/backup endpoint in server/src/routes/backup.ts
- [ ] T094 [US6] Implement GET /api/backup endpoint in server/src/routes/backup.ts
- [ ] T095 [US6] Add auto-backup after each round completion in server/src/game/state-machine.ts
- [ ] T096 [US6] Create backup button on dealer page in client/src/lib/components/dealer/BackupButton.svelte
- [ ] T097 [US6] Show backup status/timestamp on dealer page
- [ ] T098 [US6] Create backups/ directory with .gitkeep

**Checkpoint**: Session data persists to JSON backup

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements affecting multiple user stories

- [ ] T099 [P] Add error handling for WebSocket disconnection on all pages
- [ ] T100 [P] Add loading states during async operations
- [ ] T101 [P] Add error toast notifications for failed operations
- [ ] T102 [P] Implement player reconnection flow (detect existing session in localStorage)
- [ ] T103 [P] Add session ended screen for players when dealer ends session
- [ ] T104 [P] Handle edge case: player runs out of points (disable betting, show message)
- [ ] T105 [P] Handle edge case: duplicate username (show error, prompt re-entry)
- [ ] T106 Add responsive breakpoints for tablet view of player page
- [ ] T107 Test wheel animation performance (target 30+ FPS)
- [ ] T108 Test with 20 concurrent player connections
- [ ] T109 Run quickstart.md validation (full game flow)
- [ ] T110 Final code cleanup and console.log removal

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
- **Polish (Phase 9)**: Depends on all P1 user stories being complete

### User Story Dependencies

| Story | Priority | Dependencies | Can Start After |
|-------|----------|--------------|-----------------|
| US1 - Dealer Controls | P1 | None | Phase 2 |
| US2 - Display Animation | P1 | None | Phase 2 |
| US3 - Player Betting | P1 | None | Phase 2 |
| US5 - Real-Time Sync | P1 | US1, US2, US3 | Phase 5 |
| US4 - Results Display | P2 | US2, US5 | Phase 6 |
| US6 - Session Backup | P3 | US1 | Phase 3 |

### Within Each User Story

- Server-side before client-side
- Models/utilities before services
- Services before UI components
- Core functionality before polish

### Parallel Opportunities

**Setup (can run in parallel)**:
- T003, T004, T005, T006, T007 (different files)

**Foundational (can run in parallel)**:
- T010, T011, T012, T013 (game logic utilities)
- T016, T018 (server infrastructure)
- T019, T020 (client infrastructure)

**User Story 1** (after T021):
- T022-T025 (server endpoints - different files)
- T029-T034 (client components - different files)

**User Story 2** (after T021):
- T036-T041 (animation modules - can develop in parallel)
- T043, T044, T045 (display components - different files)

**User Story 3** (after T021):
- T051-T053 (server endpoints - different files)
- T054-T056 (WebSocket handlers - different files)
- T058-T066 (client components - different files)

---

## Parallel Execution Examples

### Launch Setup Phase in Parallel

```bash
# All these target different files:
Task T003: "Initialize SvelteKit project in client/"
Task T004: "Configure TypeScript in tsconfig.json"
Task T005: "Configure Tailwind CSS in client/tailwind.config.js"
Task T006: "Create shared types in shared/types/index.ts"
Task T007: "Add .env.example"
```

### Launch Foundational Game Logic in Parallel

```bash
# Independent utility modules:
Task T010: "Implement roulette constants in server/src/game/constants.ts"
Task T011: "Implement RNG in server/src/game/rng.ts"
Task T012: "Implement payout calculator in server/src/game/payout.ts"
Task T013: "Implement bet validator in server/src/game/bet-validator.ts"
```

### Launch User Story 2 Animation Components in Parallel

```bash
# Different animation modules:
Task T037: "Implement wheel spin animation in wheelAnimation.ts"
Task T038: "Implement ball entry animation in ballAnimation.ts"
Task T042: "Create countdown overlay in CountdownOverlay.svelte"
Task T043: "Create last result panel in LastResult.svelte"
```

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Dealer Controls)
4. **VALIDATE**: Dealer can authenticate and trigger spin
5. Complete Phase 4: User Story 2 (Display Animation)
6. **VALIDATE**: Display shows wheel animation
7. Complete Phase 5: User Story 3 (Player Betting)
8. **VALIDATE**: Players can join and place bets
9. Complete Phase 6: User Story 5 (Real-Time Sync)
10. **VALIDATE**: All pages sync in real-time - **MVP COMPLETE**

### Incremental Delivery After MVP

11. Add User Story 4 (Results with Winners) - enhances display
12. Add User Story 6 (Session Backup) - adds persistence
13. Complete Polish phase - production ready

### Parallel Team Strategy

With multiple developers after Phase 2:

| Developer | Assignment |
|-----------|------------|
| Dev A | User Story 1 (Dealer) + User Story 5 (Sync) |
| Dev B | User Story 2 (Display Animation) |
| Dev C | User Story 3 (Player Betting) |

After P1 stories merge, any developer can take P2/P3 stories.

---

## Task Summary

| Phase | Story | Task Count |
|-------|-------|------------|
| Phase 1 | Setup | 8 |
| Phase 2 | Foundational | 14 |
| Phase 3 | US1 - Dealer Controls | 15 |
| Phase 4 | US2 - Display Animation | 15 |
| Phase 5 | US3 - Player Betting | 21 |
| Phase 6 | US5 - Real-Time Sync | 10 |
| Phase 7 | US4 - Results Display | 9 |
| Phase 8 | US6 - Session Backup | 8 |
| Phase 9 | Polish | 12 |
| **Total** | | **112** |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
