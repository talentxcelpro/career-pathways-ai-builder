package com.talentxcel.android.domain.models

data class Connection(
    val id: String,
    val userId: String,
    val fullName: String,
    val headline: String,
    val profilePictureUrl: String? = null,
    val mutualConnectionsCount: Int = 0,
    val isConnected: Boolean = true,
    val isPending: Boolean = false
)
