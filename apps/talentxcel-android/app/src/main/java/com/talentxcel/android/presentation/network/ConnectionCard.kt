package com.talentxcel.android.presentation.network

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.talentxcel.android.domain.models.Connection
import com.talentxcel.android.presentation.components.TXCAvatar
import com.talentxcel.android.presentation.components.TXCCard
import com.talentxcel.android.presentation.components.TXCOutlinedButton
import com.talentxcel.android.presentation.components.TXCPrimaryButton
import com.talentxcel.android.presentation.theme.TextMuted
import com.talentxcel.android.presentation.theme.TextPrimary
import com.talentxcel.android.presentation.theme.TextSecondary
import com.talentxcel.android.presentation.theme.TalentXcelTypography

@Composable
fun ConnectionCard(
    connection: Connection,
    onConnectClick: (() -> Unit)? = null,
    onMessageClick: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    TXCCard(modifier = modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            TXCAvatar(
                name = connection.fullName,
                imageUrl = connection.profilePictureUrl,
                size = 50.dp
            )
            Spacer(modifier = Modifier.width(14.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = connection.fullName,
                    style = TalentXcelTypography.titleMedium,
                    color = TextPrimary
                )
                Text(
                    text = connection.headline,
                    style = TalentXcelTypography.bodySmall,
                    color = TextSecondary,
                    maxLines = 2
                )
                if (connection.mutualConnectionsCount > 0) {
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "${connection.mutualConnectionsCount} mutual connections",
                        style = TalentXcelTypography.bodySmall,
                        color = TextMuted
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.End
        ) {
            if (connection.isConnected) {
                TXCOutlinedButton(
                    text = "Message",
                    onClick = { onMessageClick?.invoke() }
                )
            } else if (connection.isPending) {
                TXCOutlinedButton(
                    text = "Pending",
                    enabled = false,
                    onClick = {}
                )
            } else {
                TXCPrimaryButton(
                    text = "Connect",
                    onClick = { onConnectClick?.invoke() }
                )
            }
        }
    }
}
