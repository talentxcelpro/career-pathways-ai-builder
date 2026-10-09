package com.talentxcel.android.domain.repositories

import com.talentxcel.android.domain.models.Job

interface JobRepository {
    suspend fun getJobs(page: Int, limit: Int = 20, query: String? = null, workMode: String? = null): Result<List<Job>>
    suspend fun getJobById(jobId: String): Result<Job>
    suspend fun getRecommendedJobs(userId: String): Result<List<Job>>
    suspend fun toggleSaveJob(jobId: String, currentSavedState: Boolean): Result<Boolean>
    suspend fun getSavedJobs(userId: String): Result<List<Job>>
}
