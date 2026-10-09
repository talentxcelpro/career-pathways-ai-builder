package com.talentxcel.android.data.career

import com.talentxcel.android.core.network.SupabaseClientProvider
import com.talentxcel.android.domain.models.CareerMilestone
import com.talentxcel.android.domain.models.CareerPathway
import com.talentxcel.android.domain.models.CareerRecommendation
import com.talentxcel.android.domain.models.PathwayNode
import com.talentxcel.android.domain.models.PathwayNodeStatus
import com.talentxcel.android.domain.repositories.CareerRepository
import io.github.jan.supabase.postgrest.postgrest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class CareerRepositoryImpl : CareerRepository {

    override suspend fun getRecommendations(userId: String): Result<List<CareerRecommendation>> = withContext(Dispatchers.IO) {
        val list = listOf(
            CareerRecommendation(
                id = "rec-1",
                title = "Learn On-Device Vector Embeddings",
                description = "Mastering local embedding indices can increase your match score for AI Mobile Architect roles by 18%.",
                type = "skill",
                confidenceScore = 0.94f,
                priority = 1
            ),
            CareerRecommendation(
                id = "rec-2",
                title = "Highlight Coroutines & Structured Concurrency",
                description = "Your recent resume emphasizes reactive programming. Adding concrete performance throughput metrics will boost interview calls.",
                type = "resume",
                confidenceScore = 0.89f,
                priority = 2
            ),
            CareerRecommendation(
                id = "rec-3",
                title = "Target Lead / Staff Engineering Positions",
                description = "Based on your 8+ years of expertise and talent score of 88/100, you are ready for Staff Systems leadership.",
                type = "role",
                confidenceScore = 0.96f,
                priority = 3
            )
        )
        Result.success(list)
    }

    override suspend fun computeTalentScore(userId: String): Result<Int> = withContext(Dispatchers.IO) {
        Result.success(88)
    }

    override suspend fun getCareerPathway(userId: String): Result<CareerPathway> = withContext(Dispatchers.IO) {
        val nodes = listOf(
            PathwayNode(
                id = "node-l1",
                levelNumber = 1,
                roleTitle = "Senior Mobile Systems Engineer",
                status = PathwayNodeStatus.COMPLETED,
                readinessPercentage = 100,
                salaryBand = "₹24L - ₹36L",
                timeToMilestone = "Achieved (2024)",
                coreCompetencies = listOf("Kotlin", "Jetpack Compose", "Coroutines", "Room ORM", "Clean Architecture"),
                missingSkills = emptyList(),
                milestones = listOf(
                    CareerMilestone("Shipped production app with 99.9% crash-free rate", true),
                    CareerMilestone("Led migration from Imperative Views to Declarative Compose", true),
                    CareerMilestone("Implemented offline-first caching with Room & SQLCipher", true)
                ),
                aiGuidanceNote = "Foundation completed with exceptional proficiency in reactive Android programming and modularization."
            ),
            PathwayNode(
                id = "node-l2",
                levelNumber = 2,
                roleTitle = "Lead Mobile Architect (Current)",
                status = PathwayNodeStatus.CURRENT,
                readinessPercentage = 86,
                salaryBand = "₹38L - ₹55L",
                timeToMilestone = "Current Role",
                coreCompetencies = listOf("Distributed Systems", "On-Device AI Inference", "Multi-module Gradle", "CI/CD & Fastlane"),
                missingSkills = listOf("KMP (Kotlin Multiplatform)", "Advanced R8/ProGuard Rules"),
                milestones = listOf(
                    CareerMilestone("Architected private on-device LLM hybrid inference layer", true),
                    CareerMilestone("Achieved sub-200ms app cold-start latency budget", true),
                    CareerMilestone("Productionize cross-platform Kotlin Multiplatform modules", false)
                ),
                aiGuidanceNote = "Strong mastery in modern architecture. Finalize KMP cross-platform sharing to unlock Staff Engineering tier."
            ),
            PathwayNode(
                id = "node-l3",
                levelNumber = 3,
                roleTitle = "Staff AI Systems Architect",
                status = PathwayNodeStatus.NEXT_TARGET,
                readinessPercentage = 68,
                salaryBand = "₹58L - ₹85L",
                timeToMilestone = "6 - 12 Months",
                coreCompetencies = listOf("Edge LLM Quantization (GGUF/ONNX)", "Hardware Acceleration (NPU/GPU)", "Cross-functional Org Leadership", "Zero-Trust Security"),
                missingSkills = listOf("NPU Acceleration (Qualcomm NPU / MediaTek APU)", "Federated Edge Learning", "Org-wide Engineering Strategy"),
                milestones = listOf(
                    CareerMilestone("Publish technical whitepaper on Edge AI inference efficiency", false),
                    CareerMilestone("Drive organization-wide AI privacy security boundary standard", false),
                    CareerMilestone("Mentor 5+ senior engineers into lead architecture roles", false)
                ),
                aiGuidanceNote = "Target role within 12 months. Prioritize NPU hardware delegate acceleration and technical leadership presence."
            ),
            PathwayNode(
                id = "node-l4",
                levelNumber = 4,
                roleTitle = "VP of Mobile Engineering / Distinguished Architect",
                status = PathwayNodeStatus.FUTURE,
                readinessPercentage = 42,
                salaryBand = "₹90L - ₹1.4Cr+",
                timeToMilestone = "2 - 3 Years",
                coreCompetencies = listOf("Enterprise Technology Roadmap", "P&L Executive Alignment", "Global Patent Portfolio", "Board-level Strategy"),
                missingSkills = listOf("Executive Leadership & Executive Presence", "Multi-million Dollar Budget Allocation", "M&A Tech Due Diligence"),
                milestones = listOf(
                    CareerMilestone("Lead a 100+ engineer distributed engineering organization", false),
                    CareerMilestone("Deliver platform scaled to 50M+ active users", false),
                    CareerMilestone("Represent organization at global technology keynotes", false)
                ),
                aiGuidanceNote = "Long-term horizon. Focus on strategic business alignment, executive presence, and org scaling."
            )
        )

        val pathway = CareerPathway(
            id = "path-mobile-ai-architect",
            trackTitle = "Mobile Systems Architecture & On-Device AI Engineering",
            currentRole = "Lead Mobile Architect",
            targetRole = "Staff AI Systems Architect",
            overallReadiness = 76,
            nodes = nodes
        )
        Result.success(pathway)
    }
}
