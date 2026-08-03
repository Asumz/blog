# Repository Guidelines

## Project Structure & Module Organization

This repository builds a Chinese-language VitePress blog. Author-facing content lives under `docs/`: project retrospectives are in `docs/notes/`, frontend articles are in `docs/frontend/`, and `docs/index.md` is the landing page. Static files such as icons belong in `docs/public/` and are served from `/`.

Site configuration is split across `docs/.vitepress/config/index.ts` (VitePress and theme settings) and `docs/.vitepress/config/routes.ts` (navigation and sidebar entries). Theme overrides live in `docs/.vitepress/theme/`. Generated `cache/` and `dist/` directories must not be committed.

## Build, Test, and Development Commands

- `npm ci` installs the exact dependency versions from `package-lock.json`; use it in clean environments and CI.
- `npm run docs:dev` clears the previous build and starts the local VitePress server with hot reload.
- `npm run docs:build` produces the deployable site in `docs/.vitepress/dist/` and catches broken VitePress configuration or Markdown compilation.
- `npm run docs:preview` serves the production build for final browser checks.
- `npm run format:check` verifies formatting without changing files; `npm run format` applies Prettier fixes.

## Coding Style & Naming Conventions

Use two-space indentation, LF line endings, single quotes, no semicolons, and trailing commas in TypeScript, as defined by `.prettierrc.json`. Keep lines near the configured 120-character limit. Name article files in lowercase kebab-case, for example `docs/frontend/http-cache.md`. Use one descriptive H1 per article, logical H2/H3 sections, fenced code blocks with language tags, and root-relative links for site content.

When adding or moving an article, update `docs/.vitepress/config/routes.ts` and the relevant list in `docs/index.md` in the same change.

## Testing Guidelines

There is no unit-test framework or coverage target. Before submitting, run `npm run format:check` and `npm run docs:build`. For navigation, layout, image, or Mermaid changes, also inspect the affected pages through `npm run docs:dev` or `npm run docs:preview`, including both light and dark themes where relevant.

## Commit & Pull Request Guidelines

Recent history primarily follows Conventional Commit subjects such as `docs(blog): ...`, `refactor(routes): ...`, and `style(nav): ...`. Prefer `<type>(<scope>): <concise summary>` and keep each commit focused.

Pull requests should summarize the content or configuration changed, list validation commands run, and link related issues when available. Include screenshots for visible theme, navigation, asset, or diagram changes. Do not commit `node_modules/`, VitePress caches, or generated build output.
