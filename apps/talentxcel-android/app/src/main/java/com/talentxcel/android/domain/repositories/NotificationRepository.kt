package com.talentxcel.android.domain.repositories

import com.talentxcel.android.domain.models.Notification
import kotlinx.coroutines.flow.Flow

interface NotificationRepository {
    suspend fun getNotifications(userId: String): Result<List<Notification>>
    fun observeNotifications(userId: String): Flow<List<Notification>>
    suspend fun markAsRead(notificationId: String): Result<Unit>
    suspend fun markAllAsRead(userId: String): Result<Unit>
    suspend fun registerDevicePushToken(token: String): Result<Unit>
}
