package com.talentxcel.android.data.applications

import com.talentxcel.android.domain.models.Application
import com.talentxcel.android.domain.models.ApplicationStatus
import com.talentxcel.android.domain.repositories.ApplicationRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.UUID

class ApplicationRepositoryImpl : ApplicationRepository {

    private val userApplications = mutableListOf(
        Application(
            id = "app-01",
            jobId = "job-101",
            jobTitle = "Lead Android Systems Architect",
            company = "TalentXcel Pro Engineering",
            appliedAt = "2026-09-26",
            status = ApplicationStatus.INTERVIEW,
            lastUpdate = "Interview scheduled with VP of Engineering for Oct 2.",
            notes = "Submitted with tailored ATS resume v3"
        ),
        Application(
            id = "app-02",
            jobId = "job-102",
            jobTitle = "Senior AI Platform Engineer",
            company = "DeepMind Ecosystem",
            appliedAt = "2026-09-24",
            status = ApplicationStatus.SHORTLISTED,
            lastUpdate = "Resume passed automated technical screening (94% score).",
            notes = "Referred by connection"
        )
    )

    override suspend fun getMyApplications(userId: String): Result<List<Application>> = withContext(Dispatchers.IO) {
        Result.success(userApplications.toList())
    }

    override suspend fun applyToJob(userId: String, jobId: String, notes: String?): Result<String> = withContext(Dispatchers.IO) {
        val newApp = Application(
            id = UUID.randomUUID().toString(),
            jobId = jobId,
            jobTitle = "Applied Role",
            company = "TalentXcel Partner",
            appliedAt = "Just now",
            status = ApplicationStatus.APPLIED,
            lastUpdate = "Application received by recruiting team.",
            notes = notes
        )
        userApplications.add(0, newApp)
        Result.success(newApp.id)
    }

    override suspend fun withdrawApplication(applicationId: String): Result<Unit> = withContext(Dispatchers.IO) {
        val index = userApplications.indexOfFirst { it.id == applicationId }
        if (index != -1) {
            userApplications[index] = userApplications[index].copy(status = ApplicationStatus.WITHDRAWN)
        }
        Result.success(Unit)
    }
}
