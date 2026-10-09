package com.talentxcel.android.domain.repositories

import com.talentxcel.android.domain.models.Conversation
import com.talentxcel.android.domain.models.Message
import kotlinx.coroutines.flow.Flow

interface MessagingRepository {
    fun getConversations(userId: String): Flow<Result<List<Conversation>>>
    fun getMessages(conversationId: String): Flow<Result<List<Message>>>
    suspend fun sendMessage(conversationId: String, recipientId: String, content: String): Result<Message>
}
