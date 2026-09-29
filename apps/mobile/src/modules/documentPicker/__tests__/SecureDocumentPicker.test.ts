import { NativeModules, Platform } from 'react-native';
import { pickDocument, pickAndEncryptDocument } from '../SecureDocumentPicker';

import { decryptSymmetric } from '@securechat/crypto';

describe('SecureDocumentPicker - Native Module & Attachment Encryption', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'android';
    NativeModules.SecureDocumentPicker = {
      pickDocument: jest.fn().mockResolvedValue({
        uri: 'content://com.android.providers.media.documents/document/101',
        fileName: 'confidential_report.pdf',
        mimeType: 'application/pdf',
        fileSize: 1048576, // 1MB
      }),
    };
  });

  describe('pickDocument', () => {
    it('picks document successfully and returns full file metadata', async () => {
      const result = await pickDocument();

      expect(result).toEqual({
        uri: 'content://com.android.providers.media.documents/document/101',
        fileName: 'confidential_report.pdf',
        mimeType: 'application/pdf',
        fileSize: 1048576,
      });
      expect(
        (NativeModules.SecureDocumentPicker as { pickDocument: jest.Mock }).pickDocument,
      ).toHaveBeenCalledWith({});
    });

    it('rejects with E_FILE_TOO_LARGE if file exceeds maxSizeBytes', async () => {
      (
        NativeModules.SecureDocumentPicker as { pickDocument: jest.Mock }
      ).pickDocument.mockResolvedValue({
        uri: 'content://large-file',
        fileName: 'massive_video.mp4',
        mimeType: 'video/mp4',
        fileSize: 50 * 1024 * 1024, // 50MB
      });

      await expect(pickDocument({ maxSizeBytes: 20 * 1024 * 1024 })).rejects.toMatchObject({
        code: 'E_FILE_TOO_LARGE',
      });
    });

    it('handles user cancellation gracefully with E_PICKER_CANCELLED code', async () => {
      (
        NativeModules.SecureDocumentPicker as { pickDocument: jest.Mock }
      ).pickDocument.mockRejectedValueOnce({
        code: 'E_PICKER_CANCELLED',
        message: 'User cancelled document selection',
      });

      await expect(pickDocument()).rejects.toMatchObject({
        code: 'E_PICKER_CANCELLED',
      });
    });

    it('throws error when native module is missing', async () => {
      delete NativeModules.SecureDocumentPicker;

      await expect(pickDocument()).rejects.toMatchObject({
        code: 'E_MODULE_NOT_FOUND',
      });
    });
  });

  describe('pickAndEncryptDocument', () => {
    it('picks, derives symmetric key, and encrypts file bytes with XSalsa20-Poly1305', async () => {
      const originalFileBytes = new Uint8Array([10, 20, 30, 40, 50, 99, 128, 255]);
      const mockFileReader = jest.fn().mockResolvedValue(originalFileBytes);

      const result = await pickAndEncryptDocument({}, undefined, mockFileReader);

      expect(result.document.fileName).toBe('confidential_report.pdf');
      expect(result.encryptedPayload.ciphertextBytes).toBeDefined();
      expect(result.encryptedPayload.nonceBase64).toBeDefined();
      expect(result.symmetricKey).toHaveLength(32);

      // Verify decryptSymmetric successfully recovers exact original bytes
      const decrypted = decryptSymmetric(
        result.encryptedPayload.ciphertextBytes,
        result.encryptedPayload.nonceBase64,
        result.symmetricKey,
      );

      expect(decrypted).toEqual(originalFileBytes);
    });
  });
});
