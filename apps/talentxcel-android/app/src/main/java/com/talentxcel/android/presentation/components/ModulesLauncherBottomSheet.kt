package com.talentxcel.android.presentation.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Badge
import androidx.compose.material.icons.filled.CardGiftcard
import androidx.compose.material.icons.filled.ChatBubbleOutline
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.QrCode
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Work
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.SheetState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.talentxcel.android.presentation.theme.AccentAmber
import com.talentxcel.android.presentation.theme.AccentEmerald
import com.talentxcel.android.presentation.theme.AccentRose
import com.talentxcel.android.presentation.theme.BorderSubtle
import com.talentxcel.android.presentation.theme.BrandBlue50
import com.talentxcel.android.presentation.theme.BrandBlue500
import com.talentxcel.android.presentation.theme.BrandBluePrimary
import com.talentxcel.android.presentation.theme.SurfaceWhite
import com.talentxcel.android.presentation.theme.TextMuted
import com.talentxcel.android.presentation.theme.TextPrimary

data class EcosystemModule(
    val id: String,
    val title: String,
    val subtitle: String = "",
    val category: String,
    val icon: ImageVector,
    val iconBgColor: Color,
    val iconTint: Color,
    val route: String,
    val badge: String? = null
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ModulesLauncherBottomSheet(
    sheetState: SheetState,
    onDismissRequest: () -> Unit,
    onNavigateToRoute: (String) -> Unit
) {
    val modules = listOf(
        // Career Tools & Resources (Directly from Web App Explore Menu - Image 2)
        EcosystemModule("passport", "Career Passport", "Universal profile & TalentScore", "Career Tools & Resources", Icons.Default.QrCode, Color(0xFFFDF2F8), AccentRose, "passport", "QR"),
        EcosystemModule("ats", "Resume Builder", "ATS-ready executive resumes", "Career Tools & Resources", Icons.Default.Description, Color(0xFFFFFBEB), AccentAmber, "resume", "ATS"),
        EcosystemModule("companies", "Companies", "Explore verified employer pages", "Career Tools & Resources", Icons.Default.Work, Color(0xFFF0FDF4), AccentEmerald, "jobs"),
        EcosystemModule("colleges", "10,250+ Colleges", "NIRF rankings & placement stats", "Career Tools & Resources", Icons.Default.Map, Color(0xFFEFF6FF), Color(0xFF2563EB), "career/map"),
        EcosystemModule("salary", "Salary & Rankings", "Compensation benchmarks", "Career Tools & Resources", Icons.Default.CardGiftcard, Color(0xFFFEF3C7), Color(0xFFD97706), "jobs"),
        EcosystemModule("pathways", "Career Map", "Skill progression trajectories", "Career Tools & Resources", Icons.Default.Map, Color(0xFFECFDF5), AccentEmerald, "career/map"),
        EcosystemModule("learning", "Learning & Skills", "High-income credentials", "Career Tools & Resources", Icons.Default.AutoAwesome, Color(0xFFEEF2FF), BrandBluePrimary, "career"),

        // Core App
        EcosystemModule("feed", "Network Feed", "Live community posts", "Core", Icons.Default.People, BrandBlue50, BrandBluePrimary, "home"),
        EcosystemModule("reels", "Career Reels", "Short-form video learning", "Core", Icons.Default.PlayArrow, Color(0xFFEFF6FF), Color(0xFF2563EB), "reels", "LIVE"),
        EcosystemModule("jobs", "Job Search", "Verified live openings", "Core", Icons.Default.Work, Color(0xFFF0FDF4), AccentEmerald, "jobs"),
        EcosystemModule("profile", "My Profile", "Public career footprint", "Core", Icons.Default.Person, Color(0xFFFAF5FF), Color(0xFF9333EA), "profile"),

        // SI & Intelligence
        EcosystemModule("gemini", "TalentXcel SI Agent", "On-Device Career Co-Pilot", "SI & Intelligence", Icons.Default.AutoAwesome, Color(0xFFEEF2FF), BrandBluePrimary, "career", "On-Device"),
        EcosystemModule("messages", "1:1 Chat", "Recruiter & peer messaging", "Social", Icons.Default.ChatBubbleOutline, BrandBlue50, BrandBluePrimary, "conversations"),
        EcosystemModule("notifications", "Notifications", "Real-time push alerts", "Social", Icons.Default.Notifications, Color(0xFFFFF1F2), AccentRose, "notifications"),

        // Growth & Viral
        EcosystemModule("rewards", "Rewards & XP", "Streaks & token vault", "Growth", Icons.Default.CardGiftcard, Color(0xFFFEF3C7), Color(0xFFD97706), "rewards", "🔥 7d"),
        EcosystemModule("refer", "Refer & Earn", "Earn +300 coins per invite", "Growth", Icons.Default.Share, Color(0xFFF0FDF4), AccentEmerald, "refer", "+300c"),

        // Governance
        EcosystemModule("privacy", "SI Privacy", "On-device guardrails", "System", Icons.Default.Security, Color(0xFFEEF2FF), BrandBluePrimary, "settings/ai_privacy"),
        EcosystemModule("settings", "App Settings", "Account & preferences", "System", Icons.Default.Settings, Color(0xFFF3F4F6), Color(0xFF4B5563), "settings")
    )

    val categories = listOf("Career Tools & Resources", "Core", "SI & Intelligence", "Social", "Growth", "System")

    ModalBottomSheet(
        onDismissRequest = onDismissRequest,
        sheetState = sheetState,
        containerColor = SurfaceWhite,
        dragHandle = null
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 32.dp)
        ) {
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = "TalentXcel Ecosystem",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    Text(
                        text = "All modules, tools and on-device SI co-pilot",
                        fontSize = 12.sp,
                        color = TextMuted
                    )
                }

                IconButton(
                    onClick = onDismissRequest,
                    modifier = Modifier.size(32.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Close",
                        tint = TextMuted
                    )
                }
            }

            HorizontalDivider(color = BorderSubtle)

            LazyVerticalGrid(
                columns = GridCells.Fixed(4),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                categories.forEach { cat ->
                    val categoryModules = modules.filter { it.category == cat }
                    if (categoryModules.isNotEmpty()) {
                        item(span = { GridItemSpan(4) }) {
                            Text(
                                text = cat.uppercase(),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = BrandBlue500,
                                letterSpacing = 1.sp,
                                modifier = Modifier.padding(top = 8.dp, bottom = 4.dp)
                            )
                        }

                        items(categoryModules) { module ->
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                modifier = Modifier
                                    .clickable {
                                        onDismissRequest()
                                        onNavigateToRoute(module.route)
                                    }
                                    .padding(vertical = 4.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(52.dp)
                                        .clip(RoundedCornerShape(14.dp))
                                        .background(module.iconBgColor),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = module.icon,
                                        contentDescription = module.title,
                                        tint = module.iconTint,
                                        modifier = Modifier.size(26.dp)
                                    )

                                    if (module.badge != null) {
                                        Surface(
                                            shape = RoundedCornerShape(6.dp),
                                            color = BrandBluePrimary,
                                            modifier = Modifier
                                                .align(Alignment.TopEnd)
                                                .padding(top = 2.dp, end = 2.dp)
                                        ) {
                                            Text(
                                                text = module.badge,
                                                fontSize = 8.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = Color.White,
                                                modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                                            )
                                        }
                                    }
                                }

                                Spacer(modifier = Modifier.height(6.dp))

                                Text(
                                    text = module.title,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = TextPrimary,
                                    textAlign = TextAlign.Center,
                                    maxLines = 1
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
