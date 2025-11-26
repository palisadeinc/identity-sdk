# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.0.3] - 2025-11-26

### Added

- Ability to `autoconnect`, skipping the connection state in the flow

### Updated

- Bugfix to prevent actioning multiple events on event emitting
- Update README to include missing `environment` property and `config.autoconnect`

## [1.0.2] - 2025-10-06

### Added

- `transaction-failed` event for failed transactions, including `transactionId`, `reasons` (array) and `transactionStatus`

## [1.0.1] - 2025-09-23

### Updated

- `openWindow` mechanism updated for sign/submit transaction methods to prevent popup blocking by making sure the window is pre-opened immediately on user interaction

## [1.0.0-alpha.21] - 2025-08-27

### Added

- New optional `logoUrl` property to `PalisadeIdentitySDK` config to add custom branding
- New optional `logoAlt` property to `PalisadeIdentitySDK` config to add alt text to `logoUrl`

## [1.0.0-alpha.20] - 2025-08-05

### Added

- New optional `passkeyName` property to `PalisadeIdentitySDK` config to allow pre-defining the passkey name

### Updated

- Default environment updated to Sandbox from Development
- Github action now publishes to npm on version tag push

## [1.0.0-alpha.19] - 2025-07-17

### Added

- New `options` object to `PalisadeIdentitySDK` constructor:
  - `isConnectEnabled` (`boolean`, default `true`) — Enables or disables the Connect flow.
  - `isCreateEnabled` (`boolean`, default `true`) — Enables or disables the Create flow.

### Updated

- README now documents the `options` configuration, usage examples, and defaults.
- CHANGELOG is now listed in DESC order
- Bump esbuild from 0.23.0 to 0.25.0

## [1.0.0-alpha.18] - 2024-08-08

### Updated

- Update package lock

## [1.0.0-alpha.17] - 2024-08-08

### Updated

- Fixed pluralisation of endpoint

## [1.0.0-alpha.16] - 2024-08-08

Further updates to enhance authorization

### Added

### Changed

- Move getWallet into #api and update to use the same Auth mechanism as the other api calls

### Fixed

## [1.0.0-alpha.15] - 2024-08-08

Updates to enhance authorization mechanism

### Added

- Always include `X-Cient-ID` and `X-Origin` headers within authorized requests

### Changed

- Consolidate `/transactions` and `/signatures` endpoints into a single `/transactions/raw` endpoint with a `signOnly` flag to align with the core API
- Clean up unnecessary duplicated authToken check

### Fixed

## [1.0.0-alpha.14] - 2024-08-07

Extend the `transaction-approved` event response with `canonicalSignature` and `signedtransaction`.

### Added

- `canonicalSignature` and `signedtransaction` are now available on the `transaction-approved` event data response object

### Changed

### Fixed

## [1.0.0-alpha.1] - 2024-07-18

Alpha version of Palisade Identity SDK 🎉
Implements the full end to end flow where you can create or login with a new secure (MPC) identity account / wallet, approve an application to transact on behalf of your new account and initiate an approval flow for users to sign / submit transactions on the XRP ledger.

### Added

- Alpha version of Identity SDK (#ENG-1527), including the functionality to:
- Create a wallet / Connect a wallet
- Approve a Sign or Transfer transaction
- Handle events based on the above

### Changed

### Fixed
