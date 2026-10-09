package com.talentxcel.android.domain.models

enum class PathwayNodeStatus {
    COMPLETED,
    CURRENT,
    NEXT_TARGET,
    FUTURE
}

data class CareerMilestone(
    val title: String,
    val isAchieved: Boolean
)

data class PathwayNode(
    val id: String,
    val levelNumber: Int,
    val roleTitle: String,
    val status: PathwayNodeStatus,
    val readinessPercentage: Int,
    val salaryBand: String,
    val timeToMilestone: String,
    val coreCompetencies: List<String>,
    val missingSkills: List<String>,
    val milestones: List<CareerMilestone>,
    val aiGuidanceNote: String
)

data class CareerPathway(
    val id: String,
    val trackTitle: String,
    val currentRole: String,
    val targetRole: String,
    val overallReadiness: Int,
    val nodes: List<PathwayNode>
)
