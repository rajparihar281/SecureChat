package com.securechat.app

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.provider.OpenableColumns
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

class SecureDocumentPickerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var pickerPromise: Promise? = null

    companion object {
        const val MODULE_NAME = "SecureDocumentPicker"
        private const val REQUEST_CODE_PICK_DOCUMENT = 42001
        private const val ERROR_PICKER_CANCELLED = "E_PICKER_CANCELLED"
        private const val ERROR_FAILED_TO_PICK = "E_FAILED_TO_PICK_DOCUMENT"
        private const val ERROR_ACTIVITY_NOT_FOUND = "E_ACTIVITY_NOT_FOUND"
    }

    private val activityEventListener: ActivityEventListener = object : BaseActivityEventListener() {
        override fun onActivityResult(
            activity: Activity?,
            requestCode: Int,
            resultCode: Int,
            data: Intent?
        ) {
            if (requestCode != REQUEST_CODE_PICK_DOCUMENT) return

            val promise = pickerPromise ?: return
            pickerPromise = null

            if (resultCode == Activity.RESULT_CANCELED) {
                promise.reject(ERROR_PICKER_CANCELLED, "User cancelled document selection")
                return
            }

            if (resultCode == Activity.RESULT_OK && data != null) {
                val uri: Uri? = data.data
                if (uri == null) {
                    promise.reject(ERROR_FAILED_TO_PICK, "No document URI returned from picker")
                    return
                }

                try {
                    val context = reactApplicationContext
                    val contentResolver = context.contentResolver

                    var displayName = "unknown_document"
                    var fileSize = 0L

                    contentResolver.query(uri, null, null, null, null)?.use { cursor ->
                        val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                        val sizeIndex = cursor.getColumnIndex(OpenableColumns.SIZE)

                        if (cursor.moveToFirst()) {
                            if (nameIndex != -1 && !cursor.isNull(nameIndex)) {
                                displayName = cursor.getString(nameIndex)
                            }
                            if (sizeIndex != -1 && !cursor.isNull(sizeIndex)) {
                                fileSize = cursor.getLong(sizeIndex)
                            }
                        }
                    }

                    val mimeType = contentResolver.getType(uri) ?: "application/octet-stream"

                    val map = Arguments.createMap().apply {
                        putString("uri", uri.toString())
                        putString("fileName", displayName)
                        putString("mimeType", mimeType)
                        putDouble("fileSize", fileSize.toDouble())
                    }

                    promise.resolve(map)
                } catch (e: Exception) {
                    promise.reject(ERROR_FAILED_TO_PICK, "Error reading document metadata: ${e.message}", e)
                }
            } else {
                promise.reject(ERROR_FAILED_TO_PICK, "Document picker failed with result code $resultCode")
            }
        }
    }

    init {
        reactContext.addActivityEventListener(activityEventListener)
    }

    override fun getName(): String = MODULE_NAME

    @ReactMethod
    fun pickDocument(options: ReadableMap?, promise: Promise) {
        val currentActivity = currentActivity
        if (currentActivity == null) {
            promise.reject(ERROR_ACTIVITY_NOT_FOUND, "Current activity is null or unavailable")
            return
        }

        if (pickerPromise != null) {
            promise.reject("E_CONCURRENT_PICKER", "A document picker session is already in progress")
            return
        }

        pickerPromise = promise

        try {
            val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
                addCategory(Intent.CATEGORY_OPENABLE)
                type = "*/*"

                if (options != null && options.hasKey("mimeTypes")) {
                    val mimeTypesArray = options.getArray("mimeTypes")
                    if (mimeTypesArray != null && mimeTypesArray.size() > 0) {
                        val types = Array(mimeTypesArray.size()) { i -> mimeTypesArray.getString(i) }
                        putExtra(Intent.EXTRA_MIME_TYPES, types)
                    }
                }
            }

            currentActivity.startActivityForResult(intent, REQUEST_CODE_PICK_DOCUMENT)
        } catch (e: Exception) {
            pickerPromise = null
            promise.reject(ERROR_FAILED_TO_PICK, "Failed to launch ACTION_OPEN_DOCUMENT intent: ${e.message}", e)
        }
    }
}
