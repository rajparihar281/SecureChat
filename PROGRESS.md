# SecureChat Project Progress Checklist

This document tracks autonomous progress across all 14 project phases.

- [x] **Phase 1: Monorepo Scaffold**
  - [x] Turborepo + npm workspaces configuration (`apps/*`, `packages/*`)
  - [x] TypeScript strict configuration (`tsconfig.base.json`, root `tsconfig.json`)
  - [x] Code quality tools (ESLint, Prettier, Husky, lint-staged, commitlint)
  - [x] Containerized PostgreSQL configuration (`docker-compose.yml`)
  - [x] Environment variable templates (`.env.example`)
  - [x] GitHub Actions CI workflow (`.github/workflows/ci.yml`)
  - [x] Initial documentation skeletons (`README.md`, `PROGRESS.md`, `BLOCKERS.md`)

- [x] **Phase 2: API Foundation**
  - [x] Node.js + TypeScript GraphQL API server (Apollo Server 4 + Express + graphql-ws)
  - [x] PostgreSQL database schema and migrations (Users, Devices, Conversations, Participants, Messages, PreKeys)
  - [x] Argon2 password hashing + short-lived JWT + rotating refresh tokens
  - [x] Device tracking & session invalidation
  - [x] Typed GraphQL resolvers & custom Apollo error formatting
  - [x] Comprehensive Jest resolver unit tests

- [x] **Phase 3: RN App Foundation**
  - [x] Bare React Native mobile application structure (`apps/mobile`)
  - [x] Android native setup (`android/` project, manifest, gradle configs)
  - [x] React Navigation (Auth stack, Main tabs, Chat stack) with type-safe params
  - [x] Dark-mode-first design tokens, theme system, and base atomic components

- [x] **Phase 4: Apollo Client & Codegen**
  - [x] GraphQL Code Generator setup in `packages/shared`
  - [x] Apollo Client with typed InMemoryCache and pagination typePolicies
  - [x] Auth link injecting bearer tokens from secure storage
  - [x] Error link with silent token refresh on 401 and exponential backoff retry

- [ ] **Phase 5: Secure Session**
  - [ ] Hardware-backed secure storage integration (`react-native-keychain`)
  - [ ] Silent refresh flow with mutex queue
  - [ ] Logout purge & session expiry handler
  - [ ] Auth context & custom hooks (`useAuth`, `useSession`)

- [ ] **Phase 6: Conversations & Messages UI**
  - [ ] FlatList virtualization tuning (`windowSize`, `maxToRenderPerBatch`, `removeClippedSubviews`)
  - [ ] Cursor-based pagination (`fetchMore`)
  - [ ] Memoized conversation list and message bubbles (`React.memo`, `useCallback`, `useMemo`)
  - [ ] Inverted message list with status receipts (pending, sent, delivered, read, failed)

- [ ] **Phase 7: Optimistic Send & Offline Queue**
  - [ ] Optimistic response and instant cache update
  - [ ] Cache rollback on mutation error with "Failed, tap to retry" state
  - [ ] Offline queue manager with NetInfo auto-retry on reconnect

- [ ] **Phase 8: Real-Time Subscriptions**
  - [ ] GraphQL subscriptions over `graphql-ws` WebSocket transport
  - [ ] Real-time message reception, delivery, and read receipts
  - [ ] Live typing indicators with debounced publishing
  - [ ] AppState-aware connection lifecycle (pause in background, resume in foreground)

- [ ] **Phase 9: End-to-End Encryption (`packages/crypto`)**
  - [ ] Platform-agnostic crypto library (X25519 key derivation, XChaCha20-Poly1305 encryption)
  - [ ] Per-device identity keys and public key bundle exchange
  - [ ] Safety number / fingerprint verification screen
  - [ ] Private key isolation in Keystore/Keychain (zero ciphertext or keys in Apollo cache/AsyncStorage)
  - [ ] Comprehensive security documentation (`docs/SECURITY.md`)

- [ ] **Phase 10: Push Notifications**
  - [ ] `@react-native-firebase/messaging` integration with Android 13 POST_NOTIFICATIONS permission
  - [ ] Foreground, background, and terminated push handlers
  - [ ] Zero-plaintext payload policy (ciphertext/metadata alert only)
  - [ ] Deep linking to target conversation screen
  - [ ] Backend `firebase-admin` notification dispatcher

- [ ] **Phase 11: Kotlin Native Module**
  - [ ] Custom Android native module wrapping `ACTION_OPEN_DOCUMENT`
  - [ ] Promise-based interface returning URI, name, MIME type, size
  - [ ] Typed TypeScript wrapper with client-side file encryption before upload
  - [ ] iOS stub & platform capability documentation

- [ ] **Phase 12: Performance & Quality**
  - [ ] Re-render elimination audit with before/after documentation (`docs/PERFORMANCE.md`)
  - [ ] Global ErrorBoundary component with crash recovery UI
  - [ ] Complete accessibility tags (`accessibilityLabel`, `accessibilityRole`, `accessibilityHint`)

- [ ] **Phase 13: Release Readiness**
  - [ ] Android production release configuration (signing template, R8/ProGuard rules, versioning)
  - [ ] App store checklist (`docs/STORE_CHECKLIST.md`) covering Play Store Data Safety & Apple Privacy

- [ ] **Phase 14: Final Documentation & Polish**
  - [ ] Architecture diagrams (Mermaid), setup guide, API reference, scripts
  - [ ] Final quality gate verification (lint, typecheck, tests, turbo build)
  - [ ] Remote repository sync and branch merges
