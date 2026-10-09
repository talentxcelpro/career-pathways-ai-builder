package com.talentxcel.android.presentation.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.talentxcel.android.presentation.theme.TextPrimary

@Composable
fun TalentXcelBrandMark(
    modifier: Modifier = Modifier,
    size: Dp = 64.dp
) {
    val gradientBrush = Brush.linearGradient(
        colors = listOf(
            Color(0xFF6366F1), // Vibrant Indigo
            Color(0xFF2563EB), // Brand Royal Blue
            Color(0xFF06B6D4)  // Cyan glow
        )
    )

    Box(
        modifier = modifier
            .size(size)
            .clip(RoundedCornerShape(size * 0.28f))
            .background(gradientBrush),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.size(size * 0.65f)) {
            val w = this.size.width
            val h = this.size.height
            val strokeWidth = w * 0.16f

            // Outer stylish Q-arc
            drawArc(
                color = Color.White,
                startAngle = -35f,
                sweepAngle = 290f,
                useCenter = false,
                topLeft = Offset(strokeWidth / 2, strokeWidth / 2),
                size = Size(w - strokeWidth, h - strokeWidth),
                style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
            )

            // Inner core glow dot
            drawCircle(
                color = Color.White.copy(alpha = 0.95f),
                radius = strokeWidth * 0.75f,
                center = Offset(w * 0.5f, h * 0.5f)
            )

            // Dynamic bottom-right tail swoosh
            drawLine(
                color = Color.White,
                start = Offset(w * 0.48f, h * 0.48f),
                end = Offset(w * 0.92f, h * 0.92f),
                strokeWidth = strokeWidth * 1.05f,
                cap = StrokeCap.Round
            )
        }
    }
}

@Composable
fun TalentXcelHeaderLogo(
    modifier: Modifier = Modifier,
    markSize: Dp = 32.dp,
    fontSize: Int = 20
) {
    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically
    ) {
        TalentXcelBrandMark(size = markSize)
        Spacer(modifier = Modifier.width(10.dp))
        Text(
            text = "TalentXcel",
            fontSize = fontSize.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary,
            letterSpacing = (-0.5).sp
        )
    }
}
