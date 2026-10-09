package com.talentxcel.android.domain.models

enum class ApplicationStatus(val displayName: String) {
    APPLIED("Applied"),
    UNDER_REVIEW("Under Review"),
    SHORTLISTED("Shortlisted"),
    INTERVIEW("Interview"),
    SELECTED("Offer Extended"),
    REJECTED("Not Selected"),
    WITHDRAWN("Withdrawn")
}

data class Application(
    val id: String,
    val jobId: String,
    val jobTitle: String,
    val company: String,
    val appliedAt: String,
    val status: ApplicationStatus,
    val lastUpdate: String,
    val notes: String? = null
)
