# Research: Web-Based Roulette Game

**Date**: 2026-01-20
**Feature**: 001-web-roulette-game

## Technology Decisions

### 1. Frontend Framework

**Decision**: Svelte 5 with SvelteKit 2

**Rationale**:
- Compiles away framework overhead (~1.6KB vs React's 42KB) - instant loads on mobile
- No virtual DOM diffing - better animation performance
- File-based routing perfect for multiple page types (/display, /dealer, /play)
- Built-in stores for reactive game state management
- Native WebSocket support being added (March 2025)

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| React 19 | Larger bundle (42KB), more boilerplate, overkill for party game |
| Vue 4 | Good option, but Svelte's compile-time approach better fits performance needs |
| Plain HTML/JS | Would work, but Svelte's reactivity makes state management cleaner |

---

### 2. Backend Runtime

**Decision**: Bun 1.1+

**Rationale**:
- ~5x faster than Node.js (68k req/s vs 14k)
- 3x less memory usage than Node.js
- Built-in WebSocket support with native pub/sub - no additional library needed
- Built-in bundler, test runner, package manager
- Simple `Bun.file()` and `Bun.write()` for JSON persistence
- Single binary deployment

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| Node.js 22+ | Requires additional WebSocket library, slower startup, more dependencies |
| Deno | Security-first focus overkill for party game, smaller ecosystem |
| Express + Node | More complex setup, slower, unnecessary abstraction layer |

---

### 3. WebSocket Implementation

**Decision**: Bun native WebSockets (built-in)

**Rationale**:
- Zero dependencies - built on uWebSockets (one of fastest implementations)
- Native pub/sub API perfect for game state broadcasting
- Memory efficient handler pattern (object methods vs per-socket listeners)
- Example fits our use case exactly:
  ```javascript
  Bun.serve({
    websocket: {
      open(ws) { ws.subscribe("game-state"); },
      message(ws, msg) { ws.publish("game-state", msg); },
      close(ws) { ws.unsubscribe("game-state"); }
    }
  });
  ```

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| Socket.IO | 15-20KB overhead, proprietary protocol (clients can't connect to plain WS) |
| ws library | Good but Bun native is faster and already built-in |

**Note**: For automatic reconnection, add `reconnecting-websocket` (~2KB) on client if needed.

---

### 4. Animation Approach

**Decision**: HTML5 Canvas 2D (native, no library)

**Rationale**:
- Sufficient for 60fps on modern hardware for 2D wheel rotation
- No library overhead - native Canvas API is well-documented
- Hardware-accelerated on all modern mobile browsers
- Full control over physics-based deceleration and ball trajectory

**Implementation Approach**:
```javascript
// Wheel spinning with deceleration
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(currentAngle);
  drawWheel();
  ctx.restore();

  currentAngle += angularVelocity;
  angularVelocity *= friction; // 0.98-0.995 for realistic slowdown

  if (angularVelocity > 0.001) {
    requestAnimationFrame(animate);
  }
}
```

**Ball Physics** (simplified, no physics library):
```javascript
let ballAngle = 0;
let ballRadius = wheelRadius - 10;
let ballAngularVelocity = 0.15;

function updateBall() {
  ballAngle += ballAngularVelocity;
  ballAngularVelocity *= 0.995;

  if (ballAngularVelocity < 0.02 && ballRadius > pocketRadius) {
    ballRadius -= 0.5; // Drop into center
  }
}
```

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| WebGL/PixiJS | Fastest but overkill for single wheel, adds ~150KB |
| Three.js | 3D unnecessary for 2D wheel view |
| CSS Animations | Can't control physics-based deceleration or ball trajectory |
| Konva.js | Slower than plain Canvas for pure animations |
| Phaser | Full game engine overkill (~1MB) |

---

### 5. Testing Framework

**Decision**: Vitest (unit) + Playwright (E2E)

**Rationale**:
- Vitest: Native ESM support, Vite-based (matches SvelteKit), fast watch mode
- Playwright: Cross-browser testing, mobile emulation, WebSocket support
- Both work well with Bun runtime

---

### 6. CSS/Styling

**Decision**: Tailwind CSS 4

**Rationale**:
- Build-time only (no runtime overhead)
- Rapid prototyping for party game
- Responsive utilities for mobile/TV views
- Works seamlessly with SvelteKit

---

## Final Stack Summary

```
Frontend:
├── Svelte 5 (^5.0.0)
├── SvelteKit 2 (^2.0.0)
├── HTML5 Canvas 2D (native)
├── Tailwind CSS 4
└── Vite (bundled with SvelteKit)

Backend:
├── Bun (^1.1.0)
├── Bun.serve() for HTTP
├── Bun native WebSocket with pub/sub
└── Bun.file()/Bun.write() for JSON

Testing:
├── Vitest (unit)
└── Playwright (E2E)

Optional (if needed):
├── reconnecting-websocket (~2KB) - auto-reconnect
└── @sveltejs/adapter-node - for production deployment
```

## Resolved Clarifications

| Item | Resolution |
|------|------------|
| Frontend framework | Svelte 5 + SvelteKit 2 |
| Backend runtime | Bun 1.1+ |
| WebSocket library | Bun native (built-in) |
| Animation approach | HTML5 Canvas 2D (no library) |
| Testing | Vitest + Playwright |
| Styling | Tailwind CSS 4 |

## References

- [Bun WebSockets Documentation](https://bun.sh/docs/api/websockets)
- [SvelteKit Routing](https://kit.svelte.dev/docs/routing)
- [Canvas Animation MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Basic_animations)
- [Svelte 5 Runes](https://svelte.dev/blog/runes)
