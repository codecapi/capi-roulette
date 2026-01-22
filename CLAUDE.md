# app Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-20

## Active Technologies
- TypeScript 5.4+ (Bun runtime 1.1+) (002-display-dealer-only)
- In-memory session storage (no persistence beyond browser session) (002-display-dealer-only)
- In-memory (spin configuration as server constants) (003-css-roulette-wheel)
- TypeScript 5.4+ (Bun backend), TypeScript 5.9+ (Svelte frontend) + Bun (server), SvelteKit 2.x, Svelte 5, Vite 7.x, Web Audio API (browser) (004-roulette-audio)
- Static audio files served from client/public/ or server (004-roulette-audio)

- TypeScript 5.x (both frontend and backend) + Svelte 5, SvelteKit 2, Bun 1.1+, Tailwind CSS 4 (001-web-roulette-game)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x (both frontend and backend): Follow standard conventions

## Recent Changes
- 004-roulette-audio: Added TypeScript 5.4+ (Bun backend), TypeScript 5.9+ (Svelte frontend) + Bun (server), SvelteKit 2.x, Svelte 5, Vite 7.x, Web Audio API (browser)
- 003-css-roulette-wheel: Added TypeScript 5.4+ (Bun runtime 1.1+)
- 002-display-dealer-only: Added TypeScript 5.4+ (Bun runtime 1.1+)


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
