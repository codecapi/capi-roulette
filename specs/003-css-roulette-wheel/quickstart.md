# Quickstart: CSS Roulette Wheel Animation

**Feature**: 003-css-roulette-wheel
**Date**: 2026-01-21

## Overview

This feature replaces the image-based roulette wheel with a pure CSS-drawn wheel, featuring animated ball spin with configurable duration.

## Prerequisites

- Node.js 18+ or Bun 1.1+
- Existing capi-roulette app running

## Key Files to Modify

### Server (2 files)

1. **`server/src/game/constants.ts`**
   - Add `SPIN_CONFIG` with min/max duration

2. **`server/src/game/state-machine.ts`**
   - Generate random duration on spin trigger
   - Send duration and targetSlot in wheel_update

### Client (3 files)

1. **`client/src/lib/components/wheel/CSSRouletteWheel.svelte`** (NEW)
   - CSS-drawn wheel with 37 segments
   - Ball element with CSS transition animation
   - Props: `targetSlot`, `spinDuration`, `isSpinning`

2. **`client/src/routes/display/+page.svelte`**
   - Replace `<img src="/wheel.png">` with `<CSSRouletteWheel />`
   - Pass wheel state as props

3. **`client/src/lib/stores/game.ts`**
   - Handle new `spinDuration` and `targetSlot` fields

## Development Workflow

```bash
# 1. Start the development server
bun run dev

# 2. Open display page
open http://localhost:5173/display

# 3. Open dealer page in another tab
open http://localhost:5173/dealer

# 4. Test spin animation
#    - Enter password, create session
#    - Click "BETS OPEN" → "BETS CLOSE"
#    - Enter number (0-36), click "SPIN"
#    - Observe CSS wheel animation
```

## CSS Wheel Implementation Pattern

```svelte
<!-- CSSRouletteWheel.svelte -->
<div class="wheel" style="--spin-duration: {spinDuration}ms">
  {#each WHEEL_ORDER as number, index}
    <div
      class="segment"
      class:red={isRed(number)}
      class:black={isBlack(number)}
      class:green={number === 0}
      style="--index: {index}"
    >
      <span class="number">{number}</span>
    </div>
  {/each}

  <div
    class="ball"
    class:spinning={isSpinning}
    style="--target-rotation: {targetRotation}deg"
  />
</div>

<style>
  .segment {
    transform-origin: 50% 100%;
    transform: rotateZ(calc(360deg / 37 * var(--index)));
  }

  .ball {
    transition: transform var(--spin-duration) ease-out;
  }

  .ball.spinning {
    transform: rotateZ(var(--target-rotation));
  }
</style>
```

## Testing Checklist

- [ ] Wheel displays 37 numbered segments in correct order
- [ ] Colors match European roulette (red/black/green)
- [ ] Ball animates smoothly for 8-12 seconds
- [ ] Ball lands on correct winning number
- [ ] Multiple spins have varying durations
- [ ] Animation completes before showing result overlay
- [ ] Wheel displays properly on large TV (500px+)
- [ ] Wheel scales appropriately on smaller screens

## Common Issues

### Ball doesn't animate
- Check that `spinDuration` and `targetSlot` are being received from server
- Verify CSS transition is applied to ball element

### Numbers in wrong order
- Use `WHEEL_ORDER` constant from `constants.ts`
- Don't confuse number value with slot index

### Animation too fast/slow
- Check `SPIN_CONFIG.minDuration` and `maxDuration` values
- Verify duration is in milliseconds (8000-12000, not 8-12)

## Reference

- [CodePen: CSS Roulette Wheel by PDER](https://codepen.io/pder/pen/WYrRQm)
- [Feature Spec](./spec.md)
- [Data Model](./data-model.md)
