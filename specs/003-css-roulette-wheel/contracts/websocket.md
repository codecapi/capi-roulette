# WebSocket Contract: CSS Roulette Wheel Animation

**Feature**: 003-css-roulette-wheel
**Date**: 2026-01-21

## Message Changes

### wheel_update (Server → Client)

Updated message to include spin duration and target slot for CSS animation.

**When sent**: At spin start and during animation (30fps updates)

**Payload**:
```typescript
{
  type: 'wheel_update',
  data: {
    // Existing fields (for backwards compatibility / fallback animation)
    wheelAngle: number,      // Current wheel rotation in radians
    ballAngle: number,       // Current ball position in radians
    ballRadius: number,      // Ball distance from center
    isSpinning: boolean,     // Animation active flag

    // New fields (for CSS animation)
    spinDuration?: number,   // Duration in ms (only at spin start)
    targetSlot?: number      // Target slot index 0-36 (only at spin start)
  }
}
```

**Example - Spin Start**:
```json
{
  "type": "wheel_update",
  "data": {
    "wheelAngle": 0,
    "ballAngle": 0,
    "ballRadius": 150,
    "isSpinning": true,
    "spinDuration": 9500,
    "targetSlot": 17
  }
}
```

**Example - Animation Update**:
```json
{
  "type": "wheel_update",
  "data": {
    "wheelAngle": 3.14159,
    "ballAngle": 12.566,
    "ballRadius": 120,
    "isSpinning": true
  }
}
```

**Example - Spin Complete**:
```json
{
  "type": "wheel_update",
  "data": {
    "wheelAngle": 6.283,
    "ballAngle": 18.849,
    "ballRadius": 100,
    "isSpinning": false
  }
}
```

## Client Behavior

### CSS Wheel Component

1. **On receiving `wheel_update` with `spinDuration` and `targetSlot`**:
   - Calculate ball final rotation: `(5 * 360) + (targetSlot / 37 * 360)` degrees
   - Set CSS transition: `transition: transform ${spinDuration}ms ease-out`
   - Apply rotation transform to ball element
   - Set `isAnimating = true`

2. **On CSS `transitionend` event**:
   - Set `isAnimating = false`
   - (Result overlay handled by existing phase_change message)

3. **During animation (30fps updates)**:
   - CSS wheel ignores intermediate wheel_update messages
   - CSS transition handles smooth animation automatically

### Fallback Behavior

If client doesn't support CSS wheel (future consideration):
- Use existing `wheelAngle`/`ballAngle` values for JavaScript animation
- Server continues sending 30fps updates as before

## No API Changes

This feature does not add or modify any REST API endpoints. All changes are WebSocket-only.

## Backwards Compatibility

- Existing fields preserved in wheel_update message
- New fields are optional (undefined for non-spin updates)
- Older clients can continue using existing animation approach
