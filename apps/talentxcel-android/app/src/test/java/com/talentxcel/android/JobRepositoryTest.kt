package com.talentxcel.android

import com.talentxcel.android.data.jobs.JobRepositoryImpl
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class JobRepositoryTest {

    private lateinit var jobRepository: JobRepositoryImpl

    @Before
    fun setUp() {
        jobRepository = JobRepositoryImpl()
    }

    @Test
    fun `toggleSaveJob toggles state between true and false`() = runBlocking {
        val jobId = "job-101"

        val firstToggle = jobRepository.toggleSaveJob(jobId, currentSavedState = false)
        assertTrue(firstToggle.isSuccess)
        assertTrue(firstToggle.getOrNull() == true)

        val secondToggle = jobRepository.toggleSaveJob(jobId, currentSavedState = true)
        assertTrue(secondToggle.isSuccess)
        assertFalse(secondToggle.getOrNull() == true)
    }

    @Test
    fun `getJobById returns valid job specification`() = runBlocking {
        val result = jobRepository.getJobById("job-101")
        assertTrue(result.isSuccess)
        val job = result.getOrNull()
        assertNotNull(job)
        assertTrue(job?.title?.isNotEmpty() == true)
    }
}
