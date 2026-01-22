# Tasks: Roulette Audio System

**Input**: Design documents from `/specs/004-roulette-audio/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Client**: `client/src/` for frontend code, `client/public/` for static assets
- **Server**: `server/src/` for backend code
- **Shared**: `shared/types/` for shared TypeScript types

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Audio assets setup and directory structure

- [x] T001 Create audio directory structure at `client/public/audio/ball/` and `client/public/audio/voice/`
- [x] T002 [P] Copy and rename ball audio files from `/audio/roulette/ball/` to `client/public/audio/ball/` (7 files: ball-1.mp3 through ball-7.wav)
- [x] T003 [P] Copy and rename voice audio files from `/audio/roulette/voice/` to `client/public/audio/voice/` (40 files, strip Freesound ID prefixes)
- [x] T004 Verify all 47 audio files are accessible via dev server at `/audio/ball/*` and `/audio/voice/*`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core AudioService infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create audio file mapping constants in `client/src/lib/services/audio-file-mapping.ts` with BALL_AUDIO_FILES, NUMBER_AUDIO_MAPPING, and helper functions
- [x] T006 Create AudioService class skeleton in `client/src/lib/services/audio.ts` with constructor, audioContext, gainNode, and state properties
- [x] T007 Implement AudioService.unlock() method to handle browser autoplay policy (create AudioContext, play silent buffer)
- [x] T008 Implement AudioService.preload() method to load all audio files into AudioBuffer cache using Promise.all
- [x] T009 Implement private loadAudioBuffer(path) helper method using fetch + decodeAudioData
- [x] T010 Implement AudioService.setVolume(volume) and dispose() methods
- [x] T011 Add audio unlock UI overlay to `client/src/routes/display/+page.svelte` with "Click to Enable Audio" button
- [x] T012 Initialize AudioService on user click in display page, call unlock() then preload()

**Checkpoint**: AudioService can load all audio files; display page has working unlock button

---

## Phase 3: User Story 1 - Ball Spin Audio During Wheel Spin (Priority: P1) 🎯 MVP

**Goal**: Play realistic ball spinning sounds during the wheel spin animation with duration matching

**Independent Test**: Trigger a spin and verify ball audio plays from spin start until result, with variety in selection

### Implementation for User Story 1

- [x] T013 [US1] Implement selectRandomBallIndex() private method in `client/src/lib/services/audio.ts` with recent selection tracking (max 3 consecutive same)
- [x] T014 [US1] Implement playBallAudio(spinDuration) method in `client/src/lib/services/audio.ts` with playback rate adjustment formula
- [x] T015 [US1] Implement stopBallAudio() method in `client/src/lib/services/audio.ts` to stop current ball source
- [x] T016 [US1] Add onSpinStart callback prop to `client/src/lib/components/wheel/CSSRouletteWheel.svelte`
- [x] T017 [US1] Call onSpinStart(spinDuration) at beginning of spin() function in CSSRouletteWheel.svelte
- [x] T018 [US1] Wire up onSpinStart in `client/src/routes/display/+page.svelte` to call audioService.playBallAudio(spinDuration)
- [x] T019 [US1] Add logic to stop ball audio when spin completes (call stopBallAudio on result reveal)
- [x] T020 [US1] Implement audio stop on new spin start (FR-009: stop any playing audio when new spin begins)

**Checkpoint**: Ball audio plays during spins with varied selection and proper duration matching

---

## Phase 4: User Story 2 - "No More Bets" Voice Announcement (Priority: P2)

**Goal**: Play "No more bets" voice announcement when betting closes (halfway through spin)

**Independent Test**: Trigger a spin and verify "No more bets" audio plays at the midpoint when mask text changes

### Implementation for User Story 2

- [x] T021 [US2] Implement playNoMoreBets() method in `client/src/lib/services/audio.ts`
- [x] T022 [US2] Add onNoMoreBets callback prop to `client/src/lib/components/wheel/CSSRouletteWheel.svelte`
- [x] T023 [US2] Call onNoMoreBets() at spinDuration/2 setTimeout (when maskText changes to "No More Bets") in CSSRouletteWheel.svelte
- [x] T024 [US2] Wire up onNoMoreBets in `client/src/routes/display/+page.svelte` to call audioService.playNoMoreBets()

**Checkpoint**: "No more bets" audio plays synchronized with on-screen message at spin midpoint

---

## Phase 5: User Story 3 - Result Announcement with Voice (Priority: P2)

**Goal**: Announce winning number with voice when result is revealed (e.g., "The winning number is... seven red odd")

**Independent Test**: Complete a spin and verify the correct result audio sequence plays when the result is shown

### Implementation for User Story 3

- [x] T025 [US3] Implement private playBufferAndWait(buffer) helper method in `client/src/lib/services/audio.ts` that returns a Promise
- [x] T026 [US3] Implement announceResult(winningNumber) method in `client/src/lib/services/audio.ts` that plays "the winning number is" then result audio
- [x] T027 [US3] Add onResultRevealed callback prop to `client/src/lib/components/wheel/CSSRouletteWheel.svelte`
- [x] T028 [US3] Call onResultRevealed(resultNumber) when isRevealed becomes true in CSSRouletteWheel.svelte
- [x] T029 [US3] Wire up onResultRevealed in `client/src/routes/display/+page.svelte` to call audioService.announceResult(winningNumber)
- [x] T030 [US3] Ensure result announcement timing: stop ball audio first, then announce (sequence per FR-010)

**Checkpoint**: Complete result announcement sequence plays for all 37 possible numbers

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, edge cases, and cleanup

- [x] T031 [P] Add try-catch error handling to all AudioService public methods with console.warn logging
- [x] T032 [P] Add debug logging option to AudioService constructor (log playback events when enabled)
- [x] T033 Handle rapid spin case: ensure previous audio stops cleanly before new spin audio starts
- [x] T034 Add graceful degradation: verify game continues without audio if AudioContext fails
- [x] T035 Test all 37 number announcements work correctly (verify file mapping matches expected audio)
- [x] T036 Add AudioService cleanup in display page onDestroy() lifecycle hook
- [x] T037 Run quickstart.md validation to verify complete implementation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (P1): No dependencies on other stories
  - User Story 2 (P2): No dependencies on other stories (can run parallel to US1)
  - User Story 3 (P2): No dependencies on other stories (can run parallel to US1/US2)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Delivers core audio experience
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Adds voice announcement layer
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Adds result announcement layer

All user stories are **independently testable** - each adds a distinct audio feature that works standalone.

### Within Each User Story

- AudioService method implementation before component integration
- Component callback props before display page wiring
- All tasks within a story follow sequential order unless marked [P]

### Parallel Opportunities

**Phase 1 (Setup)**:
- T002 and T003 can copy files in parallel (different source/target directories)

**Phase 2 (Foundational)**:
- None - sequential flow for AudioService building blocks

**Phase 3-5 (User Stories)**:
- US1, US2, US3 can all proceed in parallel after Phase 2 completes
- Within each story, tasks are sequential

**Phase 6 (Polish)**:
- T031 and T032 can run in parallel (different aspects of error handling)

---

## Parallel Example: After Foundational Phase

```bash
# Once Phase 2 is complete, all user stories can start in parallel:
# Developer A: User Story 1 (Ball Spin Audio)
Task: "T013 [US1] Implement selectRandomBallIndex()..."
Task: "T014 [US1] Implement playBallAudio(spinDuration)..."

# Developer B: User Story 2 (No More Bets)
Task: "T021 [US2] Implement playNoMoreBets()..."
Task: "T022 [US2] Add onNoMoreBets callback prop..."

# Developer C: User Story 3 (Result Announcement)
Task: "T025 [US3] Implement playBufferAndWait() helper..."
Task: "T026 [US3] Implement announceResult(winningNumber)..."
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (copy audio files)
2. Complete Phase 2: Foundational (AudioService + unlock UI)
3. Complete Phase 3: User Story 1 (ball spin audio)
4. **STOP and VALIDATE**: Trigger spins and verify ball audio plays correctly
5. Deploy/demo if ready - provides core audio immersion

### Incremental Delivery

1. Setup + Foundational → Audio infrastructure ready
2. Add User Story 1 → Ball spin audio works → Deploy (MVP!)
3. Add User Story 2 → "No more bets" announcement → Deploy
4. Add User Story 3 → Result announcements → Deploy
5. Polish phase → Error handling and cleanup → Final release

### Single Developer Strategy

1. Complete phases sequentially: 1 → 2 → 3 → 4 → 5 → 6
2. Test each user story before moving to next
3. Commit after each task or logical group

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Audio files must be copied before any playback testing
- Browser requires user gesture before AudioContext works - unlock button is critical
