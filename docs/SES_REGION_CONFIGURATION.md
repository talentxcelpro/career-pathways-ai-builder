# Amazon SES Region Configuration Guide

## Important: Check Your AWS Region

Your TalentXcel platform is configured to send emails through **Amazon SES in the US East (N. Virginia) region** by default.

### Where to Check Your Email Statistics

**❌ Wrong Region:** Europe (Stockholm) or other regions - You won't see any email statistics here
**✅ Correct Region:** US East (N. Virginia) - Check here for actual email sending data

### How to Change Your AWS Console Region

1. Log into your [AWS SES Console](https://console.aws.amazon.com/ses/)
2. In the top-right corner, click the region dropdown
3. Select **US East (N. Virginia)** - this is where your emails are being sent from
4. You should now see your actual email statistics and quota usage

### Current Configuration

- **Primary Region:** `us-east-1` (US East - N. Virginia)
- **Fallback Region:** `us-west-2` (US West - Oregon)
- **From Email:** TalentXcel <noreply@talentxcel.in>

### To Change the SES Region

If you want to send emails from a different region, update the edge function:

1. Go to `supabase/functions/send-email-notification/index.ts`
2. Change line 114: `let currentRegion = 'us-east-1';` to your preferred region
3. Update line 237: `currentRegion = 'us-west-2';` for your fallback region
4. Make sure your SES is set up and verified in the new region

### Common Regions

- `us-east-1` - US East (N. Virginia) ✅ **Currently Configured**
- `us-west-2` - US West (Oregon)
- `eu-north-1` - Europe (Stockholm)
- `eu-west-1` - Europe (Ireland) 
- `eu-central-1` - Europe (Frankfurt)
- `ap-southeast-1` - Asia Pacific (Singapore)

### Verification Requirements

When switching regions, ensure:
- [ ] Domain verification in the new region
- [ ] Email address verification in the new region  
- [ ] Sending limits configured in the new region
- [ ] Configuration sets (if used) created in the new region

### Monitoring Your Email Sending

Always check the same region where your emails are configured to be sent from. The statistics in other regions will show zero because no emails are being sent from those regions.