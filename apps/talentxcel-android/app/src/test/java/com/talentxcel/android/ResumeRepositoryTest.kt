package com.talentxcel.android

import com.talentxcel.android.core.ai.model.ModelManager
import com.talentxcel.android.core.ai.runtime.CloudAIProvider
import com.talentxcel.android.core.ai.runtime.LocalAIProvider
import com.talentxcel.android.data.resume.ResumeRepositoryImpl
import io.mockk.every
import io.mockk.mockk
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class ResumeRepositoryTest {

    private lateinit var modelManager: ModelManager
    private lateinit var localAIProvider: LocalAIProvider
    private lateinit var cloudAIProvider: CloudAIProvider
    private lateinit var repository: ResumeRepositoryImpl

    @Before
    fun setUp() {
        modelManager = mockk(relaxed = true)
        localAIProvider = mockk(relaxed = true)
        cloudAIProvider = mockk(relaxed = true)

        every { localAIProvider.isAvailable } returns true

        repository = ResumeRepositoryImpl(
            modelManager = modelManager,
            localAIProvider = localAIProvider,
            cloudAIProvider = cloudAIProvider
        )
    }

    @Test
    fun `getResumes returns initial resume library with primary resume`() = runBlocking {
        val resumes = repository.getResumes().first()
        assertTrue(resumes.isNotEmpty())
        val primary = resumes.find { it.isPrimary }
        assertNotNull(primary)
        assertNotNull(primary!!.atsAnalysis)
        assertTrue(primary.atsAnalysis!!.overallScore in 80..100)
    }

    @Test
    fun `uploadResume adds new document to resume collection`() = runBlocking {
        val result = repository.uploadResume(
            fileName = "Staff_Engineer_Resume_2026.pdf",
            fileUri = "content://media/external/files/101",
            fileBytes = ByteArray(1024 * 350)
        )
        assertTrue(result.isSuccess)

        val updatedList = repository.getResumes().first()
        assertTrue(updatedList.any { it.fileName == "Staff_Engineer_Resume_2026.pdf" })
    }

    @Test
    fun `runAtsScan calculates keyword, formatting, and impact scores`() = runBlocking {
        val resumes = repository.getResumes().first()
        val firstResume = resumes.first()

        val scanResult = repository.runAtsScan(firstResume.id)
        assertTrue(scanResult.isSuccess)

        val analysis = scanResult.getOrNull()
        assertNotNull(analysis)
        assertTrue(analysis!!.overallScore > 0)
        assertTrue(analysis.matchedKeywords.isNotEmpty())
        assertTrue(analysis.missingKeywords.isNotEmpty())
        assertTrue(analysis.bulletImprovements.isNotEmpty())
    }

    @Test
    fun `acceptBulletOptimization updates resume bullet state`() = runBlocking {
        val resumes = repository.getResumes().first()
        val firstResume = resumes.first()
        val firstBulletId = firstResume.atsAnalysis!!.bulletImprovements.first().id

        val acceptResult = repository.acceptBulletOptimization(firstResume.id, firstBulletId)
        assertTrue(acceptResult.isSuccess)

        val updatedResumes = repository.getResumes().first()
        val updatedBullet = updatedResumes.first { it.id == firstResume.id }
            .atsAnalysis!!.bulletImprovements.first { it.id == firstBulletId }

        assertTrue(updatedBullet.isAccepted)
    }
}
