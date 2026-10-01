# App Store & Play Store Release Readiness Checklist

This document details the compliance, permissions justification, Data Safety declarations, and cryptographic export requirements for publishing SecureChat on the Google Play Store and Apple App Store.

---

## 1. Google Play Store Data Safety Declaration

SecureChat adheres to a strict zero-knowledge, privacy-first data handling architecture:

| Category          | Data Field              | Collected? | Shared? | Handled Purpose                          | Security Controls                                     |
| :---------------- | :---------------------- | :--------- | :------ | :--------------------------------------- | :---------------------------------------------------- |
| **Personal Info** | Email Address           | Yes        | No      | Account authentication & recovery        | Argon2id hashed passwords, unique database constraint |
| **Personal Info** | Display Name & Username | Yes        | No      | App functionality (user discovery)       | TLS 1.3 in transit, encrypted at rest                 |
| **Messages**      | Message Body            | Encrypted  | No      | End-to-End Encrypted Delivery            | XSalsa20-Poly1305 with Curve25519; server cannot read |
| **Files & Docs**  | Document Attachments    | Encrypted  | No      | Encrypted attachment transfer            | Client-side symmetric encryption prior to transit     |
| **Identifiers**   | FCM Push Token          | Yes        | No      | Push notifications delivery              | Device token rotated upon session logout              |
| **Analytics/Ads** | Any Tracking Data       | **No**     | **No**  | None (Zero ads, zero 3rd-party trackers) | No tracking SDKs linked in binary                     |

### Account & Data Deletion

- **In-App Account Deletion**: Users can permanently delete their account under `Settings > Account > Delete Account`.
- **Server Erasure**: Purges user row, pre-key bundles, device registrations, and cascades deletion of participant records.
- **Client Erasure**: Purges Android Keystore / iOS Keychain private keys, Apollo cache, and local SQLite offline queues.

---

## 2. Android Runtime Permissions & Justifications

Every permission declared in `AndroidManifest.xml` serves a vital core communication function:

| Permission                                | Protection Level        | Purpose & Justification                                                                                          |
| :---------------------------------------- | :---------------------- | :--------------------------------------------------------------------------------------------------------------- |
| `android.permission.INTERNET`             | Normal                  | Mandatory for WebSocket real-time subscriptions and HTTPS GraphQL endpoints.                                     |
| `android.permission.ACCESS_NETWORK_STATE` | Normal                  | Allows NetInfo to monitor connectivity changes to trigger automatic offline message queue flushing.              |
| `android.permission.POST_NOTIFICATIONS`   | Dangerous (Android 13+) | Required to alert the user of incoming encrypted messages and calls when the app is in background or terminated. |
| `android.permission.READ_MEDIA_IMAGES`    | Dangerous (Android 13+) | Required when the user chooses to attach an image or update their profile avatar.                                |

---

## 3. Apple App Store Privacy & Export Compliance (iOS)

### App Privacy Nutrition Labels

- **Data Used to Track You**: None.
- **Data Linked to You**: User ID, Email, Device ID (for account routing only).
- **Data Not Linked to You**: Crash diagnostics (anonymous, non-identifying).

### Encryption Export Compliance (EAR Category 5, Part 2)

- SecureChat utilizes standard, non-proprietary cryptographic algorithms (`TweetNaCl`: X25519 ECDH, XSalsa20-Poly1305, Ed25519).
- Meets the requirements of **Section 740.13(e)** of the U.S. Export Administration Regulations (EAR) for publicly available open-source encryption software.
- The `ITSAppUsesNonExemptEncryption` flag in `Info.plist` is set to `<false/>` under standard mass-market communication exemptions.

---

## 4. Production Release Build & Signing Pipeline

### AAB (Android App Bundle) Generation

```bash
# Navigate to Android directory
cd apps/mobile/android

# Ensure release credentials are in key.properties
cp key.properties.example key.properties
# (Populate key.properties with release keystore passwords)

# Assemble optimized production release bundle
./gradlew bundleRelease
```

### Build Artifact Validation

1. **Bundle Location**: `apps/mobile/android/app/build/outputs/bundle/release/app-release.aab`
2. **ProGuard Mapping**: `apps/mobile/android/app/build/outputs/mapping/release/mapping.txt` (must be uploaded to Play Console for de-obfuscating native stack traces).
3. **APK Signature Verification**:
   ```bash
   apksigner verify --verbose --print-certs app-release.aab
   ```
