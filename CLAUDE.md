# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo layout

This repo publishes **two npm packages** from the same tag:

- `@palisadeinc/embedded-wallets-sdk` — the actual SDK, source in `src/index.js`, types in `types/index.d.ts`, config in `package.json` (repo root).
- `@palisadeinc/identity-sdk` — a **bridge / deprecation package**, source in `bridge/`. It depends on the new package, re-exports everything from it, and additionally re-exports the new `PalisadeSDK` class under the old name `PalisadeIdentitySDK`. It prints a `console.warn` on load pointing users at the new name. This exists so existing consumers of the old package name keep working during migration. Do NOT put new code into `bridge/` — its job is purely to forward.

The repo was previously called "Identity SDK". If you find lingering references to that name in code or docs, treat them as bugs *unless* they refer to the backend "Identity" service (hostnames `identity.<env>.palisade.co`, cookie name `PAL.auth`, error prefix `PAL.ERROR.*`) — those are backend/wire identifiers and intentionally still say "Identity".

## Commands

- **Build**: `npm run build` (runs `build:cjs` then `build:esm` via esbuild, outputs to `dist/`, which is git-ignored and regenerated).
- **Build a single format**: `npm run build:cjs` or `npm run build:esm`.
- **Tests**: none configured. `npm test` intentionally exits 1.
- **Publish**: do NOT publish locally. A push of a `v*.*.*` (or `-alpha.*` / `-beta.*` / `-rc.*`) git tag triggers `.github/workflows/publish.yml`, which syncs both `package.json` files to the tag version, builds, publishes the new package first, then publishes the bridge (pointing at the just-published new-package version via caret range). Pre-release tags publish under the corresponding npm dist-tag. Publish order matters — bridge must go second because it depends on the new package resolving on the registry.

## Architecture

Single-entry browser SDK. All runtime code lives in `src/index.js` (~740 lines) and is bundled to dual CJS/ESM outputs. There is no source tree beyond that file; new features go inside the `PalisadeSDK` class.

**Key structural facts to keep in mind when editing:**

- **Singleton via `static instance`.** `new PalisadeSDK(...)` returns the existing instance on repeat calls, so constructor side-effects (message listener, config) run exactly once per page.
- **Cross-window protocol.** The SDK opens a popup at `identity.<env>.palisade.co` and communicates via `window.postMessage`. The origin check in `#initialiseMessageEventListener` uses `this.sdkConfig.domain`; changing the domain resolution logic will silently drop all messages. Messages carry a `type` (`ERROR` | `EVENT` | `LOG`) and, for events, a `code` (`PAL.EVENT.001`–`PAL.EVENT.008`) mapped in `#utils.onEvent`.
- **Popup-blocker workaround.** `signTransaction` / `submitTransaction` call `#utils.openModalPlaceholder()` (opens `about:blank` synchronously inside the user-gesture) BEFORE the async API call, then `#utils.openModal(...)` reuses `PalisadeSDK.openedWindow` and sets its URL. Preserve this ordering — inverting it will re-introduce popup blocking.
- **Auth is cookie-based.** JWT stored in cookie `PAL.auth` (7-day expiry, set by `#utils.setCookie` on connect). `#utils.withAuthToken` injects `Authorization: Bearer <jwt>`, `X-Client-ID`, and `X-Origin` on every API call and returns `null` when the cookie is missing — callers must handle that null and disconnect.
- **Environment → domain mapping.** `DEVELOPMENT`/`SANDBOX`/`PRODUCTION` in the client config map to `identity.development|sandbox|<none>.palisade.co`. An unknown environment falls back to sandbox. A `?domain=` URL query param overrides everything (used for local Identity UI dev).
- **Error code partitioning.** Service-level errors are `PAL.ERROR.001`–`099` (originated by the Identity backend / UI, forwarded via postMessage). SDK-level errors start at `PAL.ERROR.101`. Keep new SDK errors in the 100+ range and add them in three places: `sdkConfig.errorCodes`, `sdkConfig.errorMessages`, and the `ErrorCode` enum + README table.
- **Public event surface.** Exactly six events are exposed via `on`/`off`/`emit`: `connected`, `disconnected`, `error`, `transaction-approved`, `transaction-rejected`, `transaction-failed`. `publicEvents` is a private `EventEmitter` that throws on unknown event names — additions require updating the `publicEventNames` array *and* the overloaded `on(...)` declarations in `types/index.d.ts`.
- **Types are hand-maintained.** `types/index.d.ts` is the published TypeScript surface and is NOT generated from the JS. When you add/change a public method, event payload, config field, or error code, edit both files together or consumers get stale types.

## Conventions

- Formatting is enforced by `.prettierrc`: single quotes, semicolons, no trailing commas, 80-col print width. The source uses 4-space indentation.
- `dist/` is git-ignored and generated at publish time; only `dist/`, `types/`, `CHANGELOG.md`, `LICENSE`, `README.md` are shipped to npm (`files` in `package.json`).
- Update `CHANGELOG.md` (Keep-a-Changelog format, DESC order — newest at top) for any user-visible change before tagging a release.
- Version numbers stay in lockstep across both packages. The publish workflow reads the git tag once and applies it to root `package.json` and `bridge/package.json` together.
