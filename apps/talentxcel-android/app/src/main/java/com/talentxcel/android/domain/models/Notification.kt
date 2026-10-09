package com.talentxcel.android.domain.models

data class Notification(
    val id: String,
    val userId: String,
    val module: String, // network, jobs, resume, etc.
    val type: String,
    val title: String,
    val message: String,
    val link: String,
    val isRead: Boolean,
    val priority: String = "medium",
    val createdAt: String
)
