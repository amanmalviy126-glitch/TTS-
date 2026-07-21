# Proguard rules for Vocalize AI Android App
-keep class com.vocalize.ai.tts.** { *; }
-keepclassmembers class * extends android.webkit.WebViewClient {
    public *;
}
