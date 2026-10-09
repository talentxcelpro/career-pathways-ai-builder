package com.talentxcel.android

import com.talentxcel.android.data.messaging.MessagingRepositoryImpl
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class MessagingRepositoryTest {

    private lateinit var messagingRepository: MessagingRepositoryImpl

    @Before
    fun setup() {
        messagingRepository = MessagingRepositoryImpl(customPostgrest = null)
    }

    @Test
    fun getConversations_returnsDefaultThreads() = runBlocking {
        val result = messagingRepository.getConversations("current_user").first()
        assertTrue(result.isSuccess)
        val convs = result.getOrNull()
        assertNotNull(convs)
        assertTrue(convs!!.isNotEmpty())
        assertEquals("conv-101", convs.first().id)
    }

    @Test
    fun getMessages_returnsThreadMessages() = runBlocking {
        val result = messagingRepository.getMessages("conv-101").first()
        assertTrue(result.isSuccess)
        val messages = result.getOrNull()
        assertNotNull(messages)
        assertTrue(messages!!.isNotEmpty())
    }

    @Test
    fun sendMessage_addsMessageToConversation() = runBlocking {
        val content = "Let's discuss the Staff AI Systems Architect opportunity."
        val result = messagingRepository.sendMessage("conv-101", "u-priya", content)
        assertTrue(result.isSuccess)
        val message = result.getOrNull()
        assertNotNull(message)
        assertEquals(content, message!!.content)
        assertTrue(message.isFromMe)
        // R-1 Verification: When offline (customPostgrest=null), message is marked QUEUED
        assertEquals(com.talentxcel.android.domain.models.MessageStatus.QUEUED, message.status)

        // Verify message is in conversation
        val threadResult = messagingRepository.getMessages("conv-101").first()
        val thread = threadResult.getOrNull()!!
        assertEquals(content, thread.last().content)
        assertEquals(com.talentxcel.android.domain.models.MessageStatus.QUEUED, thread.last().status)
    }

    @Test
    fun sendMessage_offlineMode_marksStatusAsQueuedNeverFalseSent() = runBlocking {
        val result = messagingRepository.sendMessage("conv-102", "u-vikram", "Testing offline honesty")
        assertTrue(result.isSuccess)
        val message = result.getOrNull()!!
        // R-1 Verification: Must never claim SENT when not confirmed by server
        assertTrue(message.status == com.talentxcel.android.domain.models.MessageStatus.QUEUED)
    }
}
