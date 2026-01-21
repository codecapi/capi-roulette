# Data Model: CSS Roulette Wheel Animation

**Feature**: 003-css-roulette-wheel
**Date**: 2026-01-21

## Entity Changes

### SpinConfiguration (New - Server Constants)

Configuration for wheel spin animation timing.

| Field | Type | Description |
|-------|------|-------------|
| minDuration | number | Minimum spin duration in milliseconds (default: 8000) |
| maxDuration | number | Maximum spin duration in milliseconds (default: 12000) |
| ballRotations | number | Minimum full rotations before settling (default: 5) |

**Location**: `server/src/game/constants.ts`

### WheelState (Updated)

Current state of wheel animation, broadcast to display clients.

| Field | Type | Description | Change |
|-------|------|-------------|--------|
| wheelAngle | number | Current wheel rotation in radians | Existing |
| ballAngle | number | Current ball position in radians | Existing |
| ballRadius | number | Ball distance from center | Existing |
| isSpinning | boolean | Whether animation is active | Existing |
| spinDuration | number | Duration of current spin in ms | **New** |
| targetSlot | number | Target slot index (0-36) for ball landing | **New** |

### WSWheelUpdateMessage (Updated)

WebSocket message for wheel animation updates.

```typescript
interface WSWheelUpdateMessage {
  type: 'wheel_update';
  data: {
    wheelAngle: number;
    ballAngle: number;
    ballRadius: number;
    isSpinning: boolean;
    spinDuration?: number;  // New: only sent at spin start
    targetSlot?: number;    // New: slot index for CSS animation
  };
}
```

## Static Data

### WHEEL_ORDER (Existing)

European roulette wheel number sequence (no changes needed).

```typescript
const WHEEL_ORDER = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
  24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];
```

### RED_NUMBERS (Existing)

Numbers that display as red on the wheel.

```typescript
const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
```

## Client-Side State

### CSSWheelState (New - Component State)

Internal state for the CSS wheel component.

| Field | Type | Description |
|-------|------|-------------|
| currentRotation | number | Current wheel rotation in degrees |
| ballTargetAngle | number | Target angle for ball CSS transition |
| animationDuration | number | Duration for CSS transition |
| isAnimating | boolean | Prevents multiple simultaneous animations |

## State Transitions

### Spin Animation Flow

```
idle → spinning → showing_result
         │
         ├─ Server generates random duration (8000-12000ms)
         ├─ Server calculates target slot from winning number
         ├─ Server broadcasts wheel_update with duration + targetSlot
         │
         └─ Client:
            ├─ Sets CSS transition duration
            ├─ Sets ball target rotation (spins + final position)
            ├─ CSS handles animation
            └─ animationend event triggers result display
```

## Validation Rules

1. **spinDuration**: Must be between minDuration and maxDuration
2. **targetSlot**: Must be 0-36 (valid wheel position)
3. **winningNumber**: Must match the number at targetSlot position in WHEEL_ORDER

## Computed Values

### Slot Angle Calculation

```typescript
function getSlotAngle(slotIndex: number): number {
  return (slotIndex / 37) * 360;  // Degrees
}
```

### Ball Final Rotation

```typescript
function getBallFinalRotation(slotIndex: number, spins: number): number {
  const baseRotation = spins * 360;  // Full rotations
  const slotAngle = getSlotAngle(slotIndex);
  return baseRotation + slotAngle;  // Total degrees
}
```
