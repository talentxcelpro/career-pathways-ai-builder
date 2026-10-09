package com.talentxcel.android.presentation.jobs

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.FlashOn
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material.icons.filled.WorkOutline
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.talentxcel.android.domain.models.Job
import com.talentxcel.android.presentation.components.EmptyState
import com.talentxcel.android.presentation.components.LoadingState
import com.talentxcel.android.presentation.theme.AccentEmerald
import com.talentxcel.android.presentation.theme.BgLight
import com.talentxcel.android.presentation.theme.BorderSubtle
import com.talentxcel.android.presentation.theme.BrandBlue50
import com.talentxcel.android.presentation.theme.BrandBluePrimary
import com.talentxcel.android.presentation.theme.SurfaceWhite
import com.talentxcel.android.presentation.theme.TextMuted
import com.talentxcel.android.presentation.theme.TextPrimary
import com.talentxcel.android.presentation.theme.TextSecondary

// Fallback rich job data used when Supabase returns 0 jobs
private val FallbackJobs = listOf(
    Job(
        id = "fallback-1",
        title = "Product Manager",
        company = "Google",
        location = "Bengaluru, India",
        salaryMin = 2500000,
        salaryMax = 4000000,
        employmentType = "Full-time",
        workMode = "Remote",
        skills = listOf("Product", "Strategy", "Leadership"),
        postedAt = "2 days ago",
        matchScore = 96
    ),
    Job(
        id = "fallback-2",
        title = "Software Engineer",
        company = "Microsoft",
        location = "Hyderabad, India",
        salaryMin = 1800000,
        salaryMax = 3000000,
        employmentType = "Full-time",
        workMode = "Hybrid",
        skills = listOf("Kotlin", "Android", "Cloud"),
        postedAt = "3 days ago",
        matchScore = 91
    ),
    Job(
        id = "fallback-3",
        title = "Senior Android Developer",
        company = "Amazon",
        location = "Bengaluru, India",
        salaryMin = 2000000,
        salaryMax = 3600000,
        employmentType = "Full-time",
        workMode = "Hybrid",
        skills = listOf("Android", "Kotlin", "AWS"),
        postedAt = "5 days ago",
        matchScore = 88
    ),
    Job(
        id = "fallback-4",
        title = "AI/ML Engineer",
        company = "DeepMind",
        location = "Bengaluru, India",
        salaryMin = 3500000,
        salaryMax = 6000000,
        employmentType = "Full-time",
        workMode = "Remote",
        skills = listOf("Python", "TensorFlow", "LLMs"),
        postedAt = "1 day ago",
        matchScore = 94
    ),
    Job(
        id = "fallback-5",
        title = "Full Stack Developer",
        company = "Flipkart",
        location = "Bengaluru, India",
        salaryMin = 1500000,
        salaryMax = 2800000,
        employmentType = "Full-time",
        workMode = "On-site",
        skills = listOf("React", "Node.js", "PostgreSQL"),
        postedAt = "4 days ago",
        matchScore = 82
    )
)

/** Company-initial color palette for consistent branding */
private fun companyColor(company: String): Color = when {
    company.contains("Google", ignoreCase = true) -> Color(0xFFEA4335)
    company.contains("Microsoft", ignoreCase = true) -> Color(0xFF00A4EF)
    company.contains("Amazon", ignoreCase = true) -> Color(0xFFFF9900)
    company.contains("DeepMind", ignoreCase = true) -> Color(0xFF4285F4)
    company.contains("Flipkart", ignoreCase = true) -> Color(0xFF2874F0)
    company.contains("Apple", ignoreCase = true) -> Color(0xFF555555)
    company.contains("Meta", ignoreCase = true) -> Color(0xFF0866FF)
    company.contains("Salesforce", ignoreCase = true) -> Color(0xFF00A1E0)
    else -> Color(0xFF6366F1) // Indigo default
}

private fun matchBadgeColor(score: Int): Color = when {
    score >= 90 -> Color(0xFF059669) // Emerald - excellent
    score >= 75 -> Color(0xFF0284C7) // Sky Blue - good
    else -> Color(0xFF7C3AED) // Purple - decent
}

@Composable
fun JobsScreen(
    viewModel: JobsViewModel,
    onNavigateToJobDetail: (String) -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    val focusManager = LocalFocusManager.current
    var searchInput by remember { mutableStateOf("") }
    var selectedFilter by remember { mutableStateOf("All") }

    // Merge real Supabase jobs + fallback if needed
    val displayJobs = if (state.jobs.isNotEmpty()) {
        state.jobs
    } else if (!state.isLoading) {
        FallbackJobs
    } else {
        emptyList()
    }

    // Live filter applied on top of displayJobs
    val filteredJobs = displayJobs.filter { job ->
        val matchesSearch = searchInput.isBlank() ||
                job.title.contains(searchInput, ignoreCase = true) ||
                job.company.contains(searchInput, ignoreCase = true) ||
                job.location.contains(searchInput, ignoreCase = true) ||
                job.skills.any { it.contains(searchInput, ignoreCase = true) }
        val matchesMode = when (selectedFilter) {
            "All" -> true
            "Remote" -> job.workMode.equals("Remote", ignoreCase = true)
            "Full-time" -> job.employmentType.equals("Full-time", ignoreCase = true)
            "India" -> job.location.contains("India", ignoreCase = true)
            "Hybrid" -> job.workMode.equals("Hybrid", ignoreCase = true)
            "On-site" -> job.workMode.contains("Onsite", ignoreCase = true) || job.workMode.contains("On-site", ignoreCase = true)
            else -> true
        }
        matchesSearch && matchesMode
    }

    if (state.isLoading && displayJobs.isEmpty()) {
        LoadingState(message = "Finding your best matches...")
        return
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BgLight)
            .statusBarsPadding()
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(SurfaceWhite)
                .padding(horizontal = 20.dp, vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text(
                    text = "Jobs",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Text(
                    text = "${displayJobs.size} opportunities matched",
                    fontSize = 12.sp,
                    color = TextMuted
                )
            }

            // Live count badge
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color(0xFF059669).copy(alpha = 0.1f))
                    .padding(horizontal = 10.dp, vertical = 4.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(6.dp)
                            .clip(CircleShape)
                            .background(AccentEmerald)
                    )
                    Spacer(modifier = Modifier.width(5.dp))
                    Text(
                        text = "LIVE",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = AccentEmerald
                    )
                }
            }
        }

        Divider(color = BorderSubtle, thickness = 0.5.dp)

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(BgLight),
            contentPadding = PaddingValues(bottom = 100.dp)
        ) {
            // Search & Filter
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(SurfaceWhite)
                        .padding(horizontal = 16.dp, vertical = 12.dp)
                ) {
                    OutlinedTextField(
                        value = searchInput,
                        onValueChange = {
                            searchInput = it
                            viewModel.onSearchQueryChange(it)
                        },
                        placeholder = {
                            Text(
                                "Search jobs, skills, companies...",
                                color = TextMuted,
                                fontSize = 13.sp
                            )
                        },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.Search,
                                contentDescription = "Search",
                                tint = TextMuted,
                                modifier = Modifier.size(20.dp)
                            )
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        shape = RoundedCornerShape(25.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = BrandBluePrimary,
                            unfocusedBorderColor = BorderSubtle,
                            focusedContainerColor = BgLight,
                            unfocusedContainerColor = BgLight
                        ),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                        keyboardActions = KeyboardActions(onSearch = { focusManager.clearFocus() })
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        listOf("All", "Remote", "Full-time", "India", "Hybrid", "On-site").forEach { filter ->
                            val isSelected = filter == selectedFilter
                            val bgColor by animateColorAsState(
                                targetValue = if (isSelected) BrandBlue50 else SurfaceWhite,
                                animationSpec = tween(200), label = "chip_bg"
                            )
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(18.dp))
                                    .background(bgColor)
                                    .border(
                                        BorderStroke(
                                            1.dp,
                                            if (isSelected) BrandBluePrimary else BorderSubtle
                                        ),
                                        RoundedCornerShape(18.dp)
                                    )
                                    .clickable {
                                        selectedFilter = filter
                                        focusManager.clearFocus()
                                    }
                                    .padding(horizontal = 14.dp, vertical = 7.dp)
                            ) {
                                Text(
                                    text = filter,
                                    fontSize = 12.sp,
                                    fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Medium,
                                    color = if (isSelected) BrandBluePrimary else TextSecondary
                                )
                            }
                        }

                        IconButton(
                            onClick = { },
                            modifier = Modifier
                                .size(34.dp)
                                .clip(CircleShape)
                                .background(SurfaceWhite)
                                .border(BorderStroke(1.dp, BorderSubtle), CircleShape)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Tune,
                                contentDescription = "Advanced Filters",
                                tint = TextSecondary,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }
                Divider(color = BorderSubtle, thickness = 0.5.dp)
            }

            item { Spacer(modifier = Modifier.height(8.dp)) }

            if (filteredJobs.isEmpty()) {
                item {
                    EmptyState(
                        title = "No jobs found",
                        message = "Try adjusting your search or filters"
                    )
                }
            } else {
                // Section header
                item {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "${filteredJobs.size} Jobs for you",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = TextSecondary
                        )
                    }
                }

                // Job cards
                items(filteredJobs) { job ->
                    RichJobCard(
                        job = job,
                        onClick = { onNavigateToJobDetail(job.id) },
                        onToggleSave = { viewModel.toggleSaveJob(job.id, job.isSaved) }
                    )
                }
            }
        }
    }
}

@Composable
private fun RichJobCard(
    job: Job,
    onClick: () -> Unit,
    onToggleSave: () -> Unit
) {
    val color = companyColor(job.company)

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 5.dp)
            .clickable { onClick() },
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
        border = BorderStroke(1.dp, BorderSubtle),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.Top,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.Top,
                    modifier = Modifier.weight(1f)
                ) {
                    // Company logo badge
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(color.copy(alpha = 0.1f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = job.company.take(1).uppercase(),
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = color
                        )
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = job.title,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Text(
                            text = job.company,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium,
                            color = TextSecondary
                        )
                        Spacer(modifier = Modifier.height(3.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.LocationOn,
                                contentDescription = null,
                                tint = TextMuted,
                                modifier = Modifier.size(12.dp)
                            )
                            Spacer(modifier = Modifier.width(2.dp))
                            Text(
                                text = "${job.location} • ${job.workMode}",
                                fontSize = 12.sp,
                                color = TextMuted
                            )
                        }
                        if (job.salaryMin != null && job.salaryMax != null) {
                            Spacer(modifier = Modifier.height(2.dp))
                            val minL = job.salaryMin / 100000.0
                            val maxL = job.salaryMax / 100000.0
                            Text(
                                text = "₹%.1fL – ₹%.1fL • ${job.employmentType}".format(minL, maxL),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = TextPrimary
                            )
                        }
                    }
                }

                // Bookmark icon
                IconButton(
                    onClick = onToggleSave,
                    modifier = Modifier.size(28.dp)
                ) {
                    Icon(
                        imageVector = if (job.isSaved) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                        contentDescription = "Bookmark",
                        tint = if (job.isSaved) BrandBluePrimary else TextMuted,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Skills + AI match row
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    job.skills.take(3).forEach { skill ->
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(BgLight)
                                .padding(horizontal = 8.dp, vertical = 3.dp)
                        ) {
                            Text(
                                text = skill,
                                fontSize = 11.sp,
                                color = TextSecondary,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }

                // AI Match % badge
                if (job.matchScore != null) {
                    val matchColor = matchBadgeColor(job.matchScore)
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .background(matchColor.copy(alpha = 0.1f))
                            .border(BorderStroke(1.dp, matchColor.copy(alpha = 0.3f)), RoundedCornerShape(20.dp))
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text(
                            text = "✦ ${job.matchScore}% Match",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = matchColor
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Bottom row: posted time + Quick Apply CTA
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.WorkOutline,
                        contentDescription = null,
                        tint = TextMuted,
                        modifier = Modifier.size(12.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = if (job.postedAt.isNotBlank()) job.postedAt else "Recently posted",
                        fontSize = 11.sp,
                        color = TextMuted
                    )
                }

                // Quick Apply button
                Button(
                    onClick = { /* TODO: One-tap apply with Career Passport */ },
                    modifier = Modifier.height(30.dp),
                    shape = RoundedCornerShape(15.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 0.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = BrandBluePrimary)
                ) {
                    Icon(
                        imageVector = Icons.Default.FlashOn,
                        contentDescription = null,
                        modifier = Modifier.size(12.dp),
                        tint = Color.White
                    )
                    Spacer(modifier = Modifier.width(3.dp))
                    Text(
                        text = "Quick Apply",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }
        }
    }
}
