package in.talentxcel.app.plugins

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "CallBridge")
class CallBridgePlugin : Plugin() {

    companion object {
        const val CALL_CHANNEL_ID = "talentxcel_incoming_calls"
        const val CALL_CHANNEL_NAME = "Incoming Video & Audio Calls"
        var instance: CallBridgePlugin? = null
    }

    override fun load() {
        super.load()
        instance = this
        createCallNotificationChannel()
    }

    @PluginMethod
    fun reportReady(call: PluginCall) {
        call.resolve()
    }

    @PluginMethod
    fun showIncomingCall(call: PluginCall) {
        val callId = call.getString("callId") ?: run {
            call.reject("Missing required callId")
            return
        }
        val callerName = call.getString("callerName", "TalentXcel Recruiter") ?: "TalentXcel Recruiter"
        val callType = call.getString("callType", "video") ?: "video"

        val context = activity?.applicationContext ?: run {
            call.reject("Android context is not available")
            return
        }

        try {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            // Intent to launch full-screen call activity over the lock screen
            val fullScreenIntent = Intent(Intent.ACTION_VIEW, Uri.parse("in.talentxcel.app://call?callId=$callId")).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val fullScreenPendingIntent = PendingIntent.getActivity(
                context,
                callId.hashCode(),
                fullScreenIntent,
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE else PendingIntent.FLAG_UPDATE_CURRENT
            )

            // Answer PendingIntent
            val answerIntent = Intent(context, CallActionReceiver::class.java).apply {
                action = CallActionReceiver.ACTION_ANSWER
                putExtra(CallActionReceiver.EXTRA_CALL_ID, callId)
                putExtra(CallActionReceiver.EXTRA_CALL_TYPE, callType)
            }
            val answerPendingIntent = PendingIntent.getBroadcast(
                context,
                (callId + "_answer").hashCode(),
                answerIntent,
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE else PendingIntent.FLAG_UPDATE_CURRENT
            )

            // Decline PendingIntent
            val declineIntent = Intent(context, CallActionReceiver::class.java).apply {
                action = CallActionReceiver.ACTION_DECLINE
                putExtra(CallActionReceiver.EXTRA_CALL_ID, callId)
            }
            val declinePendingIntent = PendingIntent.getBroadcast(
                context,
                (callId + "_decline").hashCode(),
                declineIntent,
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE else PendingIntent.FLAG_UPDATE_CURRENT
            )

            val ringtoneUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)

            val notification = NotificationCompat.Builder(context, CALL_CHANNEL_ID)
                .setContentTitle("Incoming $callType call")
                .setContentText("$callerName is calling you...")
                .setSmallIcon(android.R.drawable.sym_action_call)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_CALL)
                .setAutoCancel(true)
                .setOngoing(true)
                .setSound(ringtoneUri)
                .setFullScreenIntent(fullScreenPendingIntent, true)
                .addAction(android.R.drawable.ic_menu_call, "Answer", answerPendingIntent)
                .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Decline", declinePendingIntent)
                .build()

            notification.flags = notification.flags or Notification.FLAG_INSISTENT

            notificationManager.notify(callId.hashCode(), notification)

            val res = JSObject().apply { put("shown", true) }
            call.resolve(res)
        } catch (e: Exception) {
            call.reject("Failed to trigger incoming call UI: ${e.message}", e)
        }
    }

    @PluginMethod
    fun dismissIncomingCall(call: PluginCall) {
        val callId = call.getString("callId") ?: ""
        val context = activity?.applicationContext
        if (context != null && callId.isNotEmpty()) {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.cancel(callId.hashCode())
        }
        call.resolve()
    }

    fun emitCallAnswered(callId: String, callType: String) {
        val data = JSObject().apply {
            put("callId", callId)
            put("callType", callType)
        }
        notifyListeners("callAnswered", data)
    }

    fun emitCallDeclined(callId: String) {
        val data = JSObject().apply {
            put("callId", callId)
        }
        notifyListeners("callDeclined", data)
    }

    private fun createCallNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val ringtoneUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
            val audioAttributes = AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
                .build()

            val channel = NotificationChannel(
                CALL_CHANNEL_ID,
                CALL_CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "High-priority incoming audio and video call ring notifications"
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 1000, 500, 1000, 500, 1000)
                setSound(ringtoneUri, audioAttributes)
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            }

            val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }
}
