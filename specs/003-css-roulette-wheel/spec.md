# Feature Specification: CSS Roulette Wheel Animation

**Feature Branch**: `003-css-roulette-wheel`
**Created**: 2026-01-21
**Status**: Draft
**Input**: User description: "I found this pen on codepen and like how the roulette works. Can you implement the roulette wheel from the pen into our application? Of course the button should still be on the dealer page. I want the time the ball spins to be configurable or at least variable between rounds. This is the pen: https://codepen.io/pder/pen/WYrRQm"

## Clarifications

### Session 2026-01-21

- Q: Wheel visual approach (CSS-drawn vs image-based)? → A: Pure CSS wheel - animated segments drawn with CSS (like the CodePen reference)

## Overview

Replace the current wheel display with a CSS-based animated roulette wheel inspired by the CodePen implementation by PDER. The new wheel will feature realistic spinning animation with a ball that travels around the wheel before settling on the winning number. The spin duration will be configurable to allow variety between rounds.

**Reference**: [CSS Roulette Wheel by PDER](https://codepen.io/pder/pen/WYrRQm)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dealer Triggers Wheel Spin (Priority: P1)

The dealer enters the winning number and clicks SPIN on the dealer control panel. The display page shows an animated roulette wheel with a ball spinning around the outer track, decelerating smoothly before landing on the winning number. The animation duration varies to keep the experience engaging.

**Why this priority**: This is the core feature - without the animated wheel spin, the entire feature has no value. This delivers the primary visual experience.

**Independent Test**: Can be fully tested by entering any number (0-36) on dealer panel, clicking SPIN, and observing the wheel animation complete with ball landing on the correct number.

**Acceptance Scenarios**:

1. **Given** a betting closed phase, **When** the dealer enters number 17 and clicks SPIN, **Then** the display shows the wheel spinning with a ball that eventually settles on position 17.

2. **Given** a betting closed phase, **When** the dealer triggers a spin, **Then** the ball makes multiple rotations around the wheel before decelerating and stopping.

3. **Given** a spin in progress, **When** the animation completes, **Then** the winning number is clearly visible and the result overlay appears.

---

### User Story 2 - Variable Spin Duration (Priority: P2)

Each spin has a slightly different duration to maintain viewer interest and unpredictability. The spin time varies within a configured range, making each round feel unique rather than mechanical.

**Why this priority**: Important for user experience but the core animation works without it. This adds polish and engagement.

**Independent Test**: Can be tested by triggering multiple spins and timing each one - durations should vary within the expected range.

**Acceptance Scenarios**:

1. **Given** a configured spin duration range of 8-12 seconds, **When** multiple spins are triggered, **Then** each spin duration falls within this range.

2. **Given** two consecutive spins, **When** both complete, **Then** they have noticeably different durations (not identical).

---

### User Story 3 - Wheel Displays Correctly on All Screens (Priority: P3)

The wheel animation displays properly on various screen sizes, from large TVs/projectors to smaller monitors, maintaining proper proportions and readability of numbers.

**Why this priority**: Important for real-world use but secondary to the core spinning functionality.

**Independent Test**: Can be tested by viewing the display page on different screen sizes and verifying the wheel remains centered, properly sized, and readable.

**Acceptance Scenarios**:

1. **Given** a large display (TV/projector), **When** viewing the display page, **Then** the wheel fills an appropriate portion of the screen with readable numbers.

2. **Given** a standard monitor, **When** viewing the display page, **Then** the wheel displays at a reasonable size with all elements visible.

---

### Edge Cases

- What happens if the dealer triggers a spin while one is already in progress? The system should ignore additional spin requests during animation.
- What happens if the connection is lost mid-spin? The display should complete the current animation since it's client-side driven.
- What happens if an invalid number (e.g., 37, -1) is sent? The system should reject the spin with an error message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Display page MUST render a CSS-drawn circular roulette wheel with all 37 numbers (0-36) positioned correctly in European roulette order (no image assets for the wheel itself).
- **FR-002**: Display page MUST show a ball element that animates around the wheel during spin.
- **FR-003**: Ball animation MUST make multiple full rotations before decelerating and stopping.
- **FR-004**: Ball MUST stop on the correct winning number position as determined by dealer input.
- **FR-005**: Wheel visual MUST use alternating red/black colors with green for zero, matching European roulette.
- **FR-006**: Spin duration MUST vary between rounds within a configurable range (default: 8-12 seconds).
- **FR-007**: System MUST prevent multiple simultaneous spin animations.
- **FR-008**: Current result MUST be clearly displayed when the ball comes to rest.
- **FR-009**: Dealer controls MUST remain on the dealer page (not on display page).
- **FR-010**: Animation MUST use smooth easing for realistic deceleration effect.

### Key Entities

- **WheelState**: Current rotation angle of wheel, ball position, spin status, target number
- **SpinConfiguration**: Minimum duration, maximum duration, number of ball rotations

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Viewers can clearly see the ball spinning and landing on a number from a distance of 3 meters on a standard TV display.
- **SC-002**: Spin duration varies by at least 2 seconds between any two random spins (within the configured 8-12 second range).
- **SC-003**: Ball lands on the correct winning number 100% of the time.
- **SC-004**: Animation runs smoothly at 30+ frames per second on standard devices.
- **SC-005**: The winning number is identifiable within 1 second of the ball stopping.

## Assumptions

- The wheel will be rendered entirely with CSS (no wheel.png image) - segments, numbers, and colors drawn programmatically
- The CodePen implementation serves as the primary reference; code will be adapted for the application's architecture
- Animation is driven client-side with the server providing only the winning number
- Spin duration configuration will use server-side constants initially (future enhancement could add UI controls)
