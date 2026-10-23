package in.talentxcel.app

import android.os.Bundle
import com.getcapacitor.BridgeActivity
import in.talentxcel.app.plugins.BackgroundServicePlugin
import in.talentxcel.app.plugins.CallBridgePlugin

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        // Register custom native bridge plugins
        registerPlugin(BackgroundServicePlugin::class.java)
        registerPlugin(CallBridgePlugin::class.java)

        super.onCreate(savedInstanceState)
    }
}
