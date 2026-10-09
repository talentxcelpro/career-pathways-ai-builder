package com.talentxcel.android

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.navigation.compose.rememberNavController
import com.talentxcel.android.core.ai.AIOrchestrator
import com.talentxcel.android.core.ai.agent.PersonalAIAgent
import com.talentxcel.android.core.ai.memory.MemoryManager
import com.talentxcel.android.core.ai.model.ModelManager
import com.talentxcel.android.core.ai.router.AIRequestRouter
import com.talentxcel.android.core.ai.runtime.CloudAIProvider
import com.talentxcel.android.core.ai.runtime.HybridAIProvider
import com.talentxcel.android.core.ai.runtime.LocalAIProvider
import com.talentxcel.android.core.ai.tools.AIToolRegistry
import com.talentxcel.android.core.ai.tools.AgentPermissionManager
import com.talentxcel.android.core.auth.SupabaseAuthManager
import com.talentxcel.android.core.navigation.AppNavigation
import com.talentxcel.android.core.navigation.DeepLinkHandler
import com.talentxcel.android.core.navigation.NavigationTarget
import com.talentxcel.android.core.navigation.Screen
import android.content.Context
import com.talentxcel.android.core.auth.AuthEvent
import com.talentxcel.android.core.auth.AuthEventBus
import com.talentxcel.android.core.security.SecureStorage
import com.talentxcel.android.data.applications.ApplicationRepositoryImpl
import com.talentxcel.android.data.auth.AuthRepositoryImpl
import com.talentxcel.android.data.career.CareerRepositoryImpl
import com.talentxcel.android.data.jobs.JobRepositoryImpl
import com.talentxcel.android.data.messaging.MessagingRepositoryImpl
import com.talentxcel.android.data.network.NetworkRepositoryImpl
import com.talentxcel.android.data.notifications.NotificationRepositoryImpl
import com.talentxcel.android.data.posts.PostRepositoryImpl
import com.talentxcel.android.data.profile.ProfileRepositoryImpl
import com.talentxcel.android.presentation.career.CareerViewModel
import com.talentxcel.android.presentation.theme.TalentXcelTheme

class MainActivity : ComponentActivity() {

    private val currentIntentState = mutableStateOf<Intent?>(null)

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        // Notification permission handled
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.decorView.setBackgroundColor(android.graphics.Color.BLACK)
        currentIntentState.value = intent

        // Request runtime notification permission on Android 13+ (API 33+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }

        // Initialize Architecture Repositories
        val authManager = SupabaseAuthManager()
        val authRepository = AuthRepositoryImpl(authManager)
        val jobRepository = JobRepositoryImpl()
        val applicationRepository = ApplicationRepositoryImpl()
        val profileRepository = ProfileRepositoryImpl()
        val networkRepository = NetworkRepositoryImpl()
        val notificationRepository = NotificationRepositoryImpl()
        val careerRepository = CareerRepositoryImpl()
        val postRepository = PostRepositoryImpl(prefs = getSharedPreferences("talentxcel_prefs", Context.MODE_PRIVATE))
        val messagingRepository = MessagingRepositoryImpl()

        // Initialize On-Device AI Subsystem
        val modelManager = ModelManager(applicationContext)
        val localProvider = LocalAIProvider(modelManager)
        val cloudProvider = CloudAIProvider()
        val hybridProvider = HybridAIProvider(localProvider, cloudProvider)
        val router = AIRequestRouter()
        val orchestrator = AIOrchestrator(localProvider, cloudProvider, hybridProvider, router)
        val memoryManager = MemoryManager()
        val permissionManager = AgentPermissionManager()
        val toolRegistry = AIToolRegistry(permissionManager)

        val personalAgent = PersonalAIAgent(
            userId = SecureStorage.userId ?: "current_user",
            orchestrator = orchestrator,
            memoryManager = memoryManager,
            toolRegistry = toolRegistry
        )

        val careerViewModel = CareerViewModel(careerRepository, personalAgent)

        val startDest = if (SecureStorage.hasValidSession()) Screen.Home.route else Screen.Splash.route

        setContent {
            TalentXcelTheme {
                val navController = rememberNavController()

                // Reactive deep link & App Links navigation handler
                LaunchedEffect(currentIntentState.value) {
                    currentIntentState.value?.data?.let { uri ->
                        when (val target = DeepLinkHandler.parse(uri)) {
                            is NavigationTarget.JobDetail -> {
                                navController.navigate(Screen.JobDetail.createRoute(target.jobId))
                            }
                            is NavigationTarget.Applications -> {
                                navController.navigate(Screen.Applications.route)
                            }
                            is NavigationTarget.Network -> {
                                navController.navigate(Screen.Network.route)
                            }
                            is NavigationTarget.Notifications -> {
                                navController.navigate(Screen.Notifications.route)
                            }
                            is NavigationTarget.Career -> {
                                navController.navigate(Screen.Career.route)
                            }
                            is NavigationTarget.Passport -> {
                                navController.navigate(Screen.Passport.route)
                            }
                            is NavigationTarget.Conversations -> {
                                navController.navigate(Screen.Conversations.route)
                            }
                            is NavigationTarget.CareerMap -> {
                                navController.navigate(Screen.CareerMap.route)
                            }
                            is NavigationTarget.Reels -> {
                                navController.navigate(Screen.Reels.route)
                            }
                            is NavigationTarget.Rewards -> {
                                navController.navigate(Screen.Rewards.route)
                            }
                            is NavigationTarget.Refer -> {
                                navController.navigate(Screen.Refer.route)
                            }
                            is NavigationTarget.Profile -> {
                                navController.navigate(Screen.Profile.route)
                            }
                            else -> {}
                        }
                    }
                }

                // R-2: Observe authentication lifecycle events (session expiry, sign out)
                LaunchedEffect(Unit) {
                    AuthEventBus.authEvents.collect { event ->
                        when (event) {
                            is AuthEvent.AuthExpired, is AuthEvent.SignedOut -> {
                                SecureStorage.clearSession()
                                navController.navigate(Screen.Splash.route) {
                                    popUpTo(0) { inclusive = true }
                                }
                            }
                        }
                    }
                }

                AppNavigation(
                    navController = navController,
                    authRepository = authRepository,
                    jobRepository = jobRepository,
                    applicationRepository = applicationRepository,
                    profileRepository = profileRepository,
                    networkRepository = networkRepository,
                    notificationRepository = notificationRepository,
                    careerRepository = careerRepository,
                    postRepository = postRepository,
                    messagingRepository = messagingRepository,
                    careerViewModel = careerViewModel,
                    memoryManager = memoryManager,
                    modelManager = modelManager,
                    startDestination = startDest
                )
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        currentIntentState.value = intent
    }
}
