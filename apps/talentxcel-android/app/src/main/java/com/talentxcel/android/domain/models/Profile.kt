package com.talentxcel.android.domain.models

data class Profile(
    val id: String,
    val fullName: String,
    val title: String,
    val headline: String,
    val location: String,
    val email: String,
    val phone: String? = null,
    val website: String? = null,
    val about: String? = null,
    val profilePictureUrl: String? = null,
    val coverImageUrl: String? = null,
    val linkedinUrl: String? = null,
    val githubUrl: String? = null,
    val portfolioUrl: String? = null,
    val talentxcelId: String? = null,
    val skills: List<String> = emptyList(),
    val completionPercentage: Int = 85
)
