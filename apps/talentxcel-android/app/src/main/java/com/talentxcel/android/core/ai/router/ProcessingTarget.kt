package com.talentxcel.android.core.ai.router

enum class ProcessingTarget {
    LOCAL_ONLY,
    CLOUD_REQUIRED,
    HYBRID
}

data class RoutingDecision(
    val target: ProcessingTarget,
    val reason: String,
    val requiresUserApproval: Boolean = false
)
