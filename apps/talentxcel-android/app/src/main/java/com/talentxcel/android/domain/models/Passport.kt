package com.talentxcel.android.domain.models

data class Passport(
    val id: String,
    val userId: String,
    val username: String,
    val fullName: String,
    val title: String,
    val location: String,
    val avatarUrl: String? = null,
    val verificationTier: String = "Cryptographic Level 3 (Verified Professional)",
    val isVerified: Boolean = true,
    val issuer: String = "TalentXcel Trust Authority",
    val issuanceDate: String = "2026-03-15",
    val securityHash: String = "txc-sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    val publicPassportUrl: String = "https://talentxcel.in/passport/$username",
    val verifiedSkills: List<PassportSkill> = emptyList(),
    val credentials: List<PassportCredential> = emptyList(),
    val connectionCount: Int = 124,
    val endorsementCount: Int = 42
)

data class PassportSkill(
    val name: String,
    val category: String,
    val level: String, // Expert, Advanced, Intermediate
    val verifiedDate: String,
    val verifiedBy: String
)

data class PassportCredential(
    val id: String,
    val title: String,
    val issuer: String,
    val issueDate: String,
    val credentialId: String,
    val verificationUrl: String
)
