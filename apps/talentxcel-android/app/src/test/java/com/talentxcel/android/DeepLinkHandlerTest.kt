package com.talentxcel.android

import com.talentxcel.android.core.navigation.DeepLinkHandler
import com.talentxcel.android.core.navigation.NavigationTarget
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class DeepLinkHandlerTest {

    @Test
    fun `null uri resolves to NavigationTarget None`() {
        val target = DeepLinkHandler.parse(null)
        assertEquals(NavigationTarget.None, target)
    }

    @Test
    fun `empty url resolves to NavigationTarget None`() {
        val target = DeepLinkHandler.parseUrl("")
        assertEquals(NavigationTarget.None, target)
    }

    @Test
    fun `app link for jobs resolves to JobDetail target`() {
        val target = DeepLinkHandler.parseUrl("https://talentxcel.in/jobs/lead-android-arch")
        assertTrue(target is NavigationTarget.JobDetail)
        assertEquals("lead-android-arch", (target as NavigationTarget.JobDetail).jobId)
    }

    @Test
    fun `app link for applications resolves to Applications target`() {
        val target = DeepLinkHandler.parseUrl("https://talentxcel.in/applications")
        assertEquals(NavigationTarget.Applications, target)
    }

    @Test
    fun `app link for career resolves to Career target`() {
        val target = DeepLinkHandler.parseUrl("https://talentxcel.in/career")
        assertEquals(NavigationTarget.Career, target)
    }

    @Test
    fun `custom scheme talentxcel notifications resolves to Notifications target`() {
        val target = DeepLinkHandler.parseUrl("talentxcel://notifications")
        assertEquals(NavigationTarget.Notifications, target)
    }

    @Test
    fun `custom scheme talentxcel jobs with id resolves to JobDetail target`() {
        val target = DeepLinkHandler.parseUrl("talentxcel://jobs/job-101")
        assertTrue(target is NavigationTarget.JobDetail)
        assertEquals("job-101", (target as NavigationTarget.JobDetail).jobId)
    }

    @Test
    fun `app link for passport resolves to Passport target`() {
        val target = DeepLinkHandler.parseUrl("https://talentxcel.in/passport/arshidwani")
        assertTrue(target is NavigationTarget.Passport)
        assertEquals("arshidwani", (target as NavigationTarget.Passport).username)
    }

    @Test
    fun `app link for messages resolves to Conversations target`() {
        val target = DeepLinkHandler.parseUrl("https://talentxcel.in/messages")
        assertEquals(NavigationTarget.Conversations, target)
    }

    @Test
    fun `app link for career map resolves to CareerMap target`() {
        val target = DeepLinkHandler.parseUrl("https://talentxcel.in/career/map")
        assertEquals(NavigationTarget.CareerMap, target)
    }

    @Test
    fun `custom scheme talentxcel passport resolves to Passport target`() {
        val target = DeepLinkHandler.parseUrl("talentxcel://passport/arshidwani")
        assertTrue(target is NavigationTarget.Passport)
        assertEquals("arshidwani", (target as NavigationTarget.Passport).username)
    }

    @Test
    fun `custom scheme talentxcel career map resolves to CareerMap target`() {
        val target = DeepLinkHandler.parseUrl("talentxcel://career/map")
        assertEquals(NavigationTarget.CareerMap, target)
    }
}
