// src/lib/autonomous-os/viralLoopEngine.ts

export function computeEmpiricalKFactor(sharesInitiated: number, shareClicks: number, viralSignups: number, activeUsers: number): {
  invitationRate: number; // i = sharesInitiated / activeUsers
  clickRate: number; // clicks per share
  conversionRate: number; // viralSignups / shareClicks
  measuredKFactor: number; // viralSignups / activeUsers
} {
  if (activeUsers <= 0) return { invitationRate: 0, clickRate: 0, conversionRate: 0, measuredKFactor: 0 };

  const i = Number((sharesInitiated / activeUsers).toFixed(2));
  const clickRate = sharesInitiated > 0 ? Number((shareClicks / sharesInitiated).toFixed(2)) : 0;
  const convRate = shareClicks > 0 ? Number((viralSignups / shareClicks).toFixed(2)) : 0;
  const k = Number((viralSignups / activeUsers).toFixed(4));

  return {
    invitationRate: i,
    clickRate,
    conversionRate: convRate,
    measuredKFactor: k
  };
}
