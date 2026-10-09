package com.talentxcel.android.data.notifications

import com.talentxcel.android.core.network.SupabaseClientProvider
import com.talentxcel.android.domain.models.Notification
import com.talentxcel.android.domain.repositories.NotificationRepository
import io.github.jan.supabase.functions.functions
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.query.Order
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

@Serializable
data class NotificationRowDto(
    val id: String,
    val user_id: String,
    val module: String,
    val type: String,
    val title: String,
    val message: String,
    val link: String,
    val is_read: Boolean,
    val priority: String = "medium",
    val created_at: String
)

class NotificationRepositoryImpl : NotificationRepository {

    private val postgrest: Postgrest?
        get() = try {
            SupabaseClientProvider.postgrest
        } catch (e: Throwable) {
            null
        }
    private val _notifications = MutableStateFlow<List<Notification>>(getInitialNotifications())

    override suspend fun getNotifications(userId: String): Result<List<Notification>> = withContext(Dispatchers.IO) {
        try {
            val client = postgrest ?: throw IllegalStateException("Supabase uninitialized")
            val list = client.from("notifications")
                .select {
                    filter { eq("user_id", userId) }
                    order(column = "created_at", order = Order.DESCENDING)
                    limit(50)
                }
                .decodeList<NotificationRowDto>()
                .map { dto ->
                    Notification(
                        id = dto.id,
                        userId = dto.user_id,
                        module = dto.module,
                        type = dto.type,
                        title = dto.title,
                        message = dto.message,
                        link = dto.link,
                        isRead = dto.is_read,
                        priority = dto.priority,
                        createdAt = dto.created_at
                    )
                }

            _notifications.value = list
            Result.success(list)
        } catch (e: Exception) {
            Result.success(_notifications.value)
        }
    }

    override fun observeNotifications(userId: String): Flow<List<Notification>> {
        return _notifications.asStateFlow()
    }

    override suspend fun markAsRead(notificationId: String): Result<Unit> = withContext(Dispatchers.IO) {
        _notifications.value = _notifications.value.map {
            if (it.id == notificationId) it.copy(isRead = true) else it
        }
        Result.success(Unit)
    }

    override suspend fun markAllAsRead(userId: String): Result<Unit> = withContext(Dispatchers.IO) {
        _notifications.value = _notifications.value.map { it.copy(isRead = true) }
        Result.success(Unit)
    }

    override suspend fun registerDevicePushToken(token: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val payload = buildJsonObject {
                put("push_token", token)
                put("platform", "android")
            }
            SupabaseClientProvider.client.functions.invoke(
                function = "register-push-token",
                body = payload
            )
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun getInitialNotifications(): List<Notification> = listOf(
        Notification(
            id = "notif-01",
            userId = "user-1",
            module = "jobs",
            type = "NEW_JOB_MATCH",
            title = "New 96% Match Opportunity",
            message = "Lead Android Systems Architect at TalentXcel Pro matches your verified Kotlin & Architecture skills.",
            link = "/jobs/job-101",
            isRead = false,
            priority = "high",
            createdAt = "10 minutes ago"
        ),
        Notification(
            id = "notif-02",
            userId = "user-1",
            module = "network",
            type = "CONNECTION_REQUEST",
            title = "Connection Request",
            message = "Priya Sharma (Engineering Director) sent you a connection invitation.",
            link = "/network",
            isRead = false,
            priority = "medium",
            createdAt = "1 hour ago"
        ),
        Notification(
            id = "notif-03",
            userId = "user-1",
            module = "applications",
            type = "APPLICATION_UPDATE",
            title = "Application Status: Interview",
            message = "Your application at DeepMind Ecosystem moved to Interview Round.",
            link = "/applications",
            isRead = true,
            priority = "high",
            createdAt = "Yesterday"
        )
    )
}
