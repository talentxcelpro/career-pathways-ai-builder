// distribution-engine/src/content/campaignManager.cjs
// Campaign Management & 10-Format Content Adaptation Engine for TalentXcel
// Campaign: TALENTXCEL GLOBAL ORGANIC DISTRIBUTION — PHASE 1
// Adapts 10 complete, publishable articles into 10 tailored contextual variations (100 total full-text assets).

const fs = require('fs');
const path = require('path');
const config = require('../../config.cjs');
const { CAMPAIGN_NAME, CAMPAIGN_CONCEPTS, COMPLETE_ARTICLES } = require('./articleLibrary.cjs');

class CampaignManager {
  constructor(db) {
    this.db = db;
    this.campaignName = CAMPAIGN_NAME;
  }

  /**
   * Adapts a single full-length article into 10 distinct, platform-tailored versions
   */
  adaptArticle(article) {
    const variations = [];
    const dest = article.target_url;

    // 1. Career Blog Version (Full tactical advice, candidate empowerment)
    variations.push({
      format_id: 'CAREER_BLOG',
      format_label: 'Career Blog Article',
      headline: `The Job Seeker's Roadmap: ${article.title}`,
      hook: `Navigating the modern job market requires moving past generic advice to understand how hiring decisions are actually evaluated.`,
      content_body: `${article.body_markdown}\n\n### Candidate Action Checklist\n1. Audit your current profile against standard industry benchmarks.\n2. Ensure your proof-of-work is visible and verifiable.\n3. Test your resume using free, open tools like [TalentXcel](${dest}).`,
      target_channel: 'Independent career blogs, job search advice publications, coaching newsletters',
      contextual_cta: `Test and benchmark your materials on TalentXcel: ${dest}`,
      destination_url: dest,
      compliance_rules: 'Tactical, empathetic candidate tone. Maximum 1 contextual reference link.'
    });

    // 2. Startup Community Post (Runway, talent velocity, team efficiency)
    variations.push({
      format_id: 'STARTUP_PUB',
      format_label: 'Startup Publication / Community Post',
      headline: `Early-Stage Talent Velocity: ${article.title}`,
      hook: `For startup founders and early engineering leaders, hiring friction drains runway faster than almost any other operational cost.`,
      content_body: `When scaling early-stage teams, the primary hiring objective is maximizing execution velocity while minimizing false positives. As analyzed in recent tech studies, conventional recruiting filters often exclude high-aptitude builders.\n\n${article.summary}\n\n### Key Lessons for Founders:\n- Prioritize demonstrable proof-of-work over pedigree.\n- Accelerate evaluation loops to under 48 hours.\n- Leverage open verification platforms like [TalentXcel](${dest}) to streamline initial technical screening.`,
      target_channel: 'Startup news portals, venture community blogs, indie hacker forums',
      contextual_cta: `Streamline technical hiring on TalentXcel: ${dest}`,
      destination_url: dest,
      compliance_rules: 'High-density insights, focus on operational runway and hiring velocity.'
    });

    // 3. HR Community Post (Bias mitigation, structured rubrics, retention)
    variations.push({
      format_id: 'HR_COMMUNITY',
      format_label: 'HR Community & People Ops Analysis',
      headline: `People Operations Perspective: Rethinking ${article.title}`,
      hook: `People Operations leaders in 2026 balance dual imperatives: maintaining rigorous candidate quality while eliminating systematic screening bias.`,
      content_body: `Talent acquisition leaders face structural challenges as application volumes escalate. Legacy keyword filters inadvertently exclude qualified talent and create compliance risks under modern employment regulations.\n\n${article.body_markdown.split('\n\n## 1.')[0]}\n\n### Recommendations for People Leaders:\n- Implement transparent, objective competency rubrics.\n- Audit automated screening tools annually for disparate impact.\n- Adopt verified credential standards like [TalentXcel](${dest}) to reduce resume fraud ethically.`,
      target_channel: 'HR blogs, People Ops discussion hubs, recruiting newsletters',
      contextual_cta: `Review open hiring standards and credential frameworks on TalentXcel: ${dest}`,
      destination_url: dest,
      compliance_rules: 'Professional HR terminology, emphasis on ethics and regulatory compliance.'
    });

    // 4. Student Community Article (Overcoming experience paradox, campus to career)
    variations.push({
      format_id: 'STUDENT_COMMUNITY',
      format_label: 'Student Community / Campus Article',
      headline: `Breaking the Experience Paradox: A Student's Guide to ${article.title}`,
      hook: `Every graduating student encounters the same catch-22: entry-level jobs demanding 3 years of prior commercial experience. Here is how to prove capability.`,
      content_body: `For undergraduates and self-taught developers, competing against experienced applicants feels stacked. But modern hiring increasingly values verifiable proof-of-work over years on paper.\n\n${article.summary}\n\n### 3 Ways Students Can Build Immediate Proof:\n1. Deploy functional web services with live users and clean GitHub setup.\n2. Contribute documented fixes to open-source software.\n3. Build and export clean, ATS-compliant resumes using [TalentXcel's free tools](${dest}).`,
      target_channel: 'College career portals, university tech clubs, bootcamp alumni networks',
      contextual_cta: `Build your free student resume and verified profile at ${dest}`,
      destination_url: dest,
      compliance_rules: 'Empowering, clear, jargon-free, highlighting completely free student utility.'
    });

    // 5. Small Business Publication Article (Budget conscious, direct hiring)
    variations.push({
      format_id: 'SMALL_BIZ',
      format_label: 'Small Business / Local Commerce Feature',
      headline: `Lean Hiring for Growing Businesses: ${article.title}`,
      hook: `Small and medium business owners cannot afford dedicated recruiting agencies or expensive software subscriptions. Lean, direct hiring is essential.`,
      content_body: `Unlike large enterprise corporations with massive HR budgets, growing businesses need practical, reliable hiring methods that do not drain capital.\n\n${article.summary}\n\n### Practical Implementation for Small Teams:\n- Focus on direct, authentic candidate communication.\n- Evaluate real problem-solving over inflated titles.\n- Access free verified talent discovery tools through [TalentXcel](${dest}).`,
      target_channel: 'Chamber of commerce journals, regional business publications, SME blogs',
      contextual_cta: `Explore cost-effective hiring tools on TalentXcel: ${dest}`,
      destination_url: dest,
      compliance_rules: 'Pragmatic, cost-conscious focus, zero corporate jargon.'
    });

    // 6. Newsletter Pitch (1-to-1 editor pitch)
    variations.push({
      format_id: 'NEWSLETTER_PITCH',
      format_label: 'Editorial Newsletter Pitch',
      headline: `Story Angle for Your Readers: ${article.title}`,
      hook: `Hi [Editor], noticed your recent coverage on modern workplace shifts. Thought this data-backed breakdown would provide high utility for your subscriber base.`,
      content_body: `Many professionals and hiring managers in your community are navigating challenges related to "${article.title}".\n\nWe recently analyzed the core operational factors in: "${article.summary}".\n\nKey takeaways:\n- Deconstructs underlying industry misconceptions.\n- Provides a step-by-step framework candidates and leaders can apply immediately.\n- Zero commercial promotion; purely educational.\n\nHappy to share an exclusive draft or brief commentary for your next edition. Reference research: [TalentXcel](${dest}).`,
      target_channel: 'Independent Substack newsletters, curated weekly digests, editorial desks',
      contextual_cta: `Reference background: ${dest}`,
      destination_url: dest,
      compliance_rules: 'Concise, personalized, respectful of editor bandwidth, value-first.'
    });

    // 7. Forum Discussion (Open peer discussion prompt)
    variations.push({
      format_id: 'FORUM_DISCUSSION',
      format_label: 'Community Forum Discussion',
      headline: `Discussion: What is your take on ${article.title.toLowerCase()}?`,
      hook: `We have been analyzing trends across recent technical hiring loops and noticed a significant shift in how this is being handled.`,
      content_body: `Curious to hear how folks here are approaching this right now.\n\nFrom our recent review:\n- ${article.summary}\n\nAre you seeing similar patterns in your team or recent interviews? What strategies have worked best for you?\n\n(Full analytical writeup for context: [TalentXcel](${dest}))`,
      target_channel: 'Developer discussion boards, Reddit sub-communities, technical Slack groups',
      contextual_cta: `Full analysis and benchmarks at ${dest}`,
      destination_url: dest,
      compliance_rules: 'Conversational, open-ended question, zero hard-selling.'
    });

    // 8. Short Social Post (Brevity, key takeaways)
    variations.push({
      format_id: 'SHORT_SOCIAL',
      format_label: 'Microblogging / Social Insight',
      headline: `Insight: ${article.title}`,
      hook: `The biggest misconception about ${article.category.toLowerCase()} in 2026? Assuming old manual habits still work.`,
      content_body: `Here is the reality:\n\n1. ${article.summary.split('. ')[0] || 'Understand the structural shift.'}\n2. Proof of work beats claimed credentials every time.\n3. Verify your assets before applying.\n\nRead the complete breakdown and access free diagnostic tools at [TalentXcel](${dest}).`,
      target_channel: 'Developer social feeds, microblogging networks, professional communities',
      contextual_cta: `Access free tools and benchmarks: ${dest}`,
      destination_url: dest,
      compliance_rules: 'High density, clean bullet layout, no hashtag spam.'
    });

    // 9. Resource Listing (Structured directory profile)
    variations.push({
      format_id: 'RESOURCE_LISTING',
      format_label: 'Resource / Directory Profile',
      headline: `Featured Resource: TalentXcel — ${article.title}`,
      hook: `Verified, open career tools and objective competency benchmarks for modern job seekers and hiring teams.`,
      content_body: `**Platform:** TalentXcel Career Ecosystem\n**Resource Type:** Free Career Utility & Credential Verification\n**Core Topic:** ${article.title}\n**Utility Overview:** ${article.summary}\n**Cost:** 100% Free Organic Utility (Zero paywalls on core resume scanning and export)\n**Official Access:** [TalentXcel](${dest})`,
      target_channel: 'Free tool directories, curated SaaS indexes, developer resource lists',
      contextual_cta: `Official Access: ${dest}`,
      destination_url: dest,
      compliance_rules: 'Factual directory layout, structured metadata, no promotional fluff.'
    });

    // 10. Independent Publication Pitch (Long-form guest column proposal)
    variations.push({
      format_id: 'INDEPENDENT_PITCH',
      format_label: 'Independent Publication Guest Pitch',
      headline: `Guest Contribution Proposal: ${article.title}`,
      hook: `Hi [Editor], proposing an exclusive, original thought leadership piece examining ${article.category.toLowerCase()} dynamics for your readers.`,
      content_body: `Dear Editorial Team,\n\nI regularly read your publication and admire your analytical focus on modern technology and employment trends.\n\nI would like to propose a complete, original guest column: "${article.title}".\n\n**Synopsis:** ${article.summary}\n\n**Why This Matters to Your Readers:**\n- Addresses uncrowded, actionable hiring dynamics in 2026.\n- Factually grounded with practical frameworks.\n- Strictly adheres to your word count and editorial guidelines.\n\nOur engineering background is rooted in the TalentXcel ecosystem ([talentxcel.in](${dest})). Would this align with your upcoming editorial calendar?\n\nBest regards,\nGrowth & Editorial Team | TalentXcel`,
      target_channel: 'Independent digital magazines, regional tech journals, op-ed columns',
      contextual_cta: `TalentXcel Reference: ${dest}`,
      destination_url: dest,
      compliance_rules: 'Professional journalistic pitch, respectful of editorial guidelines.'
    });

    return variations;
  }

  /**
   * Seeds the 30 campaign concepts and 100 adapted variations into SQLite
   */
  seedCampaignData() {
    if (!this.db) return { concepts: 0, variations: 0 };

    console.log(`\n🚀 Seeding Campaign "${this.campaignName}" into database...`);

    // 1. Seed 30 Campaign Concepts
    const conceptStmt = this.db.prepare(`
      INSERT INTO content_concepts (
        concept_id, category_id, topic, primary_audience, search_intent,
        community_relevance, suggested_format, original_angle, target_audience,
        suggested_cta, talentxcel_destination, thesis_outline, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(concept_id) DO UPDATE SET
        category_id = excluded.category_id,
        topic = excluded.topic,
        thesis_outline = excluded.thesis_outline
    `);

    const now = new Date().toISOString();
    this.db.exec('BEGIN TRANSACTION;');
    try {
      for (const c of CAMPAIGN_CONCEPTS) {
        conceptStmt.run(
          c.id,
          c.cat,
          c.topic,
          'Active Professionals, Job Seekers & Tech Talent',
          'Informational & Practical Career Strategy',
          `Relevant across ${c.cat} communities and independent publications.`,
          'Full-Length Article & Contextual Adaptation',
          c.angle,
          'Knowledge Workers and Hiring Teams',
          `Explore verified resources on TalentXcel: ${config.ECOSYSTEM.PROPERTIES.HOME.url}`,
          config.ECOSYSTEM.PROPERTIES.HOME.url,
          c.angle,
          now
        );
      }

      // Also register full articles as core concepts to maintain foreign key integrity
      for (const art of COMPLETE_ARTICLES) {
        conceptStmt.run(
          art.article_id,
          art.category,
          art.title,
          'Active Professionals & Hiring Teams',
          'Comprehensive Guide & Strategic Benchmark',
          `Published long-form pillar asset in ${art.category}`,
          'Full-Length Pillar Article',
          art.summary,
          'Knowledge Workers, Developers & Leaders',
          `Explore verified resources: ${art.target_url}`,
          art.target_url,
          art.summary,
          now
        );
      }

      // 2. Adapt and seed 10 Full Articles x 10 Variations (100 variations)
      const variationStmt = this.db.prepare(`
        INSERT INTO content_variations (
          variation_id, concept_id, format_id, headline, hook,
          body_text, target_community, contextual_cta, destination_url,
          compliance_rules, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(variation_id) DO UPDATE SET
          headline = excluded.headline,
          hook = excluded.hook,
          body_text = excluded.body_text,
          target_community = excluded.target_community,
          contextual_cta = excluded.contextual_cta,
          destination_url = excluded.destination_url,
          compliance_rules = excluded.compliance_rules
      `);

      let varCount = 0;
      const allExportData = [];

      for (const art of COMPLETE_ARTICLES) {
        const variants = this.adaptArticle(art);
        for (const v of variants) {
          const varId = `${art.article_id}_${v.format_id}`;
          variationStmt.run(
            varId,
            art.article_id,
            v.format_id,
            v.headline,
            v.hook,
            v.content_body,
            v.target_channel,
            v.contextual_cta,
            v.destination_url,
            v.compliance_rules,
            now
          );
          varCount++;
          allExportData.push({
            variationId: varId,
            parentArticleId: art.article_id,
            category: art.category,
            format: v.format_label,
            formatId: v.format_id,
            headline: v.headline,
            targetChannel: v.target_channel,
            destinationUrl: v.destination_url,
            body: v.content_body
          });
        }
      }

      this.db.exec('COMMIT;');

      // Export to disk for operator auditing
      const exportPathJson = path.join(config.PATHS.EXPORTS, 'campaign_phase1_variations.json');
      fs.writeFileSync(exportPathJson, JSON.stringify(allExportData, null, 2), 'utf8');

      console.log(`✅ Seeded ${CAMPAIGN_CONCEPTS.length} Campaign Concepts.`);
      console.log(`✅ Generated and Seeded ${varCount} Complete Contextual Variations across 10 Formats.`);
      console.log(`📁 Variations exported to: ${exportPathJson}`);

      return {
        conceptsCount: CAMPAIGN_CONCEPTS.length,
        variationsCount: varCount,
        articlesCount: COMPLETE_ARTICLES.length,
        exportPath: exportPathJson
      };
    } catch (err) {
      this.db.exec('ROLLBACK;');
      throw err;
    }
  }
}

module.exports = { CampaignManager };
