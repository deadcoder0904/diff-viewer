# Repository Guidelines

## Project Structure & Module Organization

This is a Vite + React + TypeScript app.

- `src/` contains application code (`App.tsx`, `main.tsx`) and styles (`*.css`).
- `src/assets/` holds bundled static assets imported by the app.
- `public/` contains static files served as-is (e.g., `public/vite.svg`).
- Root config files: `vite.config.ts`, `tsconfig*.json`, `oxlint.json`, `oxfmt.json`.

## Build, Test, and Development Commands

Use Bun to run scripts defined in `package.json`:

- `bun install` — install dependencies.
- `bun run dev` — start the Vite dev server with HMR.
- `bun run build` — type-check and build production assets.
- `bun run preview` — serve the production build locally.
- `bun run lint` — run OXLint across the repo.
- `bun run format` / `bun run format:check` — format or check formatting via OXFMT.

## Coding Style & Naming Conventions

- Indentation: 2 spaces in JSON and typical TS/TSX formatting (handled by OXFMT).
- TypeScript/React: prefer function components, co-locate component styles in `src/`.
- File naming: `PascalCase` for components (`App.tsx`), `kebab-case` for asset files.
- Run `bun run format` before committing to ensure consistent formatting.

## Testing Guidelines

No test framework is configured yet. If tests are added, place them in `src/` next to
the code under test (e.g., `Component.test.tsx`) and document the command here.

## Commit & Pull Request Guidelines

No Git history is present in this directory, so commit conventions are not established.
If you initialize a repo, prefer a conventional format like `feat: add diff view`.
Pull requests should include a clear description, steps to verify, and screenshots for UI changes.

## Security & Configuration Tips

- Keep local environment variables in `.env` (not committed) if added in the future.
- Avoid adding secrets to `public/` or `src/` since those assets are shipped to clients.
