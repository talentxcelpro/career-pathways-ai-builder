package com.talentxcel.android.domain.repositories

import com.talentxcel.android.domain.models.Connection

interface NetworkRepository {
    suspend fun getConnections(userId: String): Result<List<Connection>>
    suspend fun getSuggestedConnections(userId: String): Result<List<Connection>>
    suspend fun sendConnectionRequest(targetUserId: String): Result<Unit>
    suspend fun acceptConnectionRequest(connectionId: String): Result<Unit>
}
