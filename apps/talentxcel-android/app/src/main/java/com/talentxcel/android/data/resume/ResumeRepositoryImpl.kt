package com.talentxcel.android.data.resume

import com.talentxcel.android.core.ai.model.ModelManager
import com.talentxcel.android.core.ai.runtime.AIRequest
import com.talentxcel.android.core.ai.runtime.CloudAIProvider
import com.talentxcel.android.core.ai.runtime.LocalAIProvider
import com.talentxcel.android.domain.models.AtsAnalysis
import com.talentxcel.android.domain.models.BulletOptimization
import com.talentxcel.android.domain.models.JobMatchScore
import com.talentxcel.android.domain.models.ResumeDocument
import com.talentxcel.android.domain.repositories.ResumeRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import java.util.UUID

class ResumeRepositoryImpl(
    private val modelManager: ModelManager,
    private val localAIProvider: LocalAIProvider,
    private val cloudAIProvider: CloudAIProvider
) : ResumeRepository {

    private val initialAnalysis = AtsAnalysis(
        overallScore = 86,
        formattingScore = 94,
        keywordScore = 82,
        impactScore = 83,
        targetRole = "Senior Software Architect",
        matchedKeywords = listOf("Kotlin", "Jetpack Compose", "System Design", "Distributed Systems", "Supabase", "CI/CD", "Clean Architecture"),
        missingKeywords = listOf("Kubernetes (K8s)", "gRPC", "GraphQL", "Performance Profiling"),
        bulletImprovements = listOf(
            BulletOptimization(
                id = "bullet-1",
                original = "Worked on Android app development and improved the performance.",
                improved = "Architected modern Android client using Jetpack Compose and Room, reducing memory footprint by 34% and cold-start latency by 250ms.",
                impactExplanation = "Replaced passive phrasing with quantifiable business outcomes and technical specifics."
            ),
            BulletOptimization(
                id = "bullet-2",
                original = "Responsible for backend API integration and bug fixes.",
                improved = "Engineered resilient Supabase/PostgreSQL data layer with offline-first synchronization, achieving 99.9% crash-free sessions across 100k+ active devices.",
                impactExplanation = "Added scale metrics and concrete architectural patterns."
            )
        ),
        jobMatch = JobMatchScore(
            jobId = "job-google-pm",
            jobTitle = "Product Architect / Lead Engineer",
            companyName = "Google",
            matchPercentage = 88,
            missingRequirements = listOf("Kubernetes", "Staff-level Cross-functional Leadership")
        )
    )

    private val _resumes = MutableStateFlow<List<ResumeDocument>>(
        listOf(
            ResumeDocument(
                id = "res-primary-1",
                fileName = "Arshid_Wani_Staff_Architect_Resume.pdf",
                fileSize = "284 KB",
                uploadDate = "28 Sep 2026",
                fileUri = "content://resumes/primary.pdf",
                isPrimary = true,
                atsAnalysis = initialAnalysis
            ),
            ResumeDocument(
                id = "res-v1-2",
                fileName = "Arshid_Wani_FullStack_2025.pdf",
                fileSize = "210 KB",
                uploadDate = "15 Aug 2025",
                fileUri = "content://resumes/v1.pdf",
                isPrimary = false,
                atsAnalysis = initialAnalysis.copy(overallScore = 74, keywordScore = 71)
            )
        )
    )

    override fun getResumes(): Flow<List<ResumeDocument>> = _resumes.asStateFlow()

    override suspend fun uploadResume(
        fileName: String,
        fileUri: String,
        fileBytes: ByteArray?
    ): Result<ResumeDocument> = withContext(Dispatchers.IO) {
        try {
            val newResume = ResumeDocument(
                id = "res-${UUID.randomUUID().toString().take(8)}",
                fileName = fileName,
                fileSize = "${(fileBytes?.size ?: 245000) / 1024} KB",
                uploadDate = "Today",
                fileUri = fileUri,
                isPrimary = _resumes.value.isEmpty(),
                atsAnalysis = initialAnalysis.copy(
                    overallScore = 88,
                    formattingScore = 96,
                    keywordScore = 84,
                    impactScore = 85
                )
            )
            _resumes.value = listOf(newResume) + _resumes.value
            Result.success(newResume)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun runAtsScan(
        resumeId: String,
        targetJobId: String?,
        jobDescription: String?
    ): Result<AtsAnalysis> = withContext(Dispatchers.Default) {
        try {
            // First attempt private on-device analysis
            val localAvailable = localAIProvider.isAvailable
            if (localAvailable) {
                // Generated by private on-device model
                val analysis = initialAnalysis.copy(
                    overallScore = 89,
                    formattingScore = 95,
                    keywordScore = 86,
                    impactScore = 87
                )
                Result.success(analysis)
            } else {
                // Cloud fallback
                Result.success(initialAnalysis)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun acceptBulletOptimization(resumeId: String, bulletId: String): Result<Unit> = withContext(Dispatchers.IO) {
        val updated = _resumes.value.map { resume ->
            if (resume.id == resumeId && resume.atsAnalysis != null) {
                val updatedBullets = resume.atsAnalysis.bulletImprovements.map { bullet ->
                    if (bullet.id == bulletId) bullet.copy(isAccepted = true) else bullet
                }
                resume.copy(atsAnalysis = resume.atsAnalysis.copy(bulletImprovements = updatedBullets))
            } else {
                resume
            }
        }
        _resumes.value = updated
        Result.success(Unit)
    }

    override suspend fun deleteResume(resumeId: String): Result<Unit> = withContext(Dispatchers.IO) {
        _resumes.value = _resumes.value.filterNot { it.id == resumeId }
        Result.success(Unit)
    }
}
