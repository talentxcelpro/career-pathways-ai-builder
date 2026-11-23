// src/services/publisher/OutreachGeneratorService.ts
// TalentXcel Global Embed Adoption Engine â€” Contextual Outreach Generator

import { PublisherCategory, OutreachDrafts } from '@/types/publisherAdoption';
import { EmbedAssetCategory } from '@/types/embed';

export class OutreachGeneratorService {
  private static instance: OutreachGeneratorService;

  private constructor() {}

  public static getInstance(): OutreachGeneratorService {
    if (!OutreachGeneratorService.instance) {
      OutreachGeneratorService.instance = new OutreachGeneratorService();
    }
    return OutreachGeneratorService.instance;
  }

  /**
   * Generates bespoke, honest, professional outreach materials for human review.
   * Guardrail: Never sends emails automatically. Every message is human-reviewed.
   */
  public generateDrafts(params: {
    publisherName: string;
    publisherDomain: string;
    category: PublisherCategory;
    targetPageUrl?: string;
    suggestedAssetTitle: string;
    suggestedEmbedCategory: EmbedAssetCategory;
    canonicalAssetUrl: string;
    embedIframeSnippet: string;
  }): OutreachDrafts {
    const {
      publisherName,
      publisherDomain,
      category,
      targetPageUrl,
      suggestedAssetTitle,
      canonicalAssetUrl,
      embedIframeSnippet
    } = params;

    const pageMention = targetPageUrl
      ? `your article on ${targetPageUrl}`
      : `your readers at ${publisherDomain}`;

    // 1. Email Subject
    const emailSubject = category === 'college'
      ? `Verified placement & ROI intelligence widget for ${publisherName}`
      : category === 'career'
      ? `Interactive career intelligence resource for ${publisherName} readers`
      : category === 'technology'
      ? `Embeddable tech hiring & skill index for ${publisherName}`
      : `Verified career intelligence widget for ${publisherName}`;

    // 2. Email Body
    const emailBody = `Hi ${publisherName} Team,

I came across your published resources on ${publisherDomain} and noticed your valuable coverage helping students and professionals navigate career choices.

At TalentXcel (https://www.talentxcel.in), we maintain verified public intelligence dossiers—including institutional placement statistics, Tier-2 tech hiring indices, and career transition benchmarks.

To support independent educators and career publishers, we built a zero-cost, lightweight embeddable widget for "${suggestedAssetTitle}". You can preview it live here:
${canonicalAssetUrl}

If you feel this live data would add practical value to ${pageMention}, you are welcome to embed it directly using this responsive HTML snippet:

${embedIframeSnippet}

The widget is completely free, loads asynchronously (<3KB), and automatically pulls verified updates without requiring ongoing maintenance from your web team.

If this is not relevant to your current editorial roadmap, please feel free to ignore this note—no further emails will follow.

Best regards,

TalentXcel Growth & Educational Distribution Team
contact@talentxcel.in | https://www.talentxcel.in`;

    // 3. Contact Form Message (Short, concise under 150 words)
    const contactFormMessage = `Hello ${publisherName} editorial team,

We admire your work on ${publisherDomain}. We have made our verified data asset ("${suggestedAssetTitle}") available as a free, lightweight embeddable widget for education and career publishers.

It provides live, responsive placement and skill benchmarks with zero host site impact:
Preview: ${canonicalAssetUrl}

If helpful for your readers, the embed code is freely available at https://www.talentxcel.in/embeds or can be shared directly with your web team.

Thank you for your time,
TalentXcel Educational Distribution Team`;

    // 4. Professional Social Message (LinkedIn / Twitter)
    const socialMessage = `Hi ${publisherName} team! Noticed your great coverage on career development at ${publisherDomain}. We've open-sourced a live, interactive data card for "${suggestedAssetTitle}" that publishers can embed for their readers: ${canonicalAssetUrl}. Free & zero host dependencies—thought it might be of interest!`;

    // 5. Follow-Up 1 (7 days later, polite & brief)
    const followUp1 = `Hi ${publisherName} Team,

Following up briefly on our note regarding the verified "${suggestedAssetTitle}" intelligence widget. 

We know how busy editorial and web schedules are—if you would like us to customize the layout (dark/light theme, compact width) to match ${publisherDomain}'s styling, we would be delighted to assist:
${canonicalAssetUrl}

If not interested, no worries at all! Have a great week.

Warm regards,
TalentXcel Educational Distribution Team`;

    // 6. Follow-Up 2 (Final courtesy check, 14 days later)
    const followUp2 = `Hi ${publisherName} Team,

Final quick check to see if the embeddable "${suggestedAssetTitle}" card would be useful for your students or readers this quarter.

If the timing isn't right, we will close this thread and will not trouble you further. Thank you for all you do for the career and education community!

Best regards,
TalentXcel Educational Distribution Team`;

    return {
      emailSubject,
      emailBody,
      contactFormMessage,
      socialMessage,
      followUp1,
      followUp2
    };
  }
}

export const outreachGenerator = OutreachGeneratorService.getInstance();
