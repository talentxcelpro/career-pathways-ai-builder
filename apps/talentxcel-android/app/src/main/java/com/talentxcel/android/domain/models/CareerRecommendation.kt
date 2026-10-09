package com.talentxcel.android.domain.models

data class CareerRecommendation(
    val id: String,
    val title: String,
    val description: String,
    val type: String, // skill, role, cert, resume
    val confidenceScore: Float = 0.92f,
    val priority: Int = 1
)
