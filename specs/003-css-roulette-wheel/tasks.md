# Tasks: CSS Roulette Wheel Animation

**Input**: Design documents from `/specs/003-css-roulette-wheel/`
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

## Phase 1: Setup (Server Configuration)

**Purpose**: Add spin configuration constants and update types for CSS animation

- [x] T001 Add SPIN_CONFIG constant with minDuration (8000), maxDuration (12000), and ballRotations (5) to server/src/game/constants.ts
- [x] T002 [P] Update WSWheelUpdateMessage type in shared/types.ts to include optional spinDuration and targetSlot fields

**Checkpoint**: Server constants and types ready for CSS animation support

---

## Phase 2: Server Implementation (Spin Data Broadcast)

**Purpose**: Update server to send spin duration and target slot to clients at spin start

- [x] T003 Update triggerSpin() in server/src/game/state-machine.ts to calculate random duration from SPIN_CONFIG range
- [x] T004 Update wheel_update broadcast at spin start to include spinDuration and targetSlot fields in server/src/game/state-machine.ts
- [x] T005 Export getSlotIndex() helper function that converts winning number to slot index via WHEEL_ORDER lookup in server/src/game/constants.ts

**Checkpoint**: Server broadcasts spinDuration and targetSlot when spin is triggered

---

## Phase 3: User Story 1 - CSS Wheel with Animated Ball Spin (Priority: P1) 🎯 MVP

**Goal**: Display page shows CSS-drawn roulette wheel with ball that animates to winning number

**Independent Test**: Open display page, trigger spin from dealer panel with number 17, verify ball animates around wheel and lands on position 17.

### CSS Wheel Component for US1

- [x] T006 [US1] Create CSSRouletteWheel.svelte component skeleton with props: targetSlot (number), spinDuration (number), isSpinning (boolean) in client/src/lib/components/wheel/CSSRouletteWheel.svelte
- [x] T007 [US1] Add WHEEL_ORDER and RED_NUMBERS constants to CSSRouletteWheel.svelte for segment rendering
- [x] T008 [US1] Implement CSS wheel rendering with 37 segments using transform-origin: 50% 100% and rotateZ() positioning in CSSRouletteWheel.svelte
- [x] T009 [US1] Add segment coloring logic (red/black/green) matching European roulette colors in CSSRouletteWheel.svelte
- [x] T010 [US1] Add number labels to each segment positioned correctly within the wheel in CSSRouletteWheel.svelte
- [x] T011 [US1] Add ball element with CSS transition: transform var(--spin-duration) ease-out in CSSRouletteWheel.svelte
- [x] T012 [US1] Implement ball rotation calculation: (5 * 360) + (targetSlot / 37 * 360) degrees for final position in CSSRouletteWheel.svelte
- [x] T013 [US1] Add isAnimating internal state to track CSS transition progress, set false on transitionend event in CSSRouletteWheel.svelte

### Game Store Updates for US1

- [x] T014 [US1] Update wheelState store to include optional spinDuration and targetSlot fields in client/src/lib/stores/game.ts
- [x] T015 [US1] Update wheel_update handler to extract spinDuration and targetSlot when present in client/src/lib/stores/game.ts

### Display Page Integration for US1

- [x] T016 [US1] Import CSSRouletteWheel component in client/src/routes/display/+page.svelte
- [x] T017 [US1] Replace wheel.png img element with CSSRouletteWheel component, passing wheelState props in client/src/routes/display/+page.svelte
- [x] T018 [US1] Remove ball div element (ball is now part of CSSRouletteWheel component) in client/src/routes/display/+page.svelte
- [x] T019 [US1] Remove wheel-related inline styles from display page (handled by component) in client/src/routes/display/+page.svelte

**Checkpoint**: CSS wheel displays and ball animates to correct winning position

---

## Phase 4: User Story 2 - Variable Spin Duration (Priority: P2)

**Goal**: Each spin has randomly varying duration within configured range (8-12 seconds)

**Independent Test**: Trigger 3+ spins from dealer panel, time each spin, verify durations differ and fall within 8-12 second range.

### Duration Variation for US2

- [x] T020 [US2] Verify SPIN_CONFIG.minDuration and maxDuration values allow 4+ second variance (8000-12000ms) in server/src/game/constants.ts
- [x] T021 [US2] Add console.log of generated spinDuration in triggerSpin() for testing verification (remove after testing) in server/src/game/state-machine.ts
- [x] T022 [US2] Test multiple spins and verify duration variance in browser developer tools

**Checkpoint**: Spin durations vary noticeably between rounds

---

## Phase 5: User Story 3 - Responsive Wheel Display (Priority: P3)

**Goal**: Wheel displays properly on various screen sizes (TV/projector to standard monitor)

**Independent Test**: View display page at various viewport sizes, verify wheel remains centered and readable.

### Responsive Styling for US3

- [x] T023 [US3] Add CSS for wheel sizing using min(500px, 80vmin) to scale appropriately in CSSRouletteWheel.svelte
- [x] T024 [US3] Add CSS media queries for adjusting number font size on smaller screens in CSSRouletteWheel.svelte
- [x] T025 [US3] Ensure ball size scales proportionally with wheel size in CSSRouletteWheel.svelte
- [x] T026 [US3] Test wheel display on simulated TV viewport (1920x1080) and tablet viewport (768x1024)

**Checkpoint**: Wheel displays correctly on large TVs and smaller monitors

---

## Phase 6: Polish & Edge Cases

**Purpose**: Edge case handling, cleanup, and final testing

- [x] T027 [P] Add guard in CSSRouletteWheel.svelte to prevent animation restart if already animating
- [x] T028 [P] Ensure transitionend event properly resets isAnimating state even on rapid phase changes in CSSRouletteWheel.svelte
- [x] T029 [P] Delete wheel.png from client/static/ (no longer needed)
- [x] T030 Remove console.log added in T021 after testing verification
- [x] T031 Test full dealer flow: bets open → bets close → spin (verify animation) → new round
- [x] T032 Validate all acceptance scenarios from spec.md pass
- [x] T033 Validate quickstart.md workflow works correctly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - can start immediately
- **Phase 2 (Server)**: Depends on Phase 1 types
- **Phase 3 (US1 - CSS Wheel)**: Depends on Phase 2 - MVP delivery
- **Phase 4 (US2 - Duration)**: Depends on Phase 3 (needs working animation)
- **Phase 5 (US3 - Responsive)**: Depends on Phase 3 (needs working wheel)
- **Phase 6 (Polish)**: Depends on all user stories

### User Story Dependencies

- **US1 (CSS Wheel)**: Core animation - no dependency on other stories
- **US2 (Duration)**: Enhancement to US1 - can test after US1 complete
- **US3 (Responsive)**: Styling enhancement - can develop alongside US2

### Parallel Opportunities

**Phase 1 (Setup)** - 2 tasks can run in parallel:
```
T001, T002 - different files (constants.ts vs types.ts)
```

**Phase 3 (US1 CSS Wheel)** - Component can be built independently:
```
T006-T013 must be sequential (building component)
T014, T015 can run parallel with component work (store updates)
```

**Phase 6 (Polish)** - 3 tasks can run in parallel:
```
T027, T028, T029 - different concerns
```

---

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1: Setup constants and types
2. Complete Phase 2: Server sends duration/targetSlot
3. Complete Phase 3: CSS wheel component + integration
4. **STOP and VALIDATE**: Ball animates to correct number
5. Deploy/demo if ready (MVP achieved)

### Incremental Enhancement

1. Setup + Server → Data flowing correctly
2. Add US1 (CSS Wheel) → Visual animation works → Test (MVP!)
3. Add US2 (Duration) → Varied timing → Test
4. Add US3 (Responsive) → Scales properly → Test
5. Polish → Production ready

### Single Developer Strategy

1. Complete phases sequentially: 1 → 2 → 3 → 4 → 5 → 6
2. T006-T013 are iterative (build component piece by piece)
3. Stop at Phase 3 checkpoint for MVP validation
4. Remove wheel.png only after CSS wheel is verified working

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to user story for traceability
- CodePen reference: https://codepen.io/pder/pen/WYrRQm
- Ball rotation formula: (ballRotations * 360) + (slotIndex / 37 * 360) degrees
- CSS transition with ease-out provides natural deceleration
- Keep existing wheel_update fields for backwards compatibility
