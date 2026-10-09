package com.talentxcel.android

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import com.talentxcel.android.core.network.SupabaseClientProvider
import com.talentxcel.android.core.security.SecureStorage

/**
 * TalentXcel Application entry point.
 * Initializes core services, notification channels, and secure storage on startup.
 */
class TalentXcelApplication : Application() {

    companion object {
        lateinit var instance: TalentXcelApplication
            private set
        
        const val NOTIFICATION_CHANNEL_ID = "talentxcel_primary_channel"
        const val NOTIFICATION_CHANNEL_NAME = "TalentXcel Notifications"
    }

    override fun onCreate() {
        super.onCreate()
        instance = this

        // 1. Initialize encrypted preferences storage
        SecureStorage.init(this)

        // 2. Initialize Supabase client singleton
        SupabaseClientProvider.init(this)

        // 3. Register notification channels for Android 8.0+
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        com.talentxcel.android.core.notifications.NotificationManager.createAllNotificationChannels(this)
    }
}
