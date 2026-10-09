package com.talentxcel.android.core.navigation

import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CardGiftcard
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Work
import androidx.compose.material3.Divider
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import com.talentxcel.android.presentation.theme.BorderSubtle
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.navArgument
import com.talentxcel.android.core.ai.memory.MemoryManager
import com.talentxcel.android.core.ai.model.ModelManager
import com.talentxcel.android.core.ai.runtime.CloudAIProvider
import com.talentxcel.android.core.ai.runtime.LocalAIProvider
import com.talentxcel.android.data.passport.PassportRepositoryImpl
import com.talentxcel.android.data.resume.ResumeRepositoryImpl
import com.talentxcel.android.domain.repositories.ApplicationRepository
import com.talentxcel.android.domain.repositories.AuthRepository
import com.talentxcel.android.domain.repositories.CareerRepository
import com.talentxcel.android.domain.repositories.JobRepository
import com.talentxcel.android.domain.repositories.MessagingRepository
import com.talentxcel.android.domain.repositories.NetworkRepository
import com.talentxcel.android.domain.repositories.NotificationRepository
import com.talentxcel.android.domain.repositories.PassportRepository
import com.talentxcel.android.domain.repositories.PostRepository
import com.talentxcel.android.domain.repositories.ProfileRepository
import com.talentxcel.android.domain.repositories.ResumeRepository
import com.talentxcel.android.presentation.applications.ApplicationsScreen
import com.talentxcel.android.presentation.applications.ApplicationsViewModel
import com.talentxcel.android.presentation.auth.ForgotPasswordScreen
import com.talentxcel.android.presentation.auth.LoginScreen
import com.talentxcel.android.presentation.auth.LoginViewModel
import com.talentxcel.android.presentation.auth.RegisterScreen
import com.talentxcel.android.presentation.auth.SplashScreen
import com.talentxcel.android.presentation.career.CareerMapScreen
import com.talentxcel.android.presentation.career.CareerMapViewModel
import com.talentxcel.android.presentation.career.CareerScreen
import com.talentxcel.android.presentation.career.CareerViewModel
import com.talentxcel.android.presentation.home.HomeScreen
import com.talentxcel.android.presentation.home.HomeViewModel
import com.talentxcel.android.presentation.jobs.JobDetailScreen
import com.talentxcel.android.presentation.jobs.JobsScreen
import com.talentxcel.android.presentation.jobs.JobsViewModel
import com.talentxcel.android.presentation.messaging.ConversationsScreen
import com.talentxcel.android.presentation.messaging.ConversationsViewModel
import com.talentxcel.android.presentation.messaging.DirectMessageScreen
import com.talentxcel.android.presentation.messaging.DirectMessageViewModel
import com.talentxcel.android.presentation.network.NetworkScreen
import com.talentxcel.android.presentation.network.NetworkViewModel
import com.talentxcel.android.presentation.notifications.NotificationsScreen
import com.talentxcel.android.presentation.notifications.NotificationsViewModel
import com.talentxcel.android.presentation.passport.PassportScreen
import com.talentxcel.android.presentation.passport.PassportViewModel
import com.talentxcel.android.presentation.passport.ScanPassportScreen
import com.talentxcel.android.presentation.post.CreatePostScreen
import com.talentxcel.android.presentation.post.CreatePostViewModel
import com.talentxcel.android.presentation.profile.EditProfileScreen
import com.talentxcel.android.presentation.profile.ProfileScreen
import com.talentxcel.android.presentation.profile.ProfileViewModel
import com.talentxcel.android.presentation.reels.ReelsScreen
import com.talentxcel.android.presentation.reels.ReelsViewModel
import com.talentxcel.android.presentation.refer.ReferScreen
import com.talentxcel.android.presentation.refer.ReferViewModel
import com.talentxcel.android.presentation.resume.AtsScannerScreen
import com.talentxcel.android.presentation.resume.ResumeHubScreen
import com.talentxcel.android.presentation.resume.ResumeViewModel
import com.talentxcel.android.presentation.rewards.RewardsScreen
import com.talentxcel.android.presentation.rewards.RewardsViewModel
import com.talentxcel.android.presentation.settings.AIPrivacySettingsScreen
import com.talentxcel.android.presentation.settings.SettingsScreen
import com.talentxcel.android.presentation.theme.BrandBlue50
import com.talentxcel.android.presentation.theme.BrandBluePrimary
import com.talentxcel.android.presentation.theme.SurfaceWhite
import com.talentxcel.android.presentation.theme.TextMuted

sealed class BottomNavItem(val screen: Screen, val label: String, val icon: ImageVector) {
    object Network : BottomNavItem(Screen.Home, "Network", Icons.Default.People)
    object Reels : BottomNavItem(Screen.Reels, "Reels", Icons.Default.PlayArrow)
    object Jobs : BottomNavItem(Screen.Jobs, "Jobs", Icons.Default.Work)
    object Rewards : BottomNavItem(Screen.Rewards, "Rewards", Icons.Default.CardGiftcard)
    object Refer : BottomNavItem(Screen.Refer, "Refer", Icons.Default.Share)
}

val BottomNavItems = listOf(
    BottomNavItem.Network,
    BottomNavItem.Reels,
    BottomNavItem.Jobs,
    BottomNavItem.Rewards,
    BottomNavItem.Refer
)

@Composable
fun AppNavigation(
    navController: NavHostController,
    authRepository: AuthRepository,
    jobRepository: JobRepository,
    applicationRepository: ApplicationRepository,
    profileRepository: ProfileRepository,
    networkRepository: NetworkRepository,
    notificationRepository: NotificationRepository,
    careerRepository: CareerRepository,
    postRepository: PostRepository,
    messagingRepository: MessagingRepository,
    careerViewModel: CareerViewModel,
    memoryManager: MemoryManager,
    modelManager: ModelManager,
    startDestination: String
) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val passportRepository: PassportRepository = remember { PassportRepositoryImpl() }
    val passportViewModel: PassportViewModel = remember { PassportViewModel(passportRepository) }

    val resumeRepository: ResumeRepository = remember {
        ResumeRepositoryImpl(
            modelManager = modelManager,
            localAIProvider = LocalAIProvider(modelManager),
            cloudAIProvider = CloudAIProvider()
        )
    }
    val resumeViewModel: ResumeViewModel = remember { ResumeViewModel(resumeRepository) }

    val reelsViewModel: ReelsViewModel = remember { ReelsViewModel() }
    val rewardsViewModel: RewardsViewModel = remember { RewardsViewModel() }
    val referViewModel: ReferViewModel = remember { ReferViewModel() }
    val homeViewModel: HomeViewModel = remember {
        HomeViewModel(profileRepository, jobRepository, applicationRepository, postRepository)
    }
    val jobsViewModel: JobsViewModel = remember {
        JobsViewModel(jobRepository)
    }

    val showBottomBar = BottomNavItems.any { it.screen.route == currentRoute }

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                Column {
                    Divider(color = BorderSubtle, thickness = 0.5.dp)
                    NavigationBar(
                        containerColor = SurfaceWhite,
                        tonalElevation = 0.dp
                    ) {
                        BottomNavItems.forEach { item ->
                            val isSelected = currentRoute == item.screen.route
                            NavigationBarItem(
                                icon = { Icon(imageVector = item.icon, contentDescription = item.label) },
                                label = {
                                    Text(
                                        text = item.label,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                        fontSize = 11.sp
                                    )
                                },
                                selected = isSelected,
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = BrandBluePrimary,
                                    selectedTextColor = BrandBluePrimary,
                                    indicatorColor = BrandBlue50,
                                    unselectedIconColor = TextMuted,
                                    unselectedTextColor = TextMuted
                                ),
                                onClick = {
                                    if (currentRoute != item.screen.route) {
                                        navController.navigate(item.screen.route) {
                                            popUpTo(navController.graph.findStartDestination().id) {
                                                saveState = true
                                            }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    }
                                }
                            )
                        }
                    }
                }
            }
        },
        floatingActionButton = {
            if (showBottomBar && currentRoute != Screen.Career.route && currentRoute != Screen.Reels.route) {
                FloatingActionButton(
                    onClick = { navController.navigate(Screen.Career.route) },
                    containerColor = BrandBluePrimary,
                    contentColor = Color.White,
                    shape = CircleShape
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.AutoAwesome,
                            contentDescription = "SI Co-Pilot",
                            tint = Color.White,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "SI Co-Pilot",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                }
            }
        }
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = startDestination,
            modifier = Modifier.padding(paddingValues),
            enterTransition = { fadeIn(tween(220)) },
            exitTransition = { fadeOut(tween(180)) },
            popEnterTransition = { fadeIn(tween(220)) },
            popExitTransition = { fadeOut(tween(180)) }
        ) {
            // Auth Routes
            composable(Screen.Splash.route) {
                SplashScreen(
                    onGetStarted = {
                        navController.navigate(Screen.Login.route) {
                            popUpTo(Screen.Splash.route) { inclusive = true }
                        }
                    }
                )
            }

            composable(Screen.Login.route) {
                val loginVm = LoginViewModel(authRepository)
                LoginScreen(
                    viewModel = loginVm,
                    onLoginSuccess = {
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.Login.route) { inclusive = true }
                        }
                    },
                    onNavigateToRegister = { navController.navigate(Screen.Register.route) },
                    onNavigateToForgotPassword = { navController.navigate(Screen.ForgotPassword.route) },
                    onSkip = {
                        loginVm.loginGuest()
                    }
                )
            }

            composable(Screen.Register.route) {
                RegisterScreen(
                    authRepository = authRepository,
                    onNavigateBackToLogin = { navController.popBackStack() }
                )
            }

            composable(Screen.ForgotPassword.route) {
                ForgotPasswordScreen(
                    authRepository = authRepository,
                    onNavigateBackToLogin = { navController.popBackStack() }
                )
            }

            // Main App Routes
            composable(Screen.Home.route) {
                LaunchedEffect(Unit) {
                    homeViewModel.loadDashboard("current_user")
                }
                HomeScreen(
                    viewModel = homeViewModel,
                    onNavigateToJobDetail = { jobId -> navController.navigate(Screen.JobDetail.createRoute(jobId)) },
                    onNavigateToApplications = { navController.navigate(Screen.Applications.route) },
                    onNavigateToNotifications = { navController.navigate(Screen.Notifications.route) },
                    onNavigateToCareerAgent = { navController.navigate(Screen.Career.route) },
                    onNavigateToProfile = { navController.navigate(Screen.Profile.route) },
                    onNavigateToCreatePost = { navController.navigate(Screen.CreatePost.route) },
                    onNavigateToConversations = { navController.navigate(Screen.Conversations.route) },
                    onNavigateToRoute = { route -> navController.navigate(route) }
                )
            }

            composable(Screen.Reels.route) {
                ReelsScreen(
                    viewModel = reelsViewModel,
                    onNavigateToGemini = { prompt ->
                        careerViewModel.sendAgentPrompt(prompt)
                        navController.navigate(Screen.Career.route)
                    }
                )
            }

            composable(Screen.Jobs.route) {
                JobsScreen(
                    viewModel = jobsViewModel,
                    onNavigateToJobDetail = { jobId -> navController.navigate(Screen.JobDetail.createRoute(jobId)) }
                )
            }

            composable(Screen.Rewards.route) {
                RewardsScreen(
                    viewModel = rewardsViewModel,
                    onNavigateToRefer = { navController.navigate(Screen.Refer.route) }
                )
            }

            composable(Screen.Refer.route) {
                ReferScreen(
                    viewModel = referViewModel
                )
            }

            composable(
                route = Screen.JobDetail.route,
                arguments = listOf(navArgument("jobId") { type = NavType.StringType })
            ) { backStackEntry ->
                val jobId = backStackEntry.arguments?.getString("jobId") ?: ""
                JobDetailScreen(
                    jobId = jobId,
                    jobRepository = jobRepository,
                    applicationRepository = applicationRepository,
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Screen.Applications.route) {
                val appsVm = ApplicationsViewModel(applicationRepository)
                ApplicationsScreen(
                    viewModel = appsVm,
                    onNavigateToJobs = { navController.navigate(Screen.Jobs.route) }
                )
            }

            composable(Screen.Network.route) {
                val networkVm = NetworkViewModel(networkRepository)
                NetworkScreen(viewModel = networkVm)
            }

            composable(Screen.Career.route) {
                CareerScreen(
                    viewModel = careerViewModel,
                    onNavigateToSettings = { navController.navigate(Screen.AIPrivacySettings.route) },
                    onNavigateToResumeHub = { navController.navigate(Screen.ResumeHub.route) },
                    onNavigateToCareerMap = { navController.navigate(Screen.CareerMap.route) }
                )
            }

            composable(Screen.Profile.route) {
                val profileVm = ProfileViewModel(profileRepository)
                profileVm.loadProfile("current_user")
                ProfileScreen(
                    viewModel = profileVm,
                    onNavigateToEditProfile = { navController.navigate(Screen.EditProfile.route) },
                    onNavigateToSettings = { navController.navigate(Screen.Settings.route) },
                    onNavigateToPassport = { navController.navigate(Screen.Passport.route) },
                    onSignOut = {
                        navController.navigate(Screen.Login.route) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                )
            }

            composable(Screen.EditProfile.route) {
                val profileVm = ProfileViewModel(profileRepository)
                profileVm.loadProfile("current_user")
                EditProfileScreen(
                    viewModel = profileVm,
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Screen.Notifications.route) {
                val notifVm = NotificationsViewModel(notificationRepository)
                NotificationsScreen(
                    viewModel = notifVm,
                    onNavigateBack = { navController.popBackStack() },
                    onNotificationClick = { link ->
                        if (link.startsWith("/jobs/")) {
                            val id = link.removePrefix("/jobs/")
                            navController.navigate(Screen.JobDetail.createRoute(id))
                        } else if (link == "/applications") {
                            navController.navigate(Screen.Applications.route)
                        } else if (link == "/network") {
                            navController.navigate(Screen.Home.route)
                        } else if (link == "/reels") {
                            navController.navigate(Screen.Reels.route)
                        } else if (link == "/rewards") {
                            navController.navigate(Screen.Rewards.route)
                        } else if (link == "/refer") {
                            navController.navigate(Screen.Refer.route)
                        }
                    }
                )
            }

            composable(Screen.Settings.route) {
                SettingsScreen(
                    onNavigateBack = { navController.popBackStack() },
                    onNavigateToAIPrivacy = { navController.navigate(Screen.AIPrivacySettings.route) }
                )
            }

            composable(Screen.AIPrivacySettings.route) {
                AIPrivacySettingsScreen(
                    memoryManager = memoryManager,
                    modelManager = modelManager,
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            // Phase 1A: Career Passport
            composable(Screen.Passport.route) {
                PassportScreen(
                    viewModel = passportViewModel,
                    onNavigateBack = { navController.popBackStack() },
                    onNavigateToScan = { navController.navigate(Screen.ScanPassport.route) }
                )
            }

            composable(Screen.ScanPassport.route) {
                ScanPassportScreen(
                    viewModel = passportViewModel,
                    onNavigateBack = { navController.popBackStack() },
                    onPassportFound = { navController.popBackStack() }
                )
            }

            // Phase 1B: Resume & ATS Suite
            composable(Screen.ResumeHub.route) {
                ResumeHubScreen(
                    viewModel = resumeViewModel,
                    onNavigateBack = { navController.popBackStack() },
                    onNavigateToAtsScan = { resumeId ->
                        navController.navigate(Screen.AtsScanner.createRoute(resumeId))
                    }
                )
            }

            composable(
                route = Screen.AtsScanner.route,
                arguments = listOf(navArgument("resumeId") { type = NavType.StringType })
            ) {
                AtsScannerScreen(
                    viewModel = resumeViewModel,
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            // Phase 2A: Career Pathways Map
            composable(Screen.CareerMap.route) {
                val careerMapVm = remember { CareerMapViewModel(careerRepository) }
                CareerMapScreen(
                    viewModel = careerMapVm,
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            // Phase 2B: Direct 1:1 Messaging & Conversations
            composable(Screen.Conversations.route) {
                val conversationsVm = remember { ConversationsViewModel(messagingRepository) }
                ConversationsScreen(
                    viewModel = conversationsVm,
                    onNavigateBack = { navController.popBackStack() },
                    onNavigateToChat = { convId, name, userId ->
                        navController.navigate(Screen.DirectMessage.createRoute(convId, name, userId))
                    }
                )
            }

            composable(
                route = Screen.DirectMessage.route,
                arguments = listOf(
                    navArgument("conversationId") { type = NavType.StringType },
                    navArgument("recipientName") { type = NavType.StringType; defaultValue = "Colleague" },
                    navArgument("recipientId") { type = NavType.StringType; defaultValue = "" }
                )
            ) { backStackEntry ->
                val convId = backStackEntry.arguments?.getString("conversationId") ?: ""
                val recName = backStackEntry.arguments?.getString("recipientName") ?: "Colleague"
                val recId = backStackEntry.arguments?.getString("recipientId") ?: ""
                val chatVm = remember { DirectMessageViewModel(messagingRepository) }
                DirectMessageScreen(
                    conversationId = convId,
                    recipientName = recName,
                    recipientId = recId,
                    viewModel = chatVm,
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            // Phase 2C: Native Post Composer
            composable(Screen.CreatePost.route) {
                val createPostVm = remember { CreatePostViewModel(postRepository) }
                CreatePostScreen(
                    viewModel = createPostVm,
                    onNavigateBack = { navController.popBackStack() },
                    onPostPublished = { navController.popBackStack() }
                )
            }
        }
    }
}
