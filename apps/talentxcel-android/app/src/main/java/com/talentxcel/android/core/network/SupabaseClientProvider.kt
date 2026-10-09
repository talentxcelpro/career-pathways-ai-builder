package com.talentxcel.android.core.network

import android.content.Context
import com.talentxcel.android.BuildConfig
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.auth.Auth
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.functions.Functions
import io.github.jan.supabase.functions.functions
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.realtime.Realtime
import io.github.jan.supabase.realtime.realtime
import io.github.jan.supabase.storage.Storage
import io.github.jan.supabase.storage.storage

/**
 * Singleton provider for the official Supabase Android/Kotlin client.
 * Connects directly to the existing TalentXcel backend project: dthlgsnakhoftinssokm.
 */
object SupabaseClientProvider {

    lateinit var client: SupabaseClient
        private set

    fun init(context: Context) {
        client = createSupabaseClient(
            supabaseUrl = BuildConfig.SUPABASE_URL,
            supabaseKey = BuildConfig.SUPABASE_ANON_KEY
        ) {
            install(Auth) {
                // PKCE flow is default in Supabase Auth Kotlin
            }
            install(Postgrest)
            install(Realtime)
            install(Functions)
            install(Storage)
        }
    }

    val auth get() = client.auth
    val postgrest get() = client.postgrest
    val realtime get() = client.realtime
    val functions get() = client.functions
    val storage get() = client.storage
}
