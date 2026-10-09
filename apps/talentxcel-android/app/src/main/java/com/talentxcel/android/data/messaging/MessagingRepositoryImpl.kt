package com.talentxcel.android.data.messaging

import com.talentxcel.android.core.network.SupabaseClientProvider
import com.talentxcel.android.domain.models.Conversation
import com.talentxcel.android.domain.models.Message
import com.talentxcel.android.domain.models.MessageStatus
import com.talentxcel.android.domain.repositories.MessagingRepository
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.query.Columns
import io.github.jan.supabase.postgrest.query.Order
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import java.util.UUID

@Serializable
data class MessageDto(
    val id: String,
    val conversation_id: String? = null,
    val sender_id: String? = null,
    val recipient_id: String? = null,
    val content: String,
    val created_at: String? = null,
    val is_read: Boolean? = true
)

@Serializable
data class SendMessageDto(
    val conversation_id: String,
    val sender_id: String,
    val recipient_id: String,
    val content: String
)

class MessagingRepositoryImpl(
    private val customPostgrest: Postgrest? = null
) : MessagingRepository {

    private val postgrest: Postgrest?
        get() = customPostgrest ?: try {
            SupabaseClientProvider.postgrest
        } catch (e: Throwable) {
            null
        }

    private val activeMessages = mutableMapOf<String, MutableList<Message>>()

    init {
        // Initialize default sample threads
        activeMessages["conv-101"] = mutableListOf(
            Message(
                id = "m-1",
                conversationId = "conv-101",
                senderId = "u-priya",
                senderName = "Priya Sharma",
                content = "Hi Arshid! I saw your verified Career Passport for On-Device AI Architecture. Are you open to discussing a Staff role?",
                timestamp = "10:30 AM",
                isFromMe = false
            ),
            Message(
                id = "m-2",
                conversationId = "conv-101",
                senderId = "me",
                senderName = "Arshid Wani",
                content = "Hello Priya, thanks for reaching out! Yes, I am exploring staff-level mobile & AI systems leadership roles.",
                timestamp = "10:34 AM",
                isFromMe = true
            )
        )

        activeMessages["conv-102"] = mutableListOf(
            Message(
                id = "m-3",
                conversationId = "conv-102",
                senderId = "u-vikram",
                senderName = "Vikram Patel",
                content = "Great paper on the GGUF quantization pipeline. Have you benchmarked cold-start memory residency on Moto devices?",
                timestamp = "Yesterday",
                isFromMe = false
            )
        )
    }

    override fun getConversations(userId: String): Flow<Result<List<Conversation>>> = flow {
        val defaultList = listOf(
            Conversation(
                id = "conv-101",
                participantId = "u-priya",
                participantName = "Priya Sharma",
                participantHeadline = "Engineering Director at Fintech Horizons",
                participantAvatarUrl = null,
                lastMessage = activeMessages["conv-101"]?.lastOrNull()?.content ?: "Let's connect regarding the Staff role.",
                lastMessageTime = "10:34 AM",
                unreadCount = 0,
                isOnline = true
            ),
            Conversation(
                id = "conv-102",
                participantId = "u-vikram",
                participantName = "Vikram Patel",
                participantHeadline = "Principal AI Researcher @ IIT Bombay",
                participantAvatarUrl = null,
                lastMessage = activeMessages["conv-102"]?.lastOrNull()?.content ?: "Great paper on the GGUF quantization pipeline.",
                lastMessageTime = "Yesterday",
                unreadCount = 1,
                isOnline = false
            ),
            Conversation(
                id = "conv-103",
                participantId = "u-ananya",
                participantName = "Ananya Roy",
                participantHeadline = "Lead Android Developer @ Swiggy",
                participantAvatarUrl = null,
                lastMessage = "Thanks for verifying my Jetpack Compose endorsement!",
                lastMessageTime = "2d ago",
                unreadCount = 0,
                isOnline = true
            )
        )

        try {
            val client = postgrest
            val currentUserId = try {
                SupabaseClientProvider.client.auth.currentUserOrNull()?.id
            } catch (e: Exception) { null }

            if (client != null && currentUserId != null) {
                @Serializable
                data class ConversationRowDto(
                    val id: String,
                    val participants: List<String>? = null,
                    val last_updated: String? = null
                )

                val remoteConvos = try {
                    client.from("conversations")
                        .select { filter { contains("participants", listOf(currentUserId)) } }
                        .decodeList<ConversationRowDto>()
                } catch (e: Exception) { emptyList() }

                if (remoteConvos.isNotEmpty()) {
                    // Map real conversations — resolve participant names from messages seen so far
                    val mapped = remoteConvos.mapNotNull { row ->
                        val otherParticipantId = row.participants
                            ?.firstOrNull { it != currentUserId } ?: return@mapNotNull null
                        val existingMessages = activeMessages[row.id]
                        Conversation(
                            id = row.id,
                            participantId = otherParticipantId,
                            participantName = existingMessages?.firstOrNull { !it.isFromMe }?.senderName ?: "TalentXcel Member",
                            participantHeadline = "TalentXcel Professional",
                            participantAvatarUrl = null,
                            lastMessage = existingMessages?.lastOrNull()?.content ?: "Tap to view conversation",
                            lastMessageTime = row.last_updated?.take(10) ?: "Recent",
                            unreadCount = existingMessages?.count { !it.isRead && !it.isFromMe } ?: 0,
                            isOnline = false
                        )
                    }
                    // Emit real data merged with any local-only threads
                    emit(Result.success(mapped + defaultList.filter { d -> mapped.none { it.id == d.id } }))
                    return@flow
                }
            }
        } catch (e: Exception) {
            // Network error — fall through to defaults
        }

        // Offline / unauthenticated fallback
        emit(Result.success(defaultList))
    }.flowOn(Dispatchers.IO)

    override fun getMessages(conversationId: String): Flow<Result<List<Message>>> = flow {
        try {
            val client = postgrest
            val currentUserId = try {
                SupabaseClientProvider.client.auth.currentUserOrNull()?.id
            } catch (e: Exception) {
                null
            }

            var remoteMessages = emptyList<MessageDto>()
            if (client != null) {
                try {
                    remoteMessages = client.from("messages")
                        .select {
                            filter { eq("conversation_id", conversationId) }
                            order("created_at", Order.ASCENDING)
                        }
                        .decodeList<MessageDto>()
                } catch (e: Exception) {
                    // Safe fallback
                }
            }

            if (remoteMessages.isNotEmpty()) {
                val mapped = remoteMessages.map { dto ->
                    Message(
                        id = dto.id,
                        conversationId = conversationId,
                        senderId = dto.sender_id ?: "unknown",
                        senderName = if (dto.sender_id == currentUserId) "You" else "Colleague",
                        content = dto.content,
                        timestamp = dto.created_at?.takeLast(8)?.take(5) ?: "Just now",
                        isFromMe = dto.sender_id == currentUserId,
                        isRead = dto.is_read ?: true
                    )
                }
                emit(Result.success(mapped))
            } else {
                val cached = activeMessages[conversationId] ?: emptyList()
                emit(Result.success(cached))
            }
        } catch (e: Exception) {
            val cached = activeMessages[conversationId] ?: emptyList()
            emit(Result.success(cached))
        }
    }.flowOn(Dispatchers.IO)

    override suspend fun sendMessage(
        conversationId: String,
        recipientId: String,
        content: String
    ): Result<Message> = withContext(Dispatchers.IO) {
        try {
            val currentUserId = try {
                SupabaseClientProvider.client.auth.currentUserOrNull()?.id
            } catch (e: Exception) {
                null
            } ?: "current_user"

            val messageId = "msg_${UUID.randomUUID().toString().take(8)}"

            // R-1: Start with QUEUED; only promote to SENT after confirmed Supabase write
            var deliveryStatus = MessageStatus.QUEUED

            // Attempt to write to Supabase messages table
            val client = postgrest
            if (client != null) {
                try {
                    client.from("messages").insert(
                        SendMessageDto(
                            conversation_id = conversationId,
                            sender_id = currentUserId,
                            recipient_id = recipientId,
                            content = content
                        )
                    )
                    deliveryStatus = MessageStatus.SENT  // Confirmed by Supabase
                } catch (e: Exception) {
                    // C-3 + R-2: surface auth errors and fire the auth-expiry event bus
                    val msg = e.message ?: ""
                    if (msg.contains("401") || msg.contains("403") ||
                        msg.contains("JWT") || msg.contains("not authenticated")) {
                        // R-2: Notify the entire app that the session has expired
                        com.talentxcel.android.core.auth.AuthEventBus.emit(
                            com.talentxcel.android.core.auth.AuthEvent.AuthExpired
                        )
                        return@withContext Result.failure(
                            SecurityException("Not authorized to send message. Please sign in again.")
                        )
                    }
                    deliveryStatus = MessageStatus.QUEUED  // Offline — queued locally
                }
            }
            // postgrest == null means we're offline — message stays QUEUED

            val newMessage = Message(
                id = messageId,
                conversationId = conversationId,
                senderId = currentUserId,
                senderName = "Arshid Wani",
                content = content,
                timestamp = "Just now",
                isFromMe = true,
                isRead = false,
                status = deliveryStatus   // R-1: honest delivery status
            )

            val list = activeMessages.getOrPut(conversationId) { mutableListOf() }
            list.add(newMessage)

            Result.success(newMessage)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
