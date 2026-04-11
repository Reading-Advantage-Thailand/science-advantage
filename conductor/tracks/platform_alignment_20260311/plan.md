# Implementation Plan

## Phase 1: Authentication Contract

- [x] Task: Define failing tests for the Google OAuth plus dev impersonation contract
  - [x] Write unit/integration tests that codify production-only Google OAuth and local impersonation behavior
  - [x] Confirm the current credential-based flow fails the new contract
- [x] Task: Replace the user-facing credential login flow
  - [x] Implement the declared sign-in experience and session handling
  - [x] Remove or quarantine demo credential UX from production paths
- [ ] Task: Centralize auth and role routing
  - [ ] Consolidate role constants, redirects, and route guards into shared helpers
  - [ ] Refactor protected routes to consume the shared auth layer
- [ ] Task: Conductor - Manual Verification 'Authentication Contract'
  - [ ] Verify Google sign-in, redirect behavior, and dev impersonation locally

## Phase 2: Shared Platform Services

- [ ] Task: Define failing tests for config, cache, and rate-limit adapters
  - [ ] Cover Redis-backed and fallback behavior for shared-state services
  - [ ] Cover stale-session cleanup behavior
- [ ] Task: Implement environment and service adapters
  - [ ] Align env parsing with auth, AI, Redis, and storage requirements
  - [ ] Introduce reusable cache/rate-limit interfaces with safe fallbacks
- [ ] Task: Add browser-level smoke coverage
  - [ ] Replace the placeholder E2E command with a real harness
  - [ ] Cover sign-in, student entry, and teacher entry smoke flows
- [ ] Task: Conductor - Manual Verification 'Shared Platform Services'
  - [ ] Verify auth, cache fallback, and browser smoke setup in a local QA run

## Phase 3: Documentation Alignment

- [ ] Task: Update operator and developer docs
  - [ ] Align README and environment guidance with the implemented platform contract
  - [ ] Record remaining platform debt in `conductor/tech-debt.md`
- [ ] Task: Conductor - Manual Verification 'Platform Documentation'
  - [ ] Verify setup instructions and smoke commands are executable end to end
