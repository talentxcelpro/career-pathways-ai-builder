package com.talentxcel.android.domain.models

data class ResumeDocument(
    val id: String,
    val fileName: String,
    val fileSize: String,
    val uploadDate: String,
    val fileUri: String? = null,
    val isPrimary: Boolean = false,
    val atsAnalysis: AtsAnalysis? = null
)

data class AtsAnalysis(
    val overallScore: Int, // 0 - 100
    val formattingScore: Int, // 0 - 100
    val keywordScore: Int, // 0 - 100
    val impactScore: Int, // 0 - 100
    val targetRole: String = "Senior Software Engineer",
    val matchedKeywords: List<String> = emptyList(),
    val missingKeywords: List<String> = emptyList(),
    val bulletImprovements: List<BulletOptimization> = emptyList(),
    val jobMatch: JobMatchScore? = null
)

data class BulletOptimization(
    val id: String,
    val original: String,
    val improved: String,
    val impactExplanation: String,
    val isAccepted: Boolean = false
)

data class JobMatchScore(
    val jobId: String,
    val jobTitle: String,
    val companyName: String,
    val matchPercentage: Int,
    val missingRequirements: List<String>
)
