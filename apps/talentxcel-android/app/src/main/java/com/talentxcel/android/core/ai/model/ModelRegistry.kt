package com.talentxcel.android.core.ai.model

enum class QuantizationType {
    Q4_K_M,
    Q4_0,
    INT8,
    FP16
}

data class ModelInfo(
    val id: String,
    val name: String,
    val version: String,
    val description: String,
    val sizeBytes: Long,
    val minRamBytes: Long,
    val quantization: QuantizationType,
    val downloadUrl: String,
    val sha256Checksum: String,
    val isRecommendedForDevice: Boolean = false
)

/**
 * Registry of tested and approved mobile-quantized models for TalentXcel.
 * Allows updating and introducing newer lightweight models without code refactoring.
 */
object ModelRegistry {

    val MODELS = listOf(
        ModelInfo(
            id = "gemini-nano-1b",
            name = "Google Gemini Nano (1B)",
            version = "1.0.0",
            description = "Default On-Device AI: Ultra-fast private career co-pilot, zero latency, 100% on-device private inference.",
            sizeBytes = 620L * 1024 * 1024, // 620 MB
            minRamBytes = 2L * 1024 * 1024 * 1024, // 2 GB RAM (runs smoothly on moto e7 power)
            quantization = QuantizationType.INT8,
            downloadUrl = "https://cdn.talentxcel.in/ai/models/gemini-nano-1b-int8.bin",
            sha256Checksum = "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0",
            isRecommendedForDevice = true
        ),
        ModelInfo(
            id = "gemini-nano-3b",
            name = "Google Gemini Nano (3B)",
            version = "1.5.0",
            description = "High-tier On-Device AI: Deep ATS resume parsing, complex architectural mock interviews, and strategic career guidance.",
            sizeBytes = 1600L * 1024 * 1024, // 1.6 GB
            minRamBytes = 6L * 1024 * 1024 * 1024, // 6 GB RAM
            quantization = QuantizationType.Q4_K_M,
            downloadUrl = "https://cdn.talentxcel.in/ai/models/gemini-nano-3b-q4.bin",
            sha256Checksum = "c5b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b999",
            isRecommendedForDevice = false
        )
    )

    fun getModelById(id: String): ModelInfo? = MODELS.find { it.id == id }
    val defaultModel: ModelInfo get() = MODELS.first() // Gemini Nano 1B is default!
}
