# TalentXcel Android Proguard Rules

# Supabase Kotlin SDK & kotlinx.serialization
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod
-keepclassmembers class * {
    @kotlinx.serialization.Serializable <fields>;
}
-keep class kotlinx.serialization.** { *; }
-keepclassmembers class *$$serializer { *; }
-dontwarn kotlinx.serialization.**

# Supabase models & DTOs
-keep class com.talentxcel.android.data.** { *; }
-keep class com.talentxcel.android.domain.models.** { *; }

# Ktor HTTP Client
-keep class io.ktor.** { *; }
-dontwarn io.ktor.**

# Coroutines
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory { *; }
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler { *; }
-keepclassmembers class kotlinx.coroutines.** { *; }

# Room
-keep class androidx.room.** { *; }
-dontwarn androidx.room.**

# Firebase
-dontwarn com.google.firebase.**
-keep class com.google.firebase.** { *; }
