package com.talentxcel.android.domain.models

data class Job(
    val id: String,
    val title: String,
    val company: String,
    val location: String,
    val salaryMin: Long? = null,
    val salaryMax: Long? = null,
    val currency: String? = "INR",
    val employmentType: String = "Full-time",
    val workMode: String = "Remote",
    val experienceMin: Int? = 0,
    val experienceMax: Int? = null,
    val skills: List<String> = emptyList(),
    val description: String = "",
    val requirements: String? = null,
    val benefits: String? = null,
    val source: String = "TalentXcel Direct",
    val applyUrl: String? = null,
    val postedAt: String = "",
    val isActive: Boolean = true,
    val isSaved: Boolean = false,
    val matchScore: Int? = null // AI Match % e.g. 94%
)
