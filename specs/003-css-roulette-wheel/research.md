# Research: CSS Roulette Wheel Animation

**Feature**: 003-css-roulette-wheel
**Date**: 2026-01-21

## CSS Wheel Rendering Approach

### Decision: CSS Transform-based Segments

**Rationale**: The CodePen reference uses CSS transforms to position 37 slices around a circle. Each segment is rotated using `transform-origin: 50% 100%` and `rotateZ()` to position it at the correct angle. This approach is:
- Pure CSS (no canvas/SVG required)
- Performant (GPU-accelerated transforms)
- Easy to style with gradients and borders

**Alternatives Considered**:
1. **Canvas rendering**: More control but requires JavaScript for drawing, harder to style
2. **SVG wheel**: Good alternative but CodePen uses CSS, stick with reference
3. **Conic gradient**: Modern CSS but limited browser support for segment borders

### Implementation Pattern

```css
/* Each segment positioned via rotation */
.segment {
  transform-origin: 50% 100%;
  transform: rotateZ(calc(360deg / 37 * var(--index)));
}
```

## Ball Animation Technique

### Decision: CSS Transition with data-attribute targeting

**Rationale**: The CodePen uses a `data-spinto` attribute on the wheel container to trigger CSS transitions. The ball position is calculated as a rotation angle that includes multiple full rotations plus the final position offset.

**Key formula**:
```
finalAngle = (360 * numberOfSpins) + (slotIndex / 37 * 360)
```

**Animation properties**:
- `transition: transform 9s ease-out` (or configurable duration)
- Ball starts at random position
- Decelerates naturally via `ease-out` timing function

**Alternatives Considered**:
1. **JavaScript requestAnimationFrame**: More control but unnecessary complexity
2. **CSS @keyframes**: Less flexible for dynamic end positions
3. **Web Animations API**: Overkill for this use case

## Spin Duration Configuration

### Decision: Server-side random selection within range

**Rationale**: Server generates random duration (8000-12000ms) when spin is triggered and sends it to clients. This ensures:
- All connected displays show identical animation timing
- Duration varies per round automatically
- Easy to adjust range via server constants

**Data flow**:
1. Dealer triggers spin with winning number
2. Server generates random duration within configured range
3. Server broadcasts `wheel_update` with `duration` field
4. Client applies duration to CSS transition

## European Roulette Number Order

### Decision: Use existing WHEEL_ORDER constant

**Rationale**: The server already has the correct European roulette wheel order defined in `constants.ts`. The client will use the same order for rendering segments.

**Order** (clockwise from 0):
```
0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
```

## Color Scheme

### Decision: Standard European roulette colors

- **Red**: #dc2626 (Tailwind red-600)
- **Black**: #1f2937 (Tailwind gray-800)
- **Green** (zero only): #16a34a (Tailwind green-600)
- **Trim/borders**: #d4af37 (gold) for premium look

## Responsive Sizing

### Decision: CSS viewport units with max constraint

**Rationale**: Use `min(500px, 80vmin)` for wheel size to ensure:
- Large enough on TV displays (500px diameter)
- Scales down appropriately on smaller screens
- Maintains aspect ratio automatically

## Browser Compatibility

### Decision: Modern browsers only (CSS transforms required)

**Minimum support**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

All target browsers support CSS transforms, transitions, and CSS custom properties (variables).

## Summary of Research Findings

| Topic | Decision | Confidence |
|-------|----------|------------|
| Wheel rendering | CSS transform-based segments | High |
| Ball animation | CSS transition with data-attribute | High |
| Spin duration | Server-generated random within range | High |
| Number order | Use existing WHEEL_ORDER constant | High |
| Colors | Standard roulette colors with gold trim | High |
| Sizing | Viewport-relative with max constraint | High |
| Compatibility | Modern browsers (CSS transforms) | High |

All research questions resolved. Ready for Phase 1 design.
