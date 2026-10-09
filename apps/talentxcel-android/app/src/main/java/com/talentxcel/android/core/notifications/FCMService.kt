package com.talentxcel.android.core.notifications

import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.talentxcel.android.core.network.SupabaseClientProvider
import com.talentxcel.android.core.security.SecureStorage
import io.github.jan.supabase.functions.functions
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

/**
 * Native Firebase Cloud Messaging receiver service.
 * Handles incoming push notifications, resolves deep-links, and registers device tokens.
 */
class FCMService : FirebaseMessagingService() {

    private val serviceScope = CoroutineScope(Dispatchers.IO)

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        SecureStorage.fcmToken = token

        // Dispatch updated token to TalentXcel backend
        serviceScope.launch {
            try {
                val payload = buildJsonObject {
                    put("push_token", token)
                    put("platform", "android")
                    put("app_version", "1.0.0")
                }
                SupabaseClientProvider.client.functions.invoke(
                    function = "register-push-token",
                    body = payload
                )
            } catch (_: Exception) {
                // Non-fatal, retried on next app launch
            }
        }
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        val title = remoteMessage.notification?.title ?: remoteMessage.data["title"] ?: "TalentXcel Update"
        val body = remoteMessage.notification?.body ?: remoteMessage.data["message"] ?: "You have a new update."
        val type = remoteMessage.data["type"]

        val resolved = NotificationRouter.resolveRoute(type, remoteMessage.data)

        val notificationManager = NotificationManager(applicationContext)
        notificationManager.showNotification(
            id = (System.currentTimeMillis() % 100000).toInt(),
            title = title,
            message = body,
            deepLinkUri = resolved.deepLinkUri
        )
    }
}
