package com.talentxcel.android.core.security

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

/**
 * Hardware-backed encrypted key-value storage using Android Keystore (AES-256 GCM).
 * Stores authentication tokens, session tokens, and sensitive client-side preferences.
 */
object SecureStorage {

    private const val PREFS_FILE = "txc_secure_prefs"
    private const val KEY_ACCESS_TOKEN = "access_token"
    private const val KEY_REFRESH_TOKEN = "refresh_token"
    private const val KEY_USER_ID = "user_id"
    private const val KEY_USER_EMAIL = "user_email"
    private const val KEY_FCM_TOKEN = "fcm_token"

    private lateinit var preferences: SharedPreferences

    fun init(context: Context) {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()

        preferences = EncryptedSharedPreferences.create(
            context,
            PREFS_FILE,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    var accessToken: String?
        get() = preferences.getString(KEY_ACCESS_TOKEN, null)
        set(value) = preferences.edit().putString(KEY_ACCESS_TOKEN, value).apply()

    var refreshToken: String?
        get() = preferences.getString(KEY_REFRESH_TOKEN, null)
        set(value) = preferences.edit().putString(KEY_REFRESH_TOKEN, value).apply()

    var userId: String?
        get() = preferences.getString(KEY_USER_ID, null)
        set(value) = preferences.edit().putString(KEY_USER_ID, value).apply()

    var userEmail: String?
        get() = preferences.getString(KEY_USER_EMAIL, null)
        set(value) = preferences.edit().putString(KEY_USER_EMAIL, value).apply()

    var fcmToken: String?
        get() = preferences.getString(KEY_FCM_TOKEN, null)
        set(value) = preferences.edit().putString(KEY_FCM_TOKEN, value).apply()

    fun saveSession(userId: String, email: String, accessToken: String, refreshToken: String) {
        preferences.edit()
            .putString(KEY_USER_ID, userId)
            .putString(KEY_USER_EMAIL, email)
            .putString(KEY_ACCESS_TOKEN, accessToken)
            .putString(KEY_REFRESH_TOKEN, refreshToken)
            .apply()
    }

    fun clearSession() {
        preferences.edit()
            .remove(KEY_USER_ID)
            .remove(KEY_USER_EMAIL)
            .remove(KEY_ACCESS_TOKEN)
            .remove(KEY_REFRESH_TOKEN)
            .apply()
    }

    fun hasValidSession(): Boolean {
        return !accessToken.isNullOrBlank() && !userId.isNullOrBlank()
    }
}
