package com.talentxcel.android.core.ai.memory

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID

/**
 * Manages the Personal AI Agent's private on-device memory.
 * Grants the user complete transparency and control to inspect, export, or wipe memories.
 */
class MemoryManager {

    private val _memories = MutableStateFlow<List<MemoryItem>>(emptyList())
    val memories: StateFlow<List<MemoryItem>> = _memories.asStateFlow()

    init {
        // Seed initial default career context
        addMemory(
            category = MemoryCategory.CAREER_GOAL,
            content = "Targeting Senior Software Engineer & Tech Lead roles with modern mobile and cloud focus.",
            importance = 5
        )
        addMemory(
            category = MemoryCategory.PREFERENCE,
            content = "Prefers remote or hybrid work environments in India and global remote companies.",
            importance = 4
        )
    }

    fun addMemory(category: MemoryCategory, content: String, importance: Int = 1): MemoryItem {
        val item = MemoryItem(
            id = UUID.randomUUID().toString(),
            category = category,
            content = content,
            importance = importance
        )
        _memories.value = _memories.value + item
        return item
    }

    fun deleteMemory(id: String) {
        _memories.value = _memories.value.filterNot { it.id == id }
    }

    fun clearAllMemories() {
        _memories.value = emptyList()
    }

    fun getContextString(): String {
        return _memories.value.joinToString("\n") { "• [${it.category}]: ${it.content}" }
    }
}
