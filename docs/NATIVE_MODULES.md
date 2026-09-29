# SecureChat Native Modules Architecture & Specifications

## 1. Overview

SecureChat integrates custom native platform modules for sensitive hardware and operating system capabilities where standard React Native abstractions do not meet strict security, privacy, or performance standards.

The primary custom native module is **`SecureDocumentPicker`**, providing secure, zero-copy document selection via Android's modern Storage Access Framework (SAF).

---

## 2. Android Storage Access Framework (`ACTION_OPEN_DOCUMENT`)

### 2.1 Why SAF instead of Legacy File Permissions?

Prior Android implementations relied on `READ_EXTERNAL_STORAGE`, which granted apps broad, coarse-grained access to all files on the user's external filesystem.

In SecureChat:

- We utilize `Intent.ACTION_OPEN_DOCUMENT` with category `Intent.CATEGORY_OPENABLE`.
- The OS system picker UI is launched out-of-process.
- SecureChat receives **only** a scoped content URI (`content://...`) for the explicitly user-selected file.
- No broad storage permissions (`READ_EXTERNAL_STORAGE` / `MANAGE_EXTERNAL_STORAGE`) are requested in `AndroidManifest.xml`, ensuring maximum Google Play Data Safety compliance.

### 2.2 Native Kotlin Implementation

- **Class:** `com.securechat.app.SecureDocumentPickerModule`
- **Package:** `com.securechat.app.SecureDocumentPickerPackage`
- **Result Code Contract:**
  - `Activity.RESULT_OK`: Resolves metadata map with `uri`, `fileName`, `mimeType`, and `fileSize`.
  - `Activity.RESULT_CANCELED`: Rejects with error code `E_PICKER_CANCELLED`.
  - Metadata queries use `contentResolver.query(uri, null, null, null, null)` inspecting `OpenableColumns.DISPLAY_NAME` and `OpenableColumns.SIZE`.

---

## 3. Client-Side Attachment Encryption Pipeline

Before any document or media file leaves the device:

1. **Selection:** `pickDocument(options)` retrieves document metadata and enforces local maximum file size constraints (default 25MB).
2. **Ephemeral Key Generation:** A fresh 256-bit symmetric key is derived using `nacl.randomBytes(32)`.
3. **Authenticated Encryption:** File binary data is encrypted with XSalsa20-Poly1305 (`nacl.secretbox`) with a random 24-byte nonce.
4. **Key Encapsulation:** The symmetric attachment key is encrypted with the recipient's X25519 public key.
5. **Zero-Knowledge Upload:** The server receives ciphertext bytes only. It cannot preview, inspect, index, or decrypt media attachments.

---

## 4. iOS Bridge Architecture & Platform Capabilities

For iOS compatibility:

- **Component:** `UIDocumentPickerViewController`
- **Modes:** `.open` or `.import`
- **Delegate:** `UIDocumentPickerDelegate`
- **Security Scoping:** Requires `startAccessingSecurityScopedResource()` when reading documents from iCloud Drive or sandboxed container providers.
- **Stub Policy:** When built on non-macOS environments (Windows workstation), the TypeScript layer provides typed fallback stubs ensuring builds and unit tests succeed cross-platform without CocoaPods dependencies.
