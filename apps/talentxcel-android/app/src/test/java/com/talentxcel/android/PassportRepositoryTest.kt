package com.talentxcel.android

import com.talentxcel.android.data.passport.PassportRepositoryImpl
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class PassportRepositoryTest {

    private lateinit var repository: PassportRepositoryImpl

    @Before
    fun setUp() {
        repository = PassportRepositoryImpl()
    }

    @Test
    fun `getMyPassport returns verified cryptographic career passport`() = runBlocking {
        val result = repository.getMyPassport().first()
        assertTrue(result.isSuccess)

        val passport = result.getOrNull()
        assertNotNull(passport)
        assertTrue(passport!!.isVerified)
        assertTrue(passport.securityHash.startsWith("txc-sha256:"))
        assertTrue(passport.publicPassportUrl.contains("/passport/"))
        assertTrue(passport.verifiedSkills.isNotEmpty())
    }

    @Test
    fun `getPassportByUsername returns colleague verified passport`() = runBlocking {
        val result = repository.getPassportByUsername("sarah.chen")
        assertTrue(result.isSuccess)

        val colleague = result.getOrNull()
        assertNotNull(colleague)
        assertEquals("sarah.chen", colleague!!.username)
        assertTrue(colleague.isVerified)
    }

    @Test
    fun `verifyPassportHash validates authentic TalentXcel SHA-256 signatures`() = runBlocking {
        val validHash = "txc-sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
        val invalidHash = "invalid_hash_string"

        val validResult = repository.verifyPassportHash(validHash)
        val invalidResult = repository.verifyPassportHash(invalidHash)

        assertTrue(validResult.getOrNull() == true)
        assertTrue(invalidResult.getOrNull() == false)
    }
}
