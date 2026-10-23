package in.talentxcel.app.plugins

import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.Uri

class CallActionReceiver : BroadcastReceiver() {

    companion object {
        const val ACTION_ANSWER = "in.talentxcel.app.ACTION_ANSWER_CALL"
        const val ACTION_DECLINE = "in.talentxcel.app.ACTION_DECLINE_CALL"

        const val EXTRA_CALL_ID = "extra_call_id"
        const val EXTRA_CALL_TYPE = "extra_call_type"
    }

    override fun onReceive(context: Context?, intent: Intent?) {
        if (context == null || intent == null) return

        val callId = intent.getStringExtra(EXTRA_CALL_ID) ?: return
        val callType = intent.getStringExtra(EXTRA_CALL_TYPE) ?: "video"

        // Cancel notification ringtone
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.cancel(callId.hashCode())

        when (intent.action) {
            ACTION_ANSWER -> {
                // Inform Capacitor JavaScript bridge if active
                CallBridgePlugin.instance?.emitCallAnswered(callId, callType)

                // Launch main activity with deep link to VideoCall route
                val deepLinkIntent = Intent(Intent.ACTION_VIEW, Uri.parse("in.talentxcel.app://call?callId=$callId")).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                }
                context.startActivity(deepLinkIntent)
            }
            ACTION_DECLINE -> {
                // Inform Capacitor JavaScript bridge
                CallBridgePlugin.instance?.emitCallDeclined(callId)
            }
        }
    }
}
