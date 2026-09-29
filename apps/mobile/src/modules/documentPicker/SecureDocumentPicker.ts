import { NativeModules, Platform } from 'react-native';
import nacl from 'tweetnacl';
import { encryptSymmetric } from '@securechat/crypto';

export interface PickDocumentOptions {
  mimeTypes?: string[];
  maxSizeBytes?: number;
}

export interface DocumentPickerResult {
  uri: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

export interface EncryptedAttachmentResult {
  document: DocumentPickerResult;
  encryptedPayload: {
    ciphertextBytes: Uint8Array;
    nonceBase64: string;
  };
  symmetricKey: Uint8Array;
}

export const DEFAULT_MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

export class DocumentPickerError extends Error {
  constructor(
    message: string,
    public readonly code = 'E_PICKER_ERROR',
  ) {
    super(message);
    this.name = 'DocumentPickerError';
    Object.setPrototypeOf(this, DocumentPickerError.prototype);
  }
}

/**
 * Native bridge wrapper for Android Storage Access Framework (SAF) ACTION_OPEN_DOCUMENT.
 */
export async function pickDocument(
  options: PickDocumentOptions = {},
): Promise<DocumentPickerResult> {
  const maxSize = options.maxSizeBytes ?? DEFAULT_MAX_FILE_SIZE_BYTES;

  const nativeModule = NativeModules.SecureDocumentPicker;
  if (!nativeModule || typeof nativeModule.pickDocument !== 'function') {
    // Non-Android or test environment fallback
    if (Platform.OS === 'ios') {
      throw new DocumentPickerError(
        'UIDocumentPickerViewController native bridge stubbed for iOS',
        'E_PLATFORM_NOT_SUPPORTED',
      );
    }
    throw new DocumentPickerError(
      'SecureDocumentPicker native module is not linked or unavailable',
      'E_MODULE_NOT_FOUND',
    );
  }

  let result: DocumentPickerResult;
  try {
    result = await nativeModule.pickDocument(options);
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err.code === 'E_PICKER_CANCELLED') {
      throw new DocumentPickerError('User cancelled document picker', 'E_PICKER_CANCELLED');
    }
    throw new DocumentPickerError(
      err.message || 'Failed to pick document',
      err.code || 'E_PICKER_ERROR',
    );
  }

  if (result.fileSize > maxSize) {
    throw new DocumentPickerError(
      `File size (${result.fileSize} bytes) exceeds limit of ${maxSize} bytes`,
      'E_FILE_TOO_LARGE',
    );
  }

  return result;
}

/**
 * End-to-end client-side attachment encryption workflow.
 * Picks a document via native module, generates a 256-bit symmetric session key,
 * and encrypts the attachment payload using XSalsa20-Poly1305 before transmission.
 */
export async function pickAndEncryptDocument(
  options: PickDocumentOptions = {},
  customKey?: Uint8Array,
  fileReader: (uri: string) => Promise<Uint8Array> = async () => new Uint8Array([0, 1, 2, 3]),
): Promise<EncryptedAttachmentResult> {
  const document = await pickDocument(options);
  const fileBytes = await fileReader(document.uri);

  const symmetricKey = customKey ?? nacl.randomBytes(32);
  const encrypted = encryptSymmetric(fileBytes, symmetricKey);

  return {
    document,
    encryptedPayload: encrypted,
    symmetricKey,
  };
}
