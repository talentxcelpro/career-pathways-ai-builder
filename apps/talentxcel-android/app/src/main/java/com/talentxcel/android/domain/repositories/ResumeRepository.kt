package com.talentxcel.android.domain.repositories

import com.talentxcel.android.domain.models.AtsAnalysis
import com.talentxcel.android.domain.models.ResumeDocument
import kotlinx.coroutines.flow.Flow

interface ResumeRepository {
    fun getResumes(): Flow<List<ResumeDocument>>
    suspend fun uploadResume(fileName: String, fileUri: String, fileBytes: ByteArray? = null): Result<ResumeDocument>
    suspend fun runAtsScan(resumeId: String, targetJobId: String? = null, jobDescription: String? = null): Result<AtsAnalysis>
    suspend fun acceptBulletOptimization(resumeId: String, bulletId: String): Result<Unit>
    suspend fun deleteResume(resumeId: String): Result<Unit>
}
