package com.talentxcel.android.core.ai.memory

enum class MemoryCategory {
    SHORT_TERM,
    USER_FACT,
    CAREER_GOAL,
    PREFERENCE,
    CONVERSATION,
    TASK
}

data class MemoryItem(
    val id: String,
    val category: MemoryCategory,
    val content: String,
    val importance: Int = 1, // 1 to 5
    val createdAt: Long = System.currentTimeMillis(),
    val expiresAt: Long? = null
)
