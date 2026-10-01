# ProGuard & R8 Optimization and Obfuscation Rules for SecureChat Android

# -----------------------------------------------------------------------------
# React Native Core & Engine
# -----------------------------------------------------------------------------
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

-keepattributes *Annotation*
-keepattributes Signature
-keepattributes InnerClasses
-keepattributes EnclosingMethod
-keepattributes JavascriptInterface

# React Native Native Modules reflection
-keepclassmembers class * extends com.facebook.react.bridge.ReactContextBaseJavaModule {
    @com.facebook.react.bridge.ReactMethod *;
    @com.facebook.react.bridge.ReactMethod(isBlockingSynchronousMethod = true) *;
}

-keepclassmembers class * extends com.facebook.react.bridge.JavaScriptModule {
    public <methods>;
}

# -----------------------------------------------------------------------------
# SecureChat Custom Kotlin Native Modules
# -----------------------------------------------------------------------------
-keep class com.securechat.app.modules.** { *; }
-keepclassmembers class com.securechat.app.modules.** {
    @com.facebook.react.bridge.ReactMethod *;
}

# -----------------------------------------------------------------------------
# Firebase Cloud Messaging & Google Play Services
# -----------------------------------------------------------------------------
-dontwarn com.google.firebase.**
-keep class com.google.firebase.** { *; }
-keep class io.invertase.firebase.** { *; }

# -----------------------------------------------------------------------------
# Hardware Keystore & Secure Storage (react-native-keychain)
# -----------------------------------------------------------------------------
-keep class com.oblador.keychain.** { *; }
-dontwarn com.oblador.keychain.**

# -----------------------------------------------------------------------------
# OkHttp, WebSockets & Network Serialization
# -----------------------------------------------------------------------------
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-keepnames class okhttp3.internal.publicsuffix.PublicSuffixDatabase

# Keep all native JNI method bindings
-keepclasseswithmembernames class * {
    native <methods>;
}
