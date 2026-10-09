package com.talentxcel.android.domain.repositories

import com.talentxcel.android.domain.models.Application

interface ApplicationRepository {
    suspend fun getMyApplications(userId: String): Result<List<Application>>
    suspend fun applyToJob(userId: String, jobId: String, notes: String? = null): Result<String>
    suspend fun withdrawApplication(applicationId: String): Result<Unit>
}
