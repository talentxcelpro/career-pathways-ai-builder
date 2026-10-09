package com.talentxcel.android.core.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

/**
 * Native Broadcast Receiver that triggers Android system notifications
 * whether the TalentXcel application is currently open or completely closed.
 */
class TalentXcelNotificationReceiver : BroadcastReceiver() {

    companion object {
        const val ACTION_TRIGGER_NOTIFICATION = "com.talentxcel.android.ACTION_TRIGGER_NOTIFICATION"
        const val ACTION_POLL_NOTIFICATIONS = "com.talentxcel.android.ACTION_POLL_NOTIFICATIONS"

        const val EXTRA_TITLE = "title"
        const val EXTRA_MESSAGE = "message"
        const val EXTRA_DEEP_LINK = "deep_link"
        const val EXTRA_CHANNEL = "channel"
        const val EXTRA_NOTIFICATION_ID = "notification_id"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return
        Log.d("TalentXcelReceiver", "Received broadcast action: $action")

        val notificationManager = NotificationManager(context)

        when (action) {
            Intent.ACTION_BOOT_COMPLETED -> {
                Log.d("TalentXcelReceiver", "Device reboot completed, background channels initialized.")
                NotificationManager.createAllNotificationChannels(context)
            }

            ACTION_TRIGGER_NOTIFICATION -> {
                val title = intent.getStringExtra(EXTRA_TITLE) ?: "TalentXcel Career Alert"
                val message = intent.getStringExtra(EXTRA_MESSAGE) ?: "You have a new career update waiting."
                val deepLink = intent.getStringExtra(EXTRA_DEEP_LINK) ?: "https://talentxcel.in/network"
                val channel = intent.getStringExtra(EXTRA_CHANNEL) ?: NotificationManager.CHANNEL_JOBS
                val id = intent.getIntExtra(EXTRA_NOTIFICATION_ID, (System.currentTimeMillis() % 100000).toInt())

                notificationManager.showNotification(
                    id = id,
                    title = title,
                    message = message,
                    deepLinkUri = deepLink,
                    channelId = channel
                )
            }

            ACTION_POLL_NOTIFICATIONS -> {
                // Background simulated periodic career alert
                notificationManager.showJobMatchNotification(
                    jobId = "ajo-architect-1",
                    jobTitle = "AJO Architect (₹45L - ₹48L)",
                    company = "Savantis Solutions",
                    matchScore = 94
                )
            }
        }
    }
}
