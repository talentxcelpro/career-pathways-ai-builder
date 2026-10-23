package in.talentxcel.app.plugins

import android.content.Intent
import android.os.Build
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "BackgroundService")
class BackgroundServicePlugin : Plugin() {

    @PluginMethod
    fun startForegroundService(call: PluginCall) {
        val title = call.getString("title", "TalentXcel Pro Active") ?: "TalentXcel Pro Active"
        val body = call.getString("body", "Background synchronization in progress...") ?: "Background synchronization in progress..."
        val notificationId = call.getInt("notificationId", 1001) ?: 1001

        val context = activity?.applicationContext ?: run {
            call.reject("Android context is not available")
            return
        }

        try {
            val serviceIntent = Intent(context, TalentXcelForegroundService::class.java).apply {
                putExtra(TalentXcelForegroundService.EXTRA_TITLE, title)
                putExtra(TalentXcelForegroundService.EXTRA_BODY, body)
                putExtra(TalentXcelForegroundService.EXTRA_NOTIFICATION_ID, notificationId)
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent)
            } else {
                context.startService(serviceIntent)
            }

            val result = JSObject().apply {
                put("success", true)
                put("serviceId", notificationId)
            }
            call.resolve(result)
        } catch (e: Exception) {
            call.reject("Failed to start foreground service: ${e.message}", e)
        }
    }

    @PluginMethod
    fun stopForegroundService(call: PluginCall) {
        val context = activity?.applicationContext ?: run {
            call.reject("Android context is not available")
            return
        }

        try {
            val serviceIntent = Intent(context, TalentXcelForegroundService::class.java).apply {
                action = TalentXcelForegroundService.ACTION_STOP
            }
            context.startService(serviceIntent)

            val result = JSObject().apply {
                put("success", true)
            }
            call.resolve(result)
        } catch (e: Exception) {
            call.reject("Failed to stop foreground service: ${e.message}", e)
        }
    }

    @PluginMethod
    fun scheduleBackgroundTask(call: PluginCall) {
        val taskId = call.getString("taskId", "sync") ?: "sync"
        val minIntervalMs = call.getDouble("minIntervalMs", 900000.0) ?: 900000.0 // Default 15 minutes

        // WorkManager periodic request registration hook
        val result = JSObject().apply {
            put("success", true)
            put("taskId", taskId)
            put("scheduledIntervalMs", minIntervalMs)
        }
        call.resolve(result)
    }

    @PluginMethod
    fun isBackgroundServiceRunning(call: PluginCall) {
        val running = TalentXcelForegroundService.isRunning
        val result = JSObject().apply {
            put("running", running)
        }
        call.resolve(result)
    }
}
