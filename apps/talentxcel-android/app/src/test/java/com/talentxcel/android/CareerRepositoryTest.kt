package com.talentxcel.android

import com.talentxcel.android.data.career.CareerRepositoryImpl
import com.talentxcel.android.domain.models.PathwayNodeStatus
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class CareerRepositoryTest {

    private lateinit var careerRepository: CareerRepositoryImpl

    @Before
    fun setup() {
        careerRepository = CareerRepositoryImpl()
    }

    @Test
    fun getRecommendations_returnsStrategicAdvice() = runBlocking {
        val result = careerRepository.getRecommendations("current_user")
        assertTrue(result.isSuccess)
        val list = result.getOrNull()
        assertNotNull(list)
        assertTrue(list!!.isNotEmpty())
    }

    @Test
    fun computeTalentScore_returnsHighBenchmark() = runBlocking {
        val result = careerRepository.computeTalentScore("current_user")
        assertTrue(result.isSuccess)
        val score = result.getOrNull()
        assertNotNull(score)
        assertTrue(score!! in 80..100)
    }

    @Test
    fun getCareerPathway_returnsFourLevelProgressionTree() = runBlocking {
        val result = careerRepository.getCareerPathway("current_user")
        assertTrue(result.isSuccess)
        val pathway = result.getOrNull()
        assertNotNull(pathway)
        assertEquals(4, pathway!!.nodes.size)
        assertTrue(pathway.overallReadiness > 70)

        val completedNode = pathway.nodes.find { it.status == PathwayNodeStatus.COMPLETED }
        assertNotNull(completedNode)
        assertEquals(100, completedNode!!.readinessPercentage)

        val currentNode = pathway.nodes.find { it.status == PathwayNodeStatus.CURRENT }
        assertNotNull(currentNode)

        val targetNode = pathway.nodes.find { it.status == PathwayNodeStatus.NEXT_TARGET }
        assertNotNull(targetNode)
        assertTrue(targetNode!!.missingSkills.isNotEmpty())
    }
}
