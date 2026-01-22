# Feature Specification: Roulette Audio System

**Feature Branch**: `004-roulette-audio`
**Created**: 2026-01-21
**Status**: Draft
**Input**: User description: "Add audio support for roulette wheel - ball spin sounds during spinning, voice announcements for 'no more bets', 'the winning number is', and result announcements with number, color, and odd/even"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ball Spin Audio During Wheel Spin (Priority: P1)

As a player watching the display, I want to hear realistic ball spinning sounds during the wheel spin animation so that the game feels more immersive and authentic.

**Why this priority**: Audio feedback during the spin is the core immersive experience. Without spin sounds, the wheel animation feels silent and less engaging. This is the primary audio interaction that occurs during every round.

**Independent Test**: Can be fully tested by triggering a spin and verifying that ball audio plays from spin start until the result is shown. Delivers immediate audio immersion value.

**Acceptance Scenarios**:

1. **Given** the wheel is idle, **When** the dealer triggers a spin, **Then** a randomly selected ball audio file begins playing immediately
2. **Given** the ball audio is playing, **When** the spin animation is in progress, **Then** the audio continues playing and matches the spin duration
3. **Given** different spins occur, **When** each spin starts, **Then** a different random ball audio file is selected each time (not always the same one)
4. **Given** the spin duration is configured (e.g., 5s, 9s, 15s), **When** the spin starts, **Then** the ball audio playback speed/duration adjusts to match the configured spin duration

---

### User Story 2 - "No More Bets" Voice Announcement (Priority: P2)

As a player, I want to hear "No more bets" announced when betting closes so that I know bets are no longer accepted, matching the experience of a real casino.

**Why this priority**: This is a key game state announcement that players expect. It provides clear audio feedback about game state transitions and enhances the casino atmosphere.

**Independent Test**: Can be fully tested by triggering a spin and verifying the "no more bets" audio plays at the correct moment during the spin.

**Acceptance Scenarios**:

1. **Given** a spin is in progress, **When** the "No More Bets" message appears on screen, **Then** the no-more-bets.wav audio plays
2. **Given** the audio is playing, **When** it completes, **Then** the ball spin audio continues uninterrupted

---

### User Story 3 - Result Announcement with Voice (Priority: P2)

As a player, I want to hear the winning number announced with voice when the result is shown, including the number, color, and odd/even designation, so I know the result without having to look at the screen.

**Why this priority**: Result announcements are the climax of each round. The voice announcement adds authenticity and accessibility, allowing players to know results even if not looking directly at the display.

**Independent Test**: Can be fully tested by completing a spin and verifying the correct result audio sequence plays when the result is revealed.

**Acceptance Scenarios**:

1. **Given** the spin has completed, **When** the result is revealed on screen, **Then** "the-winning-number-is.wav" plays first
2. **Given** "the winning number is" audio has finished, **When** the result is 7 Red Odd, **Then** "seven-red-odd.wav" plays immediately after
3. **Given** the result is 0 (zero), **When** the result audio plays, **Then** "zero.wav" plays (zero has no color/odd-even designation)
4. **Given** any result number, **When** determining which audio file to play, **Then** the system selects the correct file based on number-color-oddeven pattern (e.g., 25 red odd → "twenty-five-red-odd.wav")

---

### Edge Cases

- What happens if audio files fail to load? The game continues without audio, not blocking gameplay
- What happens if the user's browser doesn't support audio? The game functions normally without sound
- What happens if spin duration is very short (5s) and ball audio file is longer? Audio playback rate is adjusted to fit the duration
- What happens if spin duration is very long (15s) and ball audio file is shorter? Audio is looped or playback rate slowed to fill the duration
- What happens if multiple spins occur rapidly? Previous audio stops and new spin audio starts fresh

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST play a randomly selected ball audio file when a spin begins
- **FR-002**: System MUST select a different random ball audio file for each spin (random selection from 7 available files)
- **FR-003**: System MUST adjust ball audio playback to match the configured spin duration
- **FR-004**: System MUST play "no-more-bets.wav" when the "No More Bets" message is displayed
- **FR-005**: System MUST play "the-winning-number-is.wav" when the result is about to be shown
- **FR-006**: System MUST play the correct result audio file based on the winning number, color, and odd/even
- **FR-007**: System MUST map all 37 numbers (0-36) to their corresponding voice audio files
- **FR-008**: System MUST handle audio playback failures gracefully without affecting gameplay
- **FR-009**: System MUST stop any playing audio when a new spin begins
- **FR-010**: System MUST sequence result audio correctly: "the winning number is" → result number announcement

### Key Entities

- **Ball Audio Files**: 7 MP3 files (ball-1.mp3 through ball-7.mp3) of varying lengths for spin sounds
- **Voice Audio Files**: 40 WAV files containing:
  - 37 result announcements (one per number, including color and odd/even)
  - "no-more-bets.wav" for betting closure announcement
  - "the-winning-number-is.wav" for result introduction
  - "zero.wav" for the special case of 0

### Audio File Mapping

| Number | Color  | Odd/Even | Audio File                  |
|--------|--------|----------|-----------------------------|
| 0      | green  | -        | zero.wav                    |
| 1      | red    | odd      | one-red-odd.wav             |
| 2      | black  | even     | two-black-even.wav          |
| 3      | red    | odd      | three-red-odd.wav           |
| 4      | black  | even     | four-black-even.wav         |
| 5      | red    | odd      | five-red-odd.wav            |
| 6      | black  | even     | six-black-even.wav          |
| 7      | red    | odd      | seven-red-odd.wav           |
| 8      | black  | even     | eight-black-even.wav        |
| 9      | red    | odd      | nine-red-odd.wav            |
| 10     | black  | even     | ten-black-even.wav          |
| 11     | black  | odd      | eleven-black-odd.wav        |
| 12     | red    | even     | twelve-red-even.wav         |
| 13     | black  | odd      | thirteen-black-odd.wav      |
| 14     | red    | even     | fourteen-red-even.wav       |
| 15     | black  | odd      | fifteen-black-odd.wav       |
| 16     | red    | even     | sixteen-red-even.wav        |
| 17     | black  | odd      | seventeen-black-odd.wav     |
| 18     | red    | even     | eighteen-red-even.wav       |
| 19     | red    | odd      | nineteen-red-odd.wav        |
| 20     | black  | even     | twenty-black-even.wav       |
| 21     | red    | odd      | twenty-one-red-odd.wav      |
| 22     | black  | even     | twenty-two-black-even.wav   |
| 23     | red    | odd      | twenty-three-red-odd.wav    |
| 24     | black  | even     | twenty-four-black-even.wav  |
| 25     | red    | odd      | twenty-five-red-odd.wav     |
| 26     | black  | even     | twenty-six-black-even.wav   |
| 27     | red    | odd      | twenty-seven-red-odd.wav    |
| 28     | black  | even     | twenty-eight-black-even.wav |
| 29     | black  | odd      | twenty-nine-black-odd.wav   |
| 30     | red    | even     | thirty-red-even.wav         |
| 31     | black  | odd      | thirty-one-black-odd.wav    |
| 32     | red    | even     | thirty-two-red-even.wav     |
| 33     | black  | odd      | thirty-three-black-odd.wav  |
| 34     | red    | even     | thirty-four-red-even.wav    |
| 35     | black  | odd      | thirty-five-black-odd.wav   |
| 36     | red    | even     | thirty-six-red-even.wav     |

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Ball spin audio plays within 100ms of spin animation starting
- **SC-002**: Ball audio duration matches spin duration within 500ms tolerance
- **SC-003**: "No more bets" audio plays synchronized with on-screen message display
- **SC-004**: Result announcement sequence completes within 5 seconds of result reveal
- **SC-005**: Correct result audio file plays for 100% of possible outcomes (all 37 numbers)
- **SC-006**: Audio failures do not prevent game functionality - gameplay continues uninterrupted
- **SC-007**: Random ball audio selection shows variety - no single file plays more than 3 times consecutively

## Assumptions

- Audio files are pre-loaded or can be loaded quickly enough to not cause noticeable delays
- The display page (where the wheel is shown) is the only page that needs audio
- Browser audio autoplay policies may require user interaction before audio can play (first spin may need a click)
- Ball audio files have varying lengths and will need playback rate adjustment to match spin duration
- All voice audio files are in WAV format and ball audio files are in MP3 format
