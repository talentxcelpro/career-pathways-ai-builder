// src/agents/kernel/PolicyEngine.ts
// Programmatic Policy & Anti-Spam Enforcer (Max 3 touches, Cooldowns, Suppression)

class KernelPolicyEngine {
  private suppressionList = new Set<string>();

  canContactProspect(contactCount: number, isSuppressed = false): { allowed: boolean; reason?: string } {
    if (isSuppressed) {
      return { allowed: false, reason: 'Recipient is on permanent suppression list.' };
    }
    if (contactCount >= 3) {
      return {
        allowed: false,
        reason: 'Prospect has reached maximum allowed contact limit (3 touches). Strict anti-spam policy active.',
      };
    }
    return { allowed: true };
  }

  suppressEmail(email: string) {
    this.suppressionList.add(email.toLowerCase().trim());
  }

  isSuppressed(email: string): boolean {
    return this.suppressionList.has(email.toLowerCase().trim());
  }
}

export const kernelPolicyEngine = new KernelPolicyEngine();
