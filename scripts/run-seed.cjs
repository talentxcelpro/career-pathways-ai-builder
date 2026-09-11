const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const TX_URL = process.env.TX_SUPABASE_URL || "https://dthlgsnakhoftinssokm.supabase.co";
const TX_KEY = process.env.TALENTXCEL_SERVICE_ROLE_KEY || process.env.TX_SERVICE_ROLE_KEY;
if (!TX_KEY) {
  console.error("Missing TALENTXCEL_SERVICE_ROLE_KEY environment variable");
  process.exit(1);
}
const supabase = createClient(TX_URL, TX_KEY, { auth: { persistSession: false } });

async function run() {
  console.log("\n UDX v2.2 - GSC Seed Runner");
  console.log("Target: dthlgsnakhoftinssokm (TalentXcel)\n");

  const { data: tenants, error: tenantErr } = await supabase.from("udx_tenants").select("tenant_id").limit(5);
  if (tenantErr) { console.error("FAIL connection:", tenantErr.message); process.exit(1); }
  console.log("OK connected. Tenants:", tenants.map(t=>t.tenant_id).join(", ") || "(none)");

  const { error: te } = await supabase.from("udx_tenants").upsert({
    tenant_id: "talentxcel", display_name: "TalentXcel", domain: "talentxcel.in",
    gsc_property: "sc-domain:talentxcel.in", plan: "laboratory",
    settings: { primaryMarket: "IN", primaryLanguage: "en", businessModel: "career_intelligence" }
  }, { onConflict: "tenant_id" });
  if (te) { console.error("FAIL tenant:", te.message); process.exit(1); }
  console.log("OK tenant ready");

  const dumpPath = path.join(__dirname, "..", "gsc-full-dump.json");
  if (!fs.existsSync(dumpPath)) { console.error("FAIL: gsc-full-dump.json not found at", dumpPath); process.exit(1); }
  const rows = JSON.parse(fs.readFileSync(dumpPath, "utf8")).rows || [];
  console.log("OK loaded " + rows.length + " rows from GSC dump");

  const entities = rows.map(row => {
    const keys = row.keys || [];
    const query = keys[0] || ""; const page = keys[1] || "";
    const country = (keys[2] || "ind").toLowerCase().slice(0,3);
    const normalized = query.toLowerCase().trim().replace(/\s+/g," ");
    let intent = "DISCOVERY";
    const q = normalized;
    if (q.includes("job")||q.includes("vacancy")||q.includes("career")||q.includes("hiring")) intent="JOB_SEARCH";
    else if (q.includes("resume")||q.includes("cv")) intent="RESUME_ATS";
    else if (q.includes("salary")||q.includes("pay")) intent="CAREER_INTEL";
    else if (q.includes("interview")) intent="INTERVIEW_PREP";
    else if (q.includes("skill")||q.includes("course")||q.includes("learn")) intent="SKILL_LEARNING";
    else if (q.includes("hire")||q.includes("recruit")||q.includes("employer")) intent="HIRING";
    return { tenant_id:"talentxcel", query, normalized_query:normalized, intent, country,
      supply_page:page, impressions:Math.round(row.impressions||0), clicks:Math.round(row.clicks||0),
      ctr:parseFloat((row.ctr||0).toFixed(4)), position:parseFloat((row.position||0).toFixed(2)),
      provenance_source:"gsc_api", provenance_confidence:1.0, provenance_as_of:new Date().toISOString() };
  });

  const BATCH=50; let inserted=0, errors=0;
  for (let i=0;i<entities.length;i+=BATCH) {
    const batch=entities.slice(i,i+BATCH);
    const {error} = await supabase.from("udx_demand_entities").upsert(batch,{onConflict:"tenant_id,normalized_query,country",ignoreDuplicates:false});
    if (error) { console.warn("  WARN batch " + Math.floor(i/BATCH+1) + ":", error.message); errors++; }
    else { inserted+=batch.length; process.stdout.write("\r  Upserted " + inserted + "/" + entities.length + "..."); }
  }
  console.log("\n  DONE: " + inserted + " upserted, " + errors + " batch errors");

  const {data:rpcData,error:rpcErr} = await supabase.rpc("calculate_udx_opportunities",{p_tenant_id:"talentxcel"});
  if (rpcErr) console.warn("  WARN RPC:", rpcErr.message);
  else console.log("  OK opportunities RPC result:", rpcData);

  const {count} = await supabase.from("udx_demand_entities").select("*",{count:"exact",head:true}).eq("tenant_id","talentxcel");
  console.log("\n  Total demand entities in DB: " + count);

  const {data:topQ} = await supabase.from("udx_demand_entities").select("query,impressions,clicks,position,intent").eq("tenant_id","talentxcel").order("impressions",{ascending:false}).limit(10);
  if (topQ) {
    console.log("\n  TOP 10 QUERIES:");
    topQ.forEach((q,i)=>console.log("  " + (i+1) + ". \"" + q.query + "\" - " + q.impressions + " imp | pos " + q.position + " | " + q.intent));
  }
  console.log("\nSeed complete. Open http://localhost:8080/discovery\n");
}
run().catch(e=>{console.error("Fatal:",e);process.exit(1);});