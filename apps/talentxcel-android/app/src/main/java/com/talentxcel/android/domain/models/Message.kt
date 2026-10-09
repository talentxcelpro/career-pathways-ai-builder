package com.talentxcel.android.domain.models

/**
 * R-1: Tracks the delivery state of a message.
 * SENT     - Confirmed written to Supabase.
 * QUEUED   - Sent while offline; will be retried on reconnect.
 * FAILED   - Auth or permanent failure; user should be notified.
 */
enum class MessageStatus { SENT, QUEUED, FAILED }

data class Message(
    val id: String,
    val conversationId: String,
    val senderId: String,
    val senderName: String,
    val content: String,
    val timestamp: String,
    val isFromMe: Boolean,
    val isRead: Boolean = true,
    val status: MessageStatus = MessageStatus.SENT   // R-1: delivery status
)

data class Conversation(
    val id: String,
    val participantId: String,
    val participantName: String,
    val participantHeadline: String,
    val participantAvatarUrl: String? = null,
    val lastMessage: String,
    val lastMessageTime: String,
    val unreadCount: Int = 0,
    val isOnline: Boolean = false
)
