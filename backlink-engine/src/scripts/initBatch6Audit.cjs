// backlink-engine/src/scripts/initBatch6Audit.cjs
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../../data/backlink_engine.db');
const db = new DatabaseSync(DB_PATH);

const RAW_CANDIDATES = [
  // A. AI tools and AI product directories — 100
  { num: 1, name: "AI Agents Listing", inputDomain: "aiagentslisting.com", group: "A. AI tools and AI product directories" },
  { num: 2, name: "AI Best Tools", inputDomain: "aibesttools.org", group: "A. AI tools and AI product directories" },
  { num: 3, name: "AI Bookmarks", inputDomain: "aibookmarks.net", group: "A. AI tools and AI product directories" },
  { num: 4, name: "AI Compare", inputDomain: "aicompare.to", group: "A. AI tools and AI product directories" },
  { num: 5, name: "AI Dev Tools Directory", inputDomain: "aidevtools.dev", group: "A. AI tools and AI product directories" },
  { num: 6, name: "AI Directory", inputDomain: "ai-directory.com", group: "A. AI tools and AI product directories" },
  { num: 7, name: "AI Gear Base", inputDomain: "aigearbase.com", group: "A. AI tools and AI product directories" },
  { num: 8, name: "AI Green Pages", inputDomain: "aigreenpages.com", group: "A. AI tools and AI product directories" },
  { num: 9, name: "AI Kendra", inputDomain: "aikendra.com", group: "A. AI tools and AI product directories" },
  { num: 10, name: "AI Made Easy", inputDomain: "aimadeeasy.app", group: "A. AI tools and AI product directories" },
  { num: 11, name: "Qwen AI Site", inputDomain: "qwenai.site", group: "A. AI tools and AI product directories" },
  { num: 12, name: "AI Navigation Directory", inputDomain: "ainavdir.com", group: "A. AI tools and AI product directories" },
  { num: 13, name: "AI SaaS Radar", inputDomain: "aisaasradar.com", group: "A. AI tools and AI product directories" },
  { num: 14, name: "AI Shortcut Lab", inputDomain: "aishortcutlab.com", group: "A. AI tools and AI product directories" },
  { num: 15, name: "AI Suggests", inputDomain: "aisuggests.ai", group: "A. AI tools and AI product directories" },
  { num: 16, name: "AI Tool Finder", inputDomain: "aitoolfinder.org", group: "A. AI tools and AI product directories" },
  { num: 17, name: "AI Tool Index", inputDomain: "aitoolindex.io", group: "A. AI tools and AI product directories" },
  { num: 18, name: "AI Tool Podium", inputDomain: "aitoolpodium.com", group: "A. AI tools and AI product directories" },
  { num: 19, name: "AI Tools Directory", inputDomain: "aitools-directory.com", group: "A. AI tools and AI product directories" },
  { num: 20, name: "AI Tools Directory Site", inputDomain: "aitoolsdirectory.site", group: "A. AI tools and AI product directories" },
  { num: 21, name: "AI Tools Library", inputDomain: "aitools.sh", group: "A. AI tools and AI product directories" },
  { num: 22, name: "AI Tools Lister", inputDomain: "aitoolslister.com", group: "A. AI tools and AI product directories" },
  { num: 23, name: "AI Tools Masters", inputDomain: "aitoolsmasters.com", group: "A. AI tools and AI product directories" },
  { num: 24, name: "AI ToolsXplorer", inputDomain: "aitoolsxplorer.in", group: "A. AI tools and AI product directories" },
  { num: 25, name: "AI-Tool.ai", inputDomain: "ai-tool.ai", group: "A. AI tools and AI product directories" },
  { num: 26, name: "AIAppDrop", inputDomain: "aiappdrop.com", group: "A. AI tools and AI product directories" },
  { num: 27, name: "AICPB", inputDomain: "aicpb.com", group: "A. AI tools and AI product directories" },
  { num: 28, name: "AICompare Ninja", inputDomain: "aicompare.ninja", group: "A. AI tools and AI product directories" },
  { num: 29, name: "AIDrips", inputDomain: "aidrips.com", group: "A. AI tools and AI product directories" },
  { num: 30, name: "AIGather", inputDomain: "aigather.in", group: "A. AI tools and AI product directories" },
  { num: 31, name: "AIMarketly", inputDomain: "aimarketly.com", group: "A. AI tools and AI product directories" },
  { num: 32, name: "AISO Tools", inputDomain: "aisotools.com", group: "A. AI tools and AI product directories" },
  { num: 33, name: "AIToolsMagic", inputDomain: "aitoolsmagic.com", group: "A. AI tools and AI product directories" },
  { num: 34, name: "Agent Rank", inputDomain: "agentrank.tech", group: "A. AI tools and AI product directories" },
  { num: 35, name: "AgentLaunch", inputDomain: "agentlaunch.tools", group: "A. AI tools and AI product directories" },
  { num: 36, name: "AiPikr", inputDomain: "aipikr.com", group: "A. AI tools and AI product directories" },
  { num: 37, name: "Aimyflow", inputDomain: "aimyflow.com", group: "A. AI tools and AI product directories" },
  { num: 38, name: "Alieradox", inputDomain: "alieradox.com", group: "A. AI tools and AI product directories" },
  { num: 39, name: "AllMCPs", inputDomain: "allmcps.com", group: "A. AI tools and AI product directories" },
  { num: 40, name: "AppCritica", inputDomain: "appcritica.com", group: "A. AI tools and AI product directories" },
  { num: 41, name: "Artificial Intelligence Directory", inputDomain: "artificialintelligencedirectory.site", group: "A. AI tools and AI product directories" },
  { num: 42, name: "CLAPSTORM", inputDomain: "clapstorm.com", group: "A. AI tools and AI product directories" },
  { num: 43, name: "Catch AI Information", inputDomain: "catchaiinfo.com", group: "A. AI tools and AI product directories" },
  { num: 44, name: "ChatableApps", inputDomain: "chatableapps.com", group: "A. AI tools and AI product directories" },
  { num: 45, name: "Content & Marketing", inputDomain: "content-and-marketing.com", group: "A. AI tools and AI product directories" },
  { num: 46, name: "Credible AI Tools", inputDomain: "credibleaitools.com", group: "A. AI tools and AI product directories" },
  { num: 47, name: "DayToDay AI", inputDomain: "daytoday.ai", group: "A. AI tools and AI product directories" },
  { num: 48, name: "Deekoya AI", inputDomain: "deekoyaai.in", group: "A. AI tools and AI product directories" },
  { num: 49, name: "Delv", inputDomain: "delv.tools", group: "A. AI tools and AI product directories" },
  { num: 50, name: "DigitalCreatorAI", inputDomain: "digitalcreatorai.com", group: "A. AI tools and AI product directories" },
  { num: 51, name: "DigitalHelp AI Tools", inputDomain: "digitalhelp.uno", group: "A. AI tools and AI product directories" },
  { num: 52, name: "Directory of Agents", inputDomain: "directoryofagents.com", group: "A. AI tools and AI product directories" },
  { num: 53, name: "DiscoverAI", inputDomain: "discoverai.tools", group: "A. AI tools and AI product directories" },
  { num: 54, name: "ExploreAI Tools", inputDomain: "exploreai.tools", group: "A. AI tools and AI product directories" },
  { num: 55, name: "FalcoScan", inputDomain: "falcoscan.com", group: "A. AI tools and AI product directories" },
  { num: 56, name: "FastPedia", inputDomain: "fastpedia.io", group: "A. AI tools and AI product directories" },
  { num: 57, name: "FindToolz", inputDomain: "findtoolz.com", group: "A. AI tools and AI product directories" },
  { num: 58, name: "Forward Future", inputDomain: "forwardfuture.com", group: "A. AI tools and AI product directories" },
  { num: 59, name: "FreeAIO", inputDomain: "freeaio.com", group: "A. AI tools and AI product directories" },
  { num: 60, name: "Future AI Toolbox", inputDomain: "futureaitoolbox.com", group: "A. AI tools and AI product directories" },
  { num: 61, name: "Generator AI Tools", inputDomain: "aigenerator.tools", group: "A. AI tools and AI product directories" },
  { num: 62, name: "Get AI Tools", inputDomain: "getaitools.site", group: "A. AI tools and AI product directories" },
  { num: 63, name: "Goze Tools", inputDomain: "goze.tools", group: "A. AI tools and AI product directories" },
  { num: 64, name: "JustPickAI", inputDomain: "justpickai.com", group: "A. AI tools and AI product directories" },
  { num: 65, name: "KeelTools", inputDomain: "keeltools.com", group: "A. AI tools and AI product directories" },
  { num: 66, name: "LargeMI", inputDomain: "largemi.com", group: "A. AI tools and AI product directories" },
  { num: 67, name: "LaunchToolsAI", inputDomain: "launchtoolsai.com", group: "A. AI tools and AI product directories" },
  { num: 68, name: "LeanVibe", inputDomain: "leanvibe.io", group: "A. AI tools and AI product directories" },
  { num: 69, name: "List Maro", inputDomain: "listmaro.com", group: "A. AI tools and AI product directories" },
  { num: 70, name: "ListAI", inputDomain: "listai.cc", group: "A. AI tools and AI product directories" },
  { num: 71, name: "Listed Startups", inputDomain: "listedstartups.com", group: "A. AI tools and AI product directories" },
  { num: 72, name: "Liteworker", inputDomain: "liteworker.ai", group: "A. AI tools and AI product directories" },
  { num: 73, name: "MCP Trove", inputDomain: "mcptrove.com", group: "A. AI tools and AI product directories" },
  { num: 74, name: "MakeItLast", inputDomain: "makeitla.st", group: "A. AI tools and AI product directories" },
  { num: 75, name: "Master AI Finder", inputDomain: "masteraifinder.com", group: "A. AI tools and AI product directories" },
  { num: 76, name: "Mridul.Tech AI Directory", inputDomain: "mridul.tech", group: "A. AI tools and AI product directories" },
  { num: 77, name: "NeedAITool", inputDomain: "needaitool.com", group: "A. AI tools and AI product directories" },
  { num: 78, name: "NeuronFeed", inputDomain: "neuronfeed.com", group: "A. AI tools and AI product directories" },
  { num: 79, name: "New AI Tools Today", inputDomain: "newaitoolstoday.com", group: "A. AI tools and AI product directories" },
  { num: 80, name: "Next Week AI", inputDomain: "nextweekai.com", group: "A. AI tools and AI product directories" },
  { num: 81, name: "Nextool", inputDomain: "nextool.ai", group: "A. AI tools and AI product directories" },
  { num: 82, name: "ProfitTools AI", inputDomain: "profittoolsai.com", group: "A. AI tools and AI product directories" },
  { num: 83, name: "PromptHive", inputDomain: "prompthive.pages.dev", group: "A. AI tools and AI product directories" },
  { num: 84, name: "ScriptByAI", inputDomain: "scriptbyai.com", group: "A. AI tools and AI product directories" },
  { num: 85, name: "Shipstry", inputDomain: "shipstry.com", group: "A. AI tools and AI product directories" },
  { num: 86, name: "Spotlitely", inputDomain: "spotlitely.com", group: "A. AI tools and AI product directories" },
  { num: 87, name: "Stackdrop", inputDomain: "getstackdrop.com", group: "A. AI tools and AI product directories" },
  { num: 88, name: "SuperPublic", inputDomain: "superpublic.org", group: "A. AI tools and AI product directories" },
  { num: 89, name: "TechReel", inputDomain: "techreel.in", group: "A. AI tools and AI product directories" },
  { num: 90, name: "ThatsMyAI", inputDomain: "thatsmy.ai", group: "A. AI tools and AI product directories" },
  { num: 91, name: "The Next AI", inputDomain: "thenextai.com", group: "A. AI tools and AI product directories" },
  { num: 92, name: "ToolDock", inputDomain: "tools.zalize.com", group: "A. AI tools and AI product directories" },
  { num: 93, name: "ToolGPT", inputDomain: "toolgpt.co", group: "A. AI tools and AI product directories" },
  { num: 94, name: "ToolVerity", inputDomain: "toolverity.com", group: "A. AI tools and AI product directories" },
  { num: 95, name: "Toolhunter", inputDomain: "toolhunter.ai", group: "A. AI tools and AI product directories" },
  { num: 96, name: "Tooloso", inputDomain: "tooloso.com", group: "A. AI tools and AI product directories" },
  { num: 97, name: "Tuvavo", inputDomain: "tuvavo.com", group: "A. AI tools and AI product directories" },
  { num: 98, name: "AI101 Tools", inputDomain: "ai101.tools", group: "A. AI tools and AI product directories" },
  { num: 99, name: "AIBrew", inputDomain: "aibrew.io", group: "A. AI tools and AI product directories" },
  { num: 100, name: "AIforme Wiki", inputDomain: "aiforme.wiki", group: "A. AI tools and AI product directories" },

  // B. Additional AI and specialist discovery sites — 40
  { num: 101, name: "AI Tools", inputDomain: "aitools.ai", group: "B. Additional AI and specialist discovery sites" },
  { num: 102, name: "AI Xplore", inputDomain: "aixplore.in", group: "B. Additional AI and specialist discovery sites" },
  { num: 103, name: "Vona AI Tools", inputDomain: "vonalab.com", group: "B. Additional AI and specialist discovery sites" },
  { num: 104, name: "AI App Review", inputDomain: "ai-appreview.com", group: "B. Additional AI and specialist discovery sites" },
  { num: 105, name: "AI Nav", inputDomain: "ai-nav.net", group: "B. Additional AI and specialist discovery sites" },
  { num: 106, name: "AI Sites Net", inputDomain: "ai-sites.net", group: "B. Additional AI and specialist discovery sites" },
  { num: 107, name: "AI Toolflow", inputDomain: "ai-toolflow.com", group: "B. Additional AI and specialist discovery sites" },
  { num: 108, name: "AI-Tools Directory", inputDomain: "ai-tools.directory", group: "B. Additional AI and specialist discovery sites" },
  { num: 109, name: "AIDir", inputDomain: "aidir.wiki", group: "B. Additional AI and specialist discovery sites" },
  { num: 110, name: "AI Directory Wiki", inputDomain: "aidirectory.wiki", group: "B. Additional AI and specialist discovery sites" },
  { num: 111, name: "AI Dream Hub", inputDomain: "aidreamhub.com", group: "B. Additional AI and specialist discovery sites" },
  { num: 112, name: "AI Dust", inputDomain: "aidust.io", group: "B. Additional AI and specialist discovery sites" },
  { num: 113, name: "AI for Developers", inputDomain: "aifordevelopers.org", group: "B. Additional AI and specialist discovery sites" },
  { num: 114, name: "AI Kaptan", inputDomain: "aikaptan.com", group: "B. Additional AI and specialist discovery sites" },
  { num: 115, name: "AI Match Pro", inputDomain: "aimatch.pro", group: "B. Additional AI and specialist discovery sites" },
  { num: 116, name: "AI Nave", inputDomain: "ainave.com", group: "B. Additional AI and specialist discovery sites" },
  { num: 117, name: "AI Pedia Hub", inputDomain: "aipediahub.com", group: "B. Additional AI and specialist discovery sites" },
  { num: 118, name: "AI Resource Pro", inputDomain: "airesource.pro", group: "B. Additional AI and specialist discovery sites" },
  { num: 119, name: "AI Respo", inputDomain: "airespo.com", group: "B. Additional AI and specialist discovery sites" },
  { num: 120, name: "AI Tools Guru", inputDomain: "aitoolguru.com", group: "B. Additional AI and specialist discovery sites" },
  { num: 121, name: "AI Tool List", inputDomain: "aitoollist.org", group: "B. Additional AI and specialist discovery sites" },
  { num: 122, name: "AI Tools Arena", inputDomain: "aitoolsarena.com", group: "B. Additional AI and specialist discovery sites" },
  { num: 123, name: "AI Tools Corner", inputDomain: "aitoolscorner.com", group: "B. Additional AI and specialist discovery sites" },
  { num: 124, name: "AI Tools Explorer", inputDomain: "aitoolsexplorer.com", group: "B. Additional AI and specialist discovery sites" },
  { num: 125, name: "AI Tools Magazine", inputDomain: "aitoolsmagazine.com", group: "B. Additional AI and specialist discovery sites" },
  { num: 126, name: "AI Tools Pin", inputDomain: "aitoolspin.com", group: "B. Additional AI and specialist discovery sites" },
  { num: 127, name: "AI Tools Prime", inputDomain: "aitoolsprime.com", group: "B. Additional AI and specialist discovery sites" },
  { num: 128, name: "AI Toolz", inputDomain: "aitoolz.net", group: "B. Additional AI and specialist discovery sites" },
  { num: 129, name: "AI XYZ", inputDomain: "aixyz.co", group: "B. Additional AI and specialist discovery sites" },
  { num: 130, name: "All AI Tool List", inputDomain: "allaitoollist.com", group: "B. Additional AI and specialist discovery sites" },
  { num: 131, name: "All AI Tools Tech", inputDomain: "allaitools.tech", group: "B. Additional AI and specialist discovery sites" },
  { num: 132, name: "All AI Website", inputDomain: "allaiwebsite.com", group: "B. Additional AI and specialist discovery sites" },
  { num: 133, name: "Allesora", inputDomain: "allesora.com", group: "B. Additional AI and specialist discovery sites" },
  { num: 134, name: "Altern AI", inputDomain: "altern.ai", group: "B. Additional AI and specialist discovery sites" },
  { num: 135, name: "Ankore", inputDomain: "ankore.io", group: "B. Additional AI and specialist discovery sites" },
  { num: 136, name: "Appiod", inputDomain: "appiod.com", group: "B. Additional AI and specialist discovery sites" },
  { num: 137, name: "Apps400", inputDomain: "apps400.com", group: "B. Additional AI and specialist discovery sites" },
  { num: 138, name: "Aura Plus Plus", inputDomain: "auraplusplus.com", group: "B. Additional AI and specialist discovery sites" },
  { num: 139, name: "Based Tools", inputDomain: "basedtools.ai", group: "B. Additional AI and specialist discovery sites" },
  { num: 140, name: "Beyond AI Tools", inputDomain: "beyondaitools.com", group: "B. Additional AI and specialist discovery sites" },

  // C. Startup, SaaS and product discovery — 35
  { num: 141, name: "Launch List", inputDomain: "launch-list.org", group: "C. Startup, SaaS and product discovery" },
  { num: 142, name: "Microlaunch", inputDomain: "microlaunch.net", group: "C. Startup, SaaS and product discovery" },
  { num: 143, name: "BAI Tools", inputDomain: "bai.tools", group: "C. Startup, SaaS and product discovery" },
  { num: 144, name: "aat.ee", inputDomain: "aat.ee", group: "C. Startup, SaaS and product discovery" },
  { num: 145, name: "SoloPush", inputDomain: "solopush.com", group: "C. Startup, SaaS and product discovery" },
  { num: 146, name: "AIAI Tools", inputDomain: "aiai.tools", group: "C. Startup, SaaS and product discovery" },
  { num: 147, name: "MakerHunt", inputDomain: "makerhunt.io", group: "C. Startup, SaaS and product discovery" },
  { num: 148, name: "Roozna", inputDomain: "roozna.com", group: "C. Startup, SaaS and product discovery" },
  { num: 149, name: "WhatTheAI", inputDomain: "whattheai.tech", group: "C. Startup, SaaS and product discovery" },
  { num: 150, name: "ToolTrove", inputDomain: "tooltrove.net", group: "C. Startup, SaaS and product discovery" },
  { num: 151, name: "Stellar Launch", inputDomain: "stellarlaunch.org", group: "C. Startup, SaaS and product discovery" },
  { num: 152, name: "SubmitBear", inputDomain: "submitbear.com", group: "C. Startup, SaaS and product discovery" },
  { num: 153, name: "FridayHunt", inputDomain: "fridayhunt.com", group: "C. Startup, SaaS and product discovery" },
  { num: 154, name: "AIGCLIST", inputDomain: "aigclist.com", group: "C. Startup, SaaS and product discovery" },
  { num: 155, name: "BuiltByMe", inputDomain: "builtbyme.io", group: "C. Startup, SaaS and product discovery" },
  { num: 156, name: "Solo Launches", inputDomain: "sololaunches.com", group: "C. Startup, SaaS and product discovery" },
  { num: 157, name: "PaveLaunch", inputDomain: "pavelaunch.com", group: "C. Startup, SaaS and product discovery" },
  { num: 158, name: "The Startup Project", inputDomain: "startupproject.org", group: "C. Startup, SaaS and product discovery" },
  { num: 159, name: "Lachief", inputDomain: "lachief.io", group: "C. Startup, SaaS and product discovery" },
  { num: 160, name: "MyCloudMedia Directory", inputDomain: "landing.mycloudmedia.co.uk", group: "C. Startup, SaaS and product discovery" },
  { num: 161, name: "The AI Navigator", inputDomain: "theainavigator.com", group: "C. Startup, SaaS and product discovery" },
  { num: 162, name: "LaunchLog", inputDomain: "launchlog.fun", group: "C. Startup, SaaS and product discovery" },
  { num: 163, name: "DropYourAI", inputDomain: "dropyourai.com", group: "C. Startup, SaaS and product discovery" },
  { num: 164, name: "AIToolboard", inputDomain: "aitoolboard.com", group: "C. Startup, SaaS and product discovery" },
  { num: 165, name: "The Jo AI", inputDomain: "thejoai.com", group: "C. Startup, SaaS and product discovery" },
  { num: 166, name: "CloudFindr", inputDomain: "cloudfindr.co", group: "C. Startup, SaaS and product discovery" },
  { num: 167, name: "Lion AI Box", inputDomain: "lionaibox.com", group: "C. Startup, SaaS and product discovery" },
  { num: 168, name: "AI Top Hub", inputDomain: "aitophub.com", group: "C. Startup, SaaS and product discovery" },
  { num: 169, name: "TheToolBus", inputDomain: "thetoolbus.ai", group: "C. Startup, SaaS and product discovery" },
  { num: 170, name: "Toolfound", inputDomain: "toolfound.com", group: "C. Startup, SaaS and product discovery" },
  { num: 171, name: "Tools.so", inputDomain: "tools.so", group: "C. Startup, SaaS and product discovery" },
  { num: 172, name: "Human or Not", inputDomain: "humanornot.co", group: "C. Startup, SaaS and product discovery" },
  { num: 173, name: "NextGenTools", inputDomain: "nextgentools.me", group: "C. Startup, SaaS and product discovery" },
  { num: 174, name: "aifeed.dev", inputDomain: "aifeed.dev", group: "C. Startup, SaaS and product discovery" },
  { num: 175, name: "NextPedia", inputDomain: "nextpedia.io", group: "C. Startup, SaaS and product discovery" },

  // D. SaaS, software and developer ecosystems — 25
  { num: 176, name: "Dynamic Business", inputDomain: "dynamicbusiness.com", group: "D. SaaS, software and developer ecosystems" },
  { num: 177, name: "Spoke", inputDomain: "spoke.com", group: "D. SaaS, software and developer ecosystems" },
  { num: 178, name: "KillerStartups", inputDomain: "killerstartups.com", group: "D. SaaS, software and developer ecosystems" },
  { num: 179, name: "What Launched Today", inputDomain: "whatlaunched.today", group: "D. SaaS, software and developer ecosystems" },
  { num: 180, name: "MagicBox Tools", inputDomain: "magicbox.tools", group: "D. SaaS, software and developer ecosystems" },
  { num: 181, name: "Indie Page", inputDomain: "indiepage.com", group: "D. SaaS, software and developer ecosystems" },
  { num: 182, name: "Huzzler", inputDomain: "huzzler.so", group: "D. SaaS, software and developer ecosystems" },
  { num: 183, name: "Spot SaaS", inputDomain: "spotsaas.com", group: "D. SaaS, software and developer ecosystems" },
  { num: 184, name: "MicroConf Connect", inputDomain: "microconf.com", group: "D. SaaS, software and developer ecosystems" },
  { num: 185, name: "Days Launch", inputDomain: "dayslaunch.com", group: "D. SaaS, software and developer ecosystems" },
  { num: 186, name: "Daily Pings", inputDomain: "dailypings.com", group: "D. SaaS, software and developer ecosystems" },
  { num: 187, name: "SaaS Hunt", inputDomain: "saashunt.com", group: "D. SaaS, software and developer ecosystems" },
  { num: 188, name: "Runa Capital ROSS Index", inputDomain: "runacapital.com", group: "D. SaaS, software and developer ecosystems" },
  { num: 189, name: "Remote Tools", inputDomain: "remote.tools", group: "D. SaaS, software and developer ecosystems" },
  { num: 190, name: "SaaS Landing Page", inputDomain: "saaslandingpage.com", group: "D. SaaS, software and developer ecosystems" },
  { num: 191, name: "Curated Design", inputDomain: "curated.design", group: "D. SaaS, software and developer ecosystems" },
  { num: 192, name: "eBool", inputDomain: "ebool.com", group: "D. SaaS, software and developer ecosystems" },
  { num: 193, name: "Micro SaaS Examples", inputDomain: "microsaasexamples.com", group: "D. SaaS, software and developer ecosystems" },
  { num: 194, name: "Proof Stories", inputDomain: "proofstories.io", group: "D. SaaS, software and developer ecosystems" },
  { num: 195, name: "Nocode Devs", inputDomain: "nocodedevs.com", group: "D. SaaS, software and developer ecosystems" },
  { num: 196, name: "SaaS Wheel", inputDomain: "saaswheel.com", group: "D. SaaS, software and developer ecosystems" },
  { num: 197, name: "Tools.design", inputDomain: "tools.design", group: "D. SaaS, software and developer ecosystems" },
  { num: 198, name: "Indie Tool", inputDomain: "indietool.io", group: "D. SaaS, software and developer ecosystems" },
  { num: 199, name: "Devhub", inputDomain: "devhub.com", group: "D. SaaS, software and developer ecosystems" },
  { num: 200, name: "Wavel", inputDomain: "wavel.ai", group: "D. SaaS, software and developer ecosystems" }
];

function extractCanonicalRoot(input) {
  let clean = input.toLowerCase().trim();
  clean = clean.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '');
  clean = clean.split('/')[0].split(':')[0];

  // Specific multi-part TLD handling
  const multiPartTlds = ['.co.uk', '.pages.dev', '.com.au', '.co.in', '.ac.in', '.org.uk'];
  for (const tld of multiPartTlds) {
    if (clean.endsWith(tld)) {
      const parts = clean.slice(0, -tld.length).split('.');
      return parts[parts.length - 1] + tld;
    }
  }

  const parts = clean.split('.');
  if (parts.length >= 2) {
    return parts.slice(-2).join('.');
  }
  return clean;
}

function loadMap(table, col, nameCol) {
  try {
    const rows = db.prepare(`SELECT ${col} as root, ${nameCol} as name FROM ${table}`).all();
    const map = new Map();
    rows.forEach(r => {
      if (r.root) map.set(r.root.toLowerCase().trim(), `${table}: ${r.name || ''}`);
    });
    return map;
  } catch (e) {
    return new Map();
  }
}

const acqMap = loadMap('acquisition_targets', 'root_domain', 'platform_name');
const cohortMap = loadMap('cohort_50_opportunities', 'root_domain', 'platform_name');
const b2Map = loadMap('batch2_prospects', 'root_domain', 'platform_name');
const b2bMap = loadMap('b2b_directory_profiles', 'platform_domain', 'platform_name');
const domainsMap = loadMap('domains', 'root_domain', 'name');
const backlinksMap = loadMap('backlinks', 'referring_domain', 'anchor_text');

// Also load Batch 4 candidates
const b4Map = new Map();
try {
  const b4 = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch4_classified_refined.json'), 'utf8'));
  b4.forEach(b => b4Map.set(b.canonicalRoot, `batch4: ${b.name}`));
} catch (e) {}

// Also load Batch 5 candidates
const b5Map = new Map();
try {
  const b5 = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch5_classified.json'), 'utf8'));
  b5.forEach(b => b5Map.set(b.domain, `batch5: ${b.name}`));
} catch (e) {}

console.log('=== Batch 6 Canonical Deduplication against SQLite & Batches 1–5 ===');
const dedupList = [];
const seenInBatch = new Map();

RAW_CANDIDATES.forEach(c => {
  const root = extractCanonicalRoot(c.inputDomain);
  let duplicateDetails = [];

  if (acqMap.has(root)) duplicateDetails.push(acqMap.get(root));
  if (cohortMap.has(root)) duplicateDetails.push(cohortMap.get(root));
  if (b2Map.has(root)) duplicateDetails.push(b2Map.get(root));
  if (b2bMap.has(root)) duplicateDetails.push(b2bMap.get(root));
  if (domainsMap.has(root)) duplicateDetails.push(domainsMap.get(root));
  if (backlinksMap.has(root)) duplicateDetails.push(backlinksMap.get(root));
  if (b4Map.has(root)) duplicateDetails.push(b4Map.get(root));
  if (b5Map.has(root)) duplicateDetails.push(b5Map.get(root));

  if (seenInBatch.has(root)) {
    duplicateDetails.push(`Intra-Batch 6 Duplicate of #${seenInBatch.get(root)}`);
  } else {
    seenInBatch.set(root, c.num);
  }

  const isDuplicate = duplicateDetails.length > 0;
  dedupList.push({
    num: c.num,
    name: c.name,
    inputDomain: c.inputDomain,
    canonicalRoot: root,
    group: c.group,
    isDuplicate,
    duplicateSource: isDuplicate ? duplicateDetails.join('; ') : 'NONE_UNIQUE'
  });
});

const dupes = dedupList.filter(d => d.isDuplicate);
const uniques = dedupList.filter(d => !d.isDuplicate);

console.log(`Total Candidates Received: ${dedupList.length}`);
console.log(`Canonical Duplicates Found: ${dupes.length}`);
console.log(`Genuinely New Unique Domains: ${uniques.length}`);

console.log('\nSample Duplicates:');
dupes.slice(0, 15).forEach(d => console.log(`  [#${d.num}] ${d.name} (${d.canonicalRoot}) -> ${d.duplicateSource}`));

fs.writeFileSync(path.join(__dirname, 'batch6_dedup_initial.json'), JSON.stringify(dedupList, null, 2), 'utf8');
console.log('\nSaved to backlink-engine/src/scripts/batch6_dedup_initial.json');
