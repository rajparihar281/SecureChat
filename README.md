# SecureChat

An enterprise-grade, end-to-end encrypted (E2EE) mobile messaging application engineered with Bare React Native, TypeScript strict mode, GraphQL (Apollo Server + Client) with WebSockets over `graphql-ws`, and PostgreSQL.

## Architecture Overview

```mermaid
graph TD
    subgraph Client ["Bare React Native (apps/mobile)"]
        UI[React Navigation & Screens]
        ApolloClient[Apollo Client + Normalized Cache]
        SecureStore[react-native-keychain]
        CryptoLib[packages/crypto: X25519 & XChaCha20-Poly1305]
        WSLink[graphql-ws Subscription Link]
        HTTPLink[Apollo HTTP Link]
    end

    subgraph Backend ["GraphQL Server (apps/api)"]
        ApolloServer[Apollo Server 4 / Express]
        AuthService[Argon2 Hashing + JWT / Refresh]
        WSServer[WebSocket Server (graphql-ws)]
        FCMAdmin[Firebase Admin Push Dispatcher]
        DBPool[PostgreSQL Database Pool]
    end

    subgraph Shared ["Monorepo Packages"]
        SharedPkg[packages/shared: Types, Codegen, Constants]
    end

    UI --> ApolloClient
    ApolloClient --> CryptoLib
    CryptoLib --> SecureStore
    ApolloClient --> WSLink
    ApolloClient --> HTTPLink
    HTTPLink --> ApolloServer
    WSLink --> WSServer
    ApolloServer --> AuthService
    ApolloServer --> DBPool
    WSServer --> DBPool
    ApolloServer --> FCMAdmin
    UI -.-> SharedPkg
    ApolloServer -.-> SharedPkg
```

## Monorepo Layout

- `apps/mobile`: Bare React Native application (TypeScript strict, React Navigation, react-native-keychain, bare Android architecture).
- `apps/api`: Node.js GraphQL API (Apollo Server 4, express, graphql-ws, argon2, PostgreSQL).
- `packages/shared`: Shared types, constants, and generated GraphQL operations.
- `packages/crypto`: Platform-agnostic E2EE cryptographic engine (X25519 ECDH, XChaCha20-Poly1305, fingerprinting).

## Quick Start

### Prerequisites

- Node.js LTS (>= 20)
- npm (>= 9)
- JDK 17 / 21
- Android Studio + Android SDK (API 34)
- Docker Desktop (for PostgreSQL)

### Setup & Run

1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
2. Start PostgreSQL:
   ```bash
   docker-compose up -d
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Build all packages:
   ```bash
   npm run build
   ```
5. Run tests:
   ```bash
   npm run test
   ```

For detailed phase checklists, see [PROGRESS.md](file:///c:/Users/Raj%20Parihar/Desktop/SecureChat/PROGRESS.md). For current blockers and credentials requirements, see [BLOCKERS.md](file:///c:/Users/Raj%20Parihar/Desktop/SecureChat/BLOCKERS.md).
