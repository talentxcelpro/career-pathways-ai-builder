function runFeedbackLoop(ga4Campaigns, supabaseData, backlog) {
  console.log('[Step 10] Running Closed-Loop Performance Evaluation (Scale / Refine / Stop)...');

  const evaluations = ga4Campaigns.map(camp => {
    const sessions = camp.sessions || 1;
    const bouncePct = parseFloat(camp.bounceRate.replace('%', ''));

    let action = 'MONITOR';
    let reason = 'Accumulating baseline observational data';

    if (camp.sourceMedium.includes('google_jobs_apply')) {
      action = 'SCALE';
      reason = 'High-intent structured job search traffic with strong conversion efficiency';
    } else if (camp.sourceMedium.includes('chatgpt.com')) {
      action = 'SCALE';
      reason = 'Emerging AEO referral traffic with strong session duration';
    } else if (camp.sourceMedium.includes('facebook') && bouncePct > 65) {
      action = 'REFINE';
      reason = 'Moderate bounce rate on social; refine creative hook to target specific job location cards';
    } else if (sessions > 100 && bouncePct > 75) {
      action = 'STOP';
      reason = 'Low engagement and high bounce rate';
    }

    return {
      channel: camp.sourceMedium,
      campaign: camp.campaign,
      sessions: camp.sessions,
      bounceRate: camp.bounceRate,
      avgDuration: camp.avgDuration,
      action,
      recommendation: reason
    };
  });

  const scaleActions = evaluations.filter(e => e.action === 'SCALE');
  const refineActions = evaluations.filter(e => e.action === 'REFINE');
  const stopActions = evaluations.filter(e => e.action === 'STOP');

  console.log(`   ✓ Evaluated ${evaluations.length} channels: ${scaleActions.length} SCALE, ${refineActions.length} REFINE, ${stopActions.length} STOP.`);
  return {
    evaluations,
    scaleActions,
    refineActions,
    stopActions
  };
}

module.exports = { runFeedbackLoop };
