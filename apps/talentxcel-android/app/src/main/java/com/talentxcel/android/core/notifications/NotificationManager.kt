package com.talentxcel.android.core.notifications

import android.app.NotificationChannel
import android.app.NotificationManager as AndroidNotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.talentxcel.android.MainActivity
import com.talentxcel.android.R

/**
 * Enterprise Native Push Notification Manager.
 * Handles multi-channel segmentation, rich styles, deep link routing, and actionable notifications.
 */
class NotificationManager(private val context: Context) {

    companion object {
        const val CHANNEL_PRIMARY = "talentxcel_primary_channel"
        const val CHANNEL_JOBS = "talentxcel_jobs_channel"
        const val CHANNEL_MESSAGES = "talentxcel_messages_channel"
        const val CHANNEL_NETWORK = "talentxcel_network_channel"
        const val CHANNEL_GEMINI = "talentxcel_gemini_channel"
        const val CHANNEL_REWARDS = "talentxcel_rewards_channel"

        fun createAllNotificationChannels(context: Context) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val systemManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as AndroidNotificationManager

                val channels = listOf(
                    NotificationChannel(
                        CHANNEL_PRIMARY,
                        "TalentXcel General Updates",
                        AndroidNotificationManager.IMPORTANCE_DEFAULT
                    ).apply {
                        description = "System notifications, account updates, and announcements."
                        setShowBadge(true)
                    },
                    NotificationChannel(
                        CHANNEL_JOBS,
                        "Job Alerts & High-Match Opportunities",
                        AndroidNotificationManager.IMPORTANCE_HIGH
                    ).apply {
                        description = "Instant notifications when high ATS-match jobs are posted."
                        enableLights(true)
                        enableVibration(true)
                        setShowBadge(true)
                    },
                    NotificationChannel(
                        CHANNEL_MESSAGES,
                        "1:1 Direct Messages & Recruiter Chat",
                        AndroidNotificationManager.IMPORTANCE_HIGH
                    ).apply {
                        description = "Real-time messages from network connections and hiring managers."
                        enableLights(true)
                        enableVibration(true)
                        setShowBadge(true)
                    },
                    NotificationChannel(
                        CHANNEL_GEMINI,
                        "Gemini AI Career Co-Pilot & Insights",
                        AndroidNotificationManager.IMPORTANCE_HIGH
                    ).apply {
                        description = "On-Device Gemini Nano career roadmaps, interview prep reminders, and ATS optimization."
                        enableLights(true)
                        setShowBadge(true)
                    },
                    NotificationChannel(
                        CHANNEL_NETWORK,
                        "Network Activity & Professional Feed",
                        AndroidNotificationManager.IMPORTANCE_DEFAULT
                    ).apply {
                        description = "Likes, comments, shares, and connection requests from peers."
                        setShowBadge(true)
                    },
                    NotificationChannel(
                        CHANNEL_REWARDS,
                        "Rewards, Streaks & Referral Coins",
                        AndroidNotificationManager.IMPORTANCE_DEFAULT
                    ).apply {
                        description = "Daily learning streak alerts, claimed XP, and referral milestone rewards."
                        setShowBadge(true)
                    }
                )

                channels.forEach { systemManager.createNotificationChannel(it) }
            }
        }
    }

    private val systemManager =
        context.getSystemService(Context.NOTIFICATION_SERVICE) as AndroidNotificationManager

    fun showNotification(
        id: Int,
        title: String,
        message: String,
        deepLinkUri: String? = null,
        channelId: String = CHANNEL_PRIMARY
    ) {
        val intent = Intent(context, MainActivity::class.java).apply {
            setPackage(context.packageName)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            deepLinkUri?.let { action = Intent.ACTION_VIEW; data = android.net.Uri.parse(it) }
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            id,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val safeId = kotlin.math.abs(id) % 100000 + 1

        val notification = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(R.drawable.ic_stat_notification)
            .setColor(0xFF2563EB.toInt())
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(NotificationCompat.BigTextStyle().bigText(message))
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setDefaults(NotificationCompat.DEFAULT_ALL)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()

        systemManager.notify(safeId, notification)
    }

    fun showJobMatchNotification(
        jobId: String,
        jobTitle: String,
        company: String,
        matchScore: Int
    ) {
        val id = 1000 + (System.currentTimeMillis() % 1000).toInt()
        val title = "🎯 $matchScore% Match: $jobTitle"
        val message = "$company has a new opening matching your Career Passport profile. Tap to review & apply."
        showNotification(
            id = id,
            title = title,
            message = message,
            deepLinkUri = "https://talentxcel.in/jobs/$jobId",
            channelId = CHANNEL_JOBS
        )
    }

    fun showDirectMessageNotification(
        senderName: String,
        messageText: String,
        conversationId: String,
        senderId: String
    ) {
        val id = 2000 + (System.currentTimeMillis() % 1000).toInt()
        val title = "💬 $senderName"
        showNotification(
            id = id,
            title = title,
            message = messageText,
            deepLinkUri = "https://talentxcel.in/conversations/$conversationId?recipientName=$senderName&recipientId=$senderId",
            channelId = CHANNEL_MESSAGES
        )
    }

    fun showGeminiDigestNotification(
        headline: String,
        advice: String
    ) {
        val id = 3000 + (System.currentTimeMillis() % 1000).toInt()
        val title = "✨ Gemini Nano: $headline"
        showNotification(
            id = id,
            title = title,
            message = advice,
            deepLinkUri = "talentxcel://career",
            channelId = CHANNEL_GEMINI
        )
    }

    fun showStreakReminderNotification(
        daysStreak: Int,
        xpBonus: Int
    ) {
        val id = 4000 + (System.currentTimeMillis() % 1000).toInt()
        val title = "🔥 $daysStreak-Day Career Streak at Risk!"
        val message = "Check in today to claim +$xpBonus XP and keep your streak multiplier active."
        showNotification(
            id = id,
            title = title,
            message = message,
            deepLinkUri = "talentxcel://rewards",
            channelId = CHANNEL_REWARDS
        )
    }

    fun showReferralRewardNotification(
        peerName: String,
        coinsEarned: Int
    ) {
        val id = 5000 + (System.currentTimeMillis() % 1000).toInt()
        val title = "🎉 Referral Bonus Unlocked!"
        val message = "$peerName just joined via your link! You've been rewarded +$coinsEarned TalentXcel Coins."
        showNotification(
            id = id,
            title = title,
            message = message,
            deepLinkUri = "talentxcel://refer",
            channelId = CHANNEL_REWARDS
        )
    }
}
