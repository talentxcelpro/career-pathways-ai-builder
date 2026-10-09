package com.talentxcel.android.presentation.home

import android.content.Intent
import android.net.Uri
import android.widget.VideoView
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Apps
import androidx.compose.material.icons.filled.Article
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.CardGiftcard
import androidx.compose.material.icons.filled.ChatBubbleOutline
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.ThumbUp
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material.icons.filled.Videocam
import androidx.compose.material.icons.filled.Work
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Divider
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.talentxcel.android.domain.models.Post
import com.talentxcel.android.presentation.components.LoadingState
import com.talentxcel.android.presentation.components.ModulesLauncherBottomSheet
import com.talentxcel.android.presentation.components.TalentXcelHeaderLogo
import com.talentxcel.android.presentation.theme.AccentEmerald
import com.talentxcel.android.presentation.theme.AccentRose
import com.talentxcel.android.presentation.theme.BgLight
import com.talentxcel.android.presentation.theme.BorderSubtle
import com.talentxcel.android.presentation.theme.BrandBlue50
import com.talentxcel.android.presentation.theme.BrandBluePrimary
import com.talentxcel.android.presentation.theme.SurfaceWhite
import com.talentxcel.android.presentation.theme.TextMuted
import com.talentxcel.android.presentation.theme.TextPrimary
import com.talentxcel.android.presentation.theme.TextSecondary

data class FeedChipItem(
    val title: String,
    val icon: ImageVector,
    val badge: String? = null,
    val isPrimary: Boolean = false
)

data class SuggestedUser(
    val id: String,
    val name: String,
    val role: String,
    val initial: String,
    val avatarBg: Color
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    onNavigateToJobDetail: (String) -> Unit,
    onNavigateToApplications: () -> Unit,
    onNavigateToNotifications: () -> Unit,
    onNavigateToCareerAgent: () -> Unit,
    onNavigateToProfile: () -> Unit,
    onNavigateToCreatePost: () -> Unit = {},
    onNavigateToConversations: () -> Unit = {},
    onNavigateToRoute: (String) -> Unit = {}
) {
    val state by viewModel.uiState.collectAsState()
    var selectedFeedTab by remember { mutableStateOf("Feed") }
    var showModulesLauncher by remember { mutableStateOf(false) }
    var showSuggestedConnections by remember { mutableStateOf(false) }
    val sheetState = rememberModalBottomSheetState()
    val context = LocalContext.current

    val suggestedUsers = remember {
        listOf(
            SuggestedUser("1", "Priya Sharma", "Product Manager", "P", Color(0xFF6366F1)),
            SuggestedUser("2", "David Lee", "Tech Recruiter", "D", Color(0xFF0D9488)),
            SuggestedUser("3", "Aisha Khan", "Software Engineer", "A", Color(0xFFE11D48)),
            SuggestedUser("4", "Vikram Sen", "AI Architect", "V", Color(0xFF2563EB))
        )
    }

    if (state.isLoading && state.posts.isEmpty()) {
        LoadingState(message = "Loading your TalentXcel feed...")
        return
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BgLight)
            .statusBarsPadding()
    ) {
        // 1. Premium Top Header Bar
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(SurfaceWhite)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // LEFT: Brand Logo
                TalentXcelHeaderLogo(markSize = 30.dp, fontSize = 19)

                // RIGHT: Action Icons row
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    // Messages with numbered badge
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(BgLight)
                            .clickable { onNavigateToConversations() },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.ChatBubbleOutline,
                            contentDescription = "Messages",
                            tint = TextSecondary,
                            modifier = Modifier.size(19.dp)
                        )
                        if (state.unreadMessagesCount > 0) {
                            Box(
                                modifier = Modifier
                                    .align(Alignment.TopEnd)
                                    .size(16.dp)
                                    .clip(CircleShape)
                                    .background(BrandBluePrimary),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = if (state.unreadMessagesCount > 9) "9+" else "${state.unreadMessagesCount}",
                                    fontSize = 8.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            }
                        }
                    }

                    // Notifications with live red dot
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(BgLight)
                            .clickable { onNavigateToNotifications() },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Notifications,
                            contentDescription = "Notifications",
                            tint = TextSecondary,
                            modifier = Modifier.size(20.dp)
                        )
                        Box(
                            modifier = Modifier
                                .align(Alignment.TopEnd)
                                .size(10.dp)
                                .clip(CircleShape)
                                .background(SurfaceWhite)
                                .padding(1.5.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .clip(CircleShape)
                                    .background(AccentRose)
                            )
                        }
                    }

                    // Grid Apps Launcher
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(BgLight)
                            .clickable { showModulesLauncher = true },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Apps,
                            contentDescription = "Ecosystem",
                            tint = TextSecondary,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    // Avatar with gradient ring border
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(
                                Brush.linearGradient(
                                    colors = listOf(Color(0xFF6366F1), Color(0xFF2563EB), Color(0xFF06B6D4))
                                )
                            )
                            .clickable { onNavigateToProfile() }
                            .padding(2.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .clip(CircleShape)
                                .background(BrandBluePrimary),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = (state.profile?.fullName?.firstOrNull() ?: 'A').toString(),
                                color = Color.White,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }

            // Search bar pill beneath main header row
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp)
                    .padding(bottom = 10.dp)
                    .clip(RoundedCornerShape(24.dp))
                    .background(BgLight)
                    .clickable { }
                    .padding(horizontal = 16.dp, vertical = 9.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = null,
                        tint = TextMuted,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Search people, jobs, companies...",
                        fontSize = 13.sp,
                        color = TextMuted,
                        fontWeight = FontWeight.Normal
                    )
                }
            }
        }

        Divider(color = BorderSubtle, thickness = 0.5.dp)

        val feedChips = remember {
            listOf(
                FeedChipItem("Feed", Icons.Default.Article),
                FeedChipItem("Smart Feed", Icons.Default.AutoAwesome, badge = "SI"),
                FeedChipItem("SI Connect", Icons.Default.AutoAwesome, isPrimary = true),
                FeedChipItem("Gamification", Icons.Default.CardGiftcard, badge = "XP"),
                FeedChipItem("Refer & Earn", Icons.Default.Share, badge = "+300c"),
                FeedChipItem("Connections", Icons.Default.People),
                FeedChipItem("Discover", Icons.Default.Explore),
                FeedChipItem("Analytics", Icons.Default.TrendingUp),
                FeedChipItem("Explore", Icons.Default.Apps)
            )
        }

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(BgLight),
            contentPadding = PaddingValues(bottom = 96.dp)
        ) {
            // 2. Feed Sub-Navigation Filter Chips (Native Mobile Capsule Style)
            item {
                LazyRow(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(SurfaceWhite)
                        .padding(vertical = 10.dp),
                    contentPadding = PaddingValues(horizontal = 14.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(feedChips) { chip ->
                        val isSelected = chip.title == selectedFeedTab
                        Surface(
                            shape = RoundedCornerShape(20.dp),
                            color = when {
                                isSelected -> BrandBluePrimary
                                chip.isPrimary -> Color(0xFFEFF6FF)
                                else -> BgLight
                            },
                            border = when {
                                isSelected -> null
                                chip.isPrimary -> BorderStroke(1.dp, BrandBluePrimary.copy(alpha = 0.5f))
                                else -> BorderStroke(0.8.dp, BorderSubtle)
                            },
                            modifier = Modifier
                                .height(35.dp)
                                .clickable {
                                    when (chip.title) {
                                        "Gamification" -> onNavigateToRoute("rewards")
                                        "Refer & Earn" -> onNavigateToRoute("refer")
                                        "Connections" -> onNavigateToRoute("network")
                                        "Analytics" -> onNavigateToRoute("career")
                                        "SI Connect" -> onNavigateToCareerAgent()
                                        "Explore" -> showModulesLauncher = true
                                        else -> selectedFeedTab = chip.title
                                    }
                                }
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.Center,
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                            ) {
                                Icon(
                                    imageVector = chip.icon,
                                    contentDescription = chip.title,
                                    tint = when {
                                        isSelected -> Color.White
                                        chip.isPrimary -> BrandBluePrimary
                                        else -> TextSecondary
                                    },
                                    modifier = Modifier.size(15.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = chip.title,
                                    fontSize = 12.sp,
                                    fontWeight = if (isSelected || chip.isPrimary) FontWeight.Bold else FontWeight.SemiBold,
                                    color = when {
                                        isSelected -> Color.White
                                        chip.isPrimary -> BrandBluePrimary
                                        else -> TextPrimary
                                    }
                                )
                                if (chip.badge != null) {
                                    Spacer(modifier = Modifier.width(5.dp))
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(6.dp))
                                            .background(
                                                if (isSelected) Color.White.copy(alpha = 0.25f)
                                                else BrandBluePrimary.copy(alpha = 0.12f)
                                            )
                                            .padding(horizontal = 5.dp, vertical = 1.dp)
                                    ) {
                                        Text(
                                            text = chip.badge,
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (isSelected) Color.White else BrandBluePrimary
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
                Divider(color = BorderSubtle, thickness = 0.5.dp)
            }

            // 3. Post Composer Card (LinkedIn / Modern Mobile App Style)
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 14.dp, vertical = 8.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                    border = BorderStroke(0.8.dp, BorderSubtle),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { onNavigateToCreatePost() }
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(38.dp)
                                    .clip(CircleShape)
                                    .background(
                                        Brush.linearGradient(
                                            colors = listOf(Color(0xFF6366F1), Color(0xFF2563EB))
                                        )
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = (state.profile?.fullName?.firstOrNull() ?: 'A').toString(),
                                    color = Color.White,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                            Spacer(modifier = Modifier.width(10.dp))
                            Surface(
                                shape = RoundedCornerShape(24.dp),
                                color = BgLight,
                                border = BorderStroke(0.8.dp, BorderSubtle),
                                modifier = Modifier.weight(1f)
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp)
                                ) {
                                    Text(
                                        text = "Share an update, job tip, or insight...",
                                        fontSize = 13.sp,
                                        color = TextMuted,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))
                        Divider(color = BorderSubtle, thickness = 0.5.dp)
                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            PostActionItem(icon = Icons.Default.Image, label = "Photo", tint = Color(0xFF3B82F6), onClick = onNavigateToCreatePost)
                            PostActionItem(icon = Icons.Default.Videocam, label = "Video", tint = Color(0xFF10B981), onClick = onNavigateToCreatePost)
                            PostActionItem(icon = Icons.Default.Work, label = "Job Alert", tint = Color(0xFFF59E0B), onClick = onNavigateToCreatePost)
                            PostActionItem(icon = Icons.Default.LocationOn, label = "Location", tint = Color(0xFFEC4899), onClick = onNavigateToCreatePost)
                        }
                    }
                }
            }

            // 3.5 SI Career Intelligence Banner (Top Prominence, World-Class Clean UI)
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 14.dp, vertical = 6.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
                    border = BorderStroke(
                        1.dp,
                        Brush.horizontalGradient(
                            listOf(Color(0xFF3B82F6).copy(alpha = 0.5f), Color(0xFF6366F1).copy(alpha = 0.3f))
                        )
                    ),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(
                                Brush.linearGradient(
                                    colors = listOf(
                                        Color(0xFF1E3A8A), // Deep blue
                                        Color(0xFF0F172A)  // Slate 900
                                    )
                                )
                            )
                            .padding(16.dp)
                    ) {
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(Color(0xFF3B82F6).copy(alpha = 0.2f))
                                        .padding(horizontal = 8.dp, vertical = 3.dp)
                                ) {
                                    Text(
                                        text = "✦ TalentXcel SI Insight",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFF60A5FA)
                                    )
                                }
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Today",
                                    fontSize = 10.sp,
                                    color = Color.White.copy(alpha = 0.5f)
                                )
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "AI roles in India grew 78% YoY. Your profile has 3 skills matching top 2026 AI hiring patterns.",
                                fontSize = 13.sp,
                                lineHeight = 18.sp,
                                color = Color.White,
                                fontWeight = FontWeight.Medium
                            )
                            Spacer(modifier = Modifier.height(10.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "94% match with 4 open roles →",
                                    fontSize = 12.sp,
                                    color = Color(0xFF60A5FA),
                                    fontWeight = FontWeight.SemiBold,
                                    modifier = Modifier.clickable { onNavigateToCareerAgent() }
                                )
                                Box(
                                    modifier = Modifier
                                        .clip(CircleShape)
                                        .background(BrandBluePrimary.copy(alpha = 0.3f))
                                        .padding(6.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.PlayArrow,
                                        contentDescription = "Explore",
                                        tint = Color.White,
                                        modifier = Modifier.size(14.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // 4. Feed Posts & Compact In-Feed Peer Suggestions
            item {
                Spacer(modifier = Modifier.height(4.dp))
            }

            items(state.posts.take(1), key = { it.id }) { post ->
                PostCard(
                    post = post,
                    onLikeClick = { viewModel.toggleLike(post.id) },
                    onShareClick = {
                        val sendIntent = Intent(Intent.ACTION_SEND).apply {
                            type = "text/plain"
                            putExtra(
                                Intent.EXTRA_TEXT,
                                "${post.authorName} on TalentXcel:\n\n${post.content}\n\nhttps://talentxcel.in/network"
                            )
                        }
                        context.startActivity(Intent.createChooser(sendIntent, "Share Post"))
                    }
                )
                Spacer(modifier = Modifier.height(8.dp))
            }

            // Ultra-Compact In-Feed Suggested Connections (Zero vertical bloat, dismissable)
            if (showSuggestedConnections) {
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 14.dp, vertical = 4.dp),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                        border = BorderStroke(0.8.dp, BorderSubtle),
                        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "People you may know",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextPrimary
                                )
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = "See all",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = BrandBluePrimary,
                                        modifier = Modifier.clickable { onNavigateToRoute("network") }
                                    )
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Icon(
                                        imageVector = Icons.Default.Close,
                                        contentDescription = "Dismiss",
                                        tint = TextMuted,
                                        modifier = Modifier
                                            .size(16.dp)
                                            .clickable { showSuggestedConnections = false }
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            LazyRow(
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                items(suggestedUsers) { user ->
                                    CompactSuggestedUserChip(user = user)
                                }
                            }
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                }
            }

            // Remaining Live Posts
            items(state.posts.drop(1), key = { it.id }) { post ->
                PostCard(
                    post = post,
                    onLikeClick = { viewModel.toggleLike(post.id) },
                    onShareClick = {
                        val sendIntent = Intent(Intent.ACTION_SEND).apply {
                            type = "text/plain"
                            putExtra(
                                Intent.EXTRA_TEXT,
                                "${post.authorName} on TalentXcel:\n\n${post.content}\n\nhttps://talentxcel.in/network"
                            )
                        }
                        context.startActivity(Intent.createChooser(sendIntent, "Share Post"))
                    }
                )
                Spacer(modifier = Modifier.height(10.dp))
            }
        }
    }

    if (showModulesLauncher) {
        ModulesLauncherBottomSheet(
            sheetState = sheetState,
            onDismissRequest = { showModulesLauncher = false },
            onNavigateToRoute = { route ->
                showModulesLauncher = false
                onNavigateToRoute(route)
            }
        )
    }
}

@Composable
fun PostCard(
    post: Post,
    onLikeClick: () -> Unit,
    onShareClick: () -> Unit = {}
) {
    var isBookmarked by remember { mutableStateOf(false) }
    var isPlayingVideo by remember { mutableStateOf(false) }
    var isBuffering by remember { mutableStateOf(false) }

    val hasVideo = post.authorName.contains("TalentXcel", ignoreCase = true) ||
            post.content.contains("jobs needed", ignoreCase = true) ||
            !post.mediaUrls.isNullOrEmpty()

    val videoUrl = remember(post) {
        post.mediaUrls.firstOrNull { it.endsWith(".mp4", ignoreCase = true) || it.contains("video", ignoreCase = true) }
            ?: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 14.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
        border = BorderStroke(1.dp, BorderSubtle),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            // Author header
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(BrandBlue50),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = post.authorName.firstOrNull()?.toString() ?: "U",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = BrandBluePrimary
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = "${post.authorName} • ${post.createdAt}",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = TextPrimary
                        )
                        Text(
                            text = post.authorHeadline,
                            fontSize = 11.sp,
                            color = TextMuted,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
                IconButton(onClick = {}, modifier = Modifier.size(24.dp)) {
                    Icon(
                        imageVector = Icons.Default.MoreVert,
                        contentDescription = "Options",
                        tint = TextMuted,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            if (!post.headline.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = post.headline,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Text content
            Text(
                text = post.content,
                fontSize = 13.sp,
                fontWeight = FontWeight.Normal,
                color = TextPrimary,
                lineHeight = 19.sp
            )

            // Native In-Feed Video Player (Tap to play/pause)
            if (hasVideo) {
                Spacer(modifier = Modifier.height(10.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(210.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color.Black)
                        .clickable { isPlayingVideo = !isPlayingVideo },
                    contentAlignment = Alignment.Center
                ) {
                    if (isPlayingVideo) {
                        AndroidView(
                            factory = { ctx ->
                                isBuffering = true
                                val frame = android.widget.FrameLayout(ctx).apply {
                                    setBackgroundColor(android.graphics.Color.BLACK)
                                }
                                val vv = VideoView(ctx).apply {
                                    setVideoURI(Uri.parse(videoUrl))
                                    setOnPreparedListener { mp ->
                                        mp.isLooping = true
                                        isBuffering = false
                                        start()
                                    }
                                    setOnErrorListener { _, _, _ ->
                                        setVideoURI(Uri.parse("https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"))
                                        isBuffering = true
                                        true
                                    }
                                }
                                val params = android.widget.FrameLayout.LayoutParams(
                                    android.widget.FrameLayout.LayoutParams.MATCH_PARENT,
                                    android.widget.FrameLayout.LayoutParams.MATCH_PARENT,
                                    android.view.Gravity.CENTER
                                )
                                frame.addView(vv, params)
                                frame
                            },
                            update = { frame ->
                                val vv = frame.getChildAt(0) as? VideoView ?: return@AndroidView
                                if (isPlayingVideo) {
                                    if (!vv.isPlaying) vv.start()
                                } else {
                                    if (vv.isPlaying) vv.pause()
                                }
                            },
                            modifier = Modifier.fillMaxSize()
                        )

                        if (isBuffering) {
                            CircularProgressIndicator(
                                color = BrandBluePrimary,
                                strokeWidth = 2.5.dp,
                                modifier = Modifier
                                    .size(36.dp)
                                    .align(Alignment.Center)
                            )
                        }

                        // Top indicator badge when playing
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = Color.Black.copy(alpha = 0.7f),
                            modifier = Modifier
                                .align(Alignment.TopStart)
                                .padding(10.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(6.dp)
                                        .clip(CircleShape)
                                        .background(AccentEmerald)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "PLAYING",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            }
                        }
                    } else {
                        // Cinematic video preview backdrop
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(
                                    Brush.radialGradient(
                                        colors = listOf(
                                            Color(0xFF334155),
                                            Color(0xFF0F172A),
                                            Color(0xFF020617)
                                        )
                                    )
                                )
                        )

                        // Big glowing tactile play button
                        Box(
                            modifier = Modifier
                                .size(58.dp)
                                .clip(CircleShape)
                                .background(BrandBluePrimary.copy(alpha = 0.9f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.PlayArrow,
                                contentDescription = "Play Video",
                                tint = Color.White,
                                modifier = Modifier.size(36.dp)
                            )
                        }

                        // Bottom row with Duration badge and Tap to play hint
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .align(Alignment.BottomCenter)
                                .padding(10.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "▶ Tap to play video",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color.White.copy(alpha = 0.9f)
                            )
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = Color.Black.copy(alpha = 0.75f)
                            ) {
                                Text(
                                    text = "0:45",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))
            Divider(color = BorderSubtle, thickness = 0.5.dp)
            Spacer(modifier = Modifier.height(8.dp))

            // Engagement bar (Like, Comment, Share, Bookmark)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceAround,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Like
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .clickable { onLikeClick() }
                        .padding(horizontal = 6.dp, vertical = 6.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.ThumbUp,
                        contentDescription = "Like",
                        tint = if (post.isLikedByMe) BrandBluePrimary else TextMuted,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = if (post.likesCount > 0) "${post.likesCount} Like" else "Like",
                        fontSize = 11.sp,
                        fontWeight = if (post.isLikedByMe) FontWeight.Bold else FontWeight.Medium,
                        color = if (post.isLikedByMe) BrandBluePrimary else TextSecondary
                    )
                }

                // Comment
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .clickable { }
                        .padding(horizontal = 6.dp, vertical = 6.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.ChatBubbleOutline,
                        contentDescription = "Comment",
                        tint = TextMuted,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = if (post.commentsCount > 0) "${post.commentsCount} Comment" else "Comment",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = TextSecondary
                    )
                }

                // Share
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .clickable { onShareClick() }
                        .padding(horizontal = 6.dp, vertical = 6.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Share,
                        contentDescription = "Share",
                        tint = TextMuted,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "Share",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = TextSecondary
                    )
                }

                // Save / Bookmark
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .clickable { isBookmarked = !isBookmarked }
                        .padding(horizontal = 6.dp, vertical = 6.dp)
                ) {
                    Icon(
                        imageVector = if (isBookmarked) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                        contentDescription = "Save",
                        tint = if (isBookmarked) BrandBluePrimary else TextMuted,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = if (isBookmarked) "Saved" else "Save",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = if (isBookmarked) BrandBluePrimary else TextSecondary
                    )
                }
            }
        }
    }
}

@Composable
private fun PostActionItem(
    icon: ImageVector,
    label: String,
    tint: Color,
    onClick: () -> Unit
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .clickable { onClick() }
            .padding(horizontal = 8.dp, vertical = 6.dp)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = label,
            tint = tint,
            modifier = Modifier.size(18.dp)
        )
        Spacer(modifier = Modifier.width(6.dp))
        Text(
            text = label,
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium,
            color = TextSecondary
        )
    }
}

@Composable
fun SuggestedUserCard(user: SuggestedUser) {
    var isConnected by remember { mutableStateOf(false) }

    Card(
        modifier = Modifier
            .width(135.dp)
            .padding(vertical = 4.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
        border = BorderStroke(1.dp, BorderSubtle),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(CircleShape)
                    .background(user.avatarBg),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = user.initial,
                    color = Color.White,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = user.name,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = TextPrimary,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )

            Text(
                text = user.role,
                fontSize = 10.sp,
                color = TextMuted,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )

            Spacer(modifier = Modifier.height(10.dp))

            Surface(
                shape = RoundedCornerShape(14.dp),
                color = if (isConnected) AccentEmerald.copy(alpha = 0.15f) else BrandBlue50,
                modifier = Modifier.clickable { isConnected = !isConnected }
            ) {
                Text(
                    text = if (isConnected) "Connected" else "+ Connect",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isConnected) AccentEmerald else BrandBluePrimary,
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                )
            }
        }
    }
}

@Composable
fun CompactSuggestedUserChip(user: SuggestedUser) {
    var isConnected by remember { mutableStateOf(false) }

    Surface(
        shape = RoundedCornerShape(16.dp),
        color = BgLight,
        border = BorderStroke(0.8.dp, BorderSubtle),
        modifier = Modifier.clickable { isConnected = !isConnected }
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(26.dp)
                    .clip(CircleShape)
                    .background(user.avatarBg),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = user.initial,
                    color = Color.White,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }
            Spacer(modifier = Modifier.width(6.dp))
            Column {
                Text(
                    text = user.name,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = TextPrimary,
                    maxLines = 1
                )
                Text(
                    text = user.role,
                    fontSize = 9.sp,
                    color = TextMuted,
                    maxLines = 1
                )
            }
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = if (isConnected) "✓" else "+ Connect",
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                color = if (isConnected) AccentEmerald else BrandBluePrimary
            )
        }
    }
}

