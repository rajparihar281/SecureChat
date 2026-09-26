# SecureChat Security Architecture & Cryptographic Threat Model

## 1. Executive Summary

SecureChat delivers robust, zero-knowledge end-to-end encrypted (E2EE) messaging engineered to protect user privacy against sophisticated adversaries, compromised cloud backends, and hostile network infrastructure.

All communications are encrypted on the client device prior to network transmission. The backend server acts strictly as an untrusted blind message broker and key distribution service, with zero visibility into plaintext content or user private keys.

---

## 2. Threat Model

SecureChat is designed against the following adversary models:

### 2.1 Adversaries In Scope

- **Compromised Backend / Rogue Operators:** An attacker with complete administrative root access to the Node.js API, PostgreSQL database, and cache cannot read conversation content or forge messages.
- **Active Network Adversary (MitM):** Attackers intercepting, modifying, replaying, or dropping network packets on Wi-Fi, cellular, or upstream internet routers cannot decrypt or tamper with message contents.
- **Stolen Device Backups:** Private keys are hardware-backed and excluded from cloud or adb backups, preventing extraction from device images.

### 2.2 Out of Scope

- Compromised device operating system (rootkit, OS-level malware with kernel memory inspection).
- Physical coercion forcing the user to unlock their biometric authentication.

---

## 3. Cryptographic Primitives & Specifications

SecureChat builds upon industry-standard, auditable primitives provided by `tweetnacl` (TweetNaCl implementation of NaCl):

| Layer                      | Primitive                       | Parameter / Standard                       |
| :------------------------- | :------------------------------ | :----------------------------------------- |
| **Key Agreement (ECDH)**   | Curve25519 (X25519)             | 32-byte public and private keys            |
| **Symmetric Encryption**   | XSalsa20 stream cipher          | 256-bit key derived via ECDH               |
| **Message Authentication** | Poly1305 MAC                    | 128-bit one-time authenticator             |
| **Nonce Generation**       | Cryptographically Secure PRNG   | 24-byte (192-bit) unique nonce per message |
| **Safety Numbers**         | SHA-512 Hash Iteration          | 1,000 iterations over sorted public keys   |
| **Password Hashing**       | Argon2id                        | Memory-hard password verification on API   |
| **Hardware Storage**       | Android Keystore / iOS Keychain | Biometric/Hardware-backed secure enclave   |

---

## 4. Key Management & Lifecycle

### 4.1 Identity Keys

Upon user registration or device enrollment:

1. The mobile client generates a Curve25519 identity keypair (`{ publicKey, secretKey }`) locally on the device.
2. The `secretKey` is immediately written to the hardware Keystore/Keychain using `react-native-keychain`. It never leaves the device.
3. The `publicKey` is transmitted over TLS to the API server and recorded in the `devices` table.

### 4.2 Pre-Keys for Asynchronous Messaging

To allow offline message dispatch without real-time interaction:

- Clients generate a batch of ephemeral pre-key pairs.
- Public pre-keys are uploaded to the server (`uploadDeviceKeys`).
- Senders retrieve recipient pre-key bundles from the API (`deviceKeys`) to establish forward-secret sessions before sending messages.

### 4.3 Replay Protection & Nonce Uniqueness

- Each message generates a fresh 24-byte cryptographically secure random nonce (`nacl.randomBytes(24)`).
- With a 192-bit nonce space, the probability of collision is negligible ($2^{-96}$ under the birthday paradox), eliminating nonce reuse vulnerabilities.
- Combined with client-generated mutation IDs and database sequence tracking, replays are detected and rejected.

---

## 5. Out-of-Band Safety Number Verification

To defend against malicious public key substitution by a compromised server, users can verify identity out-of-band:

1. **Deterministic Fingerprint Derivation:**
   - Client sorts both public keys lexicographically (`[pkA, pkB].sort()`).
   - Computes 1,000 rounds of SHA-512 over the concatenated 64-byte key material.
   - Extracts 12 blocks of 5 decimal digits (60 numeric digits in total).
2. **Visual & QR Comparison:**
   - Both users inspect the safety number on `SecurityVerificationScreen.tsx`.
   - Matching safety numbers prove no third party is intercepting or altering the keys.

---

## 6. Zero-Knowledge Backend Policy

The SecureChat server enforces the following strict zero-knowledge invariants:

- **No Private Keys:** The API schema and database contain no fields capable of storing private keys.
- **Opaque Ciphertext Only:** The `sendMessage` mutation only accepts and stores `{ ciphertext, nonce, senderPublicKey, recipientPublicKey, version }`.
- **Zero Decryption Capability:** Server logs, metrics, and error traces never log decrypted message bodies.
- **Ephemeral Session Tokens:** Access tokens are short-lived (15 minutes); refresh tokens rotate on every exchange and are stored as SHA-256 hashes in PostgreSQL.
