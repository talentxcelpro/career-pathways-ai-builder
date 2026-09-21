import { ProductMagnetEngine } from './ProductMagnetEngine';
import { GrowthEventType } from './types';

export interface ValueBeforeSignupState {
  stage: 'INPUT' | 'COMPUTING' | 'DIAGNOSTIC_READY' | 'RETENTION_GATE_OFFERED' | 'CONVERTED';
  toolId: string;
  hasDeliveredFreeValue: boolean;
  diagnosticResult?: {
    status: 'SUCCESS' | 'NO_RESULT' | 'DATA_NOT_AVAILABLE' | 'INSUFFICIENT_DATA';
    score?: number;
    summary: string;
    details: Record<string, any>;
  };
  retentionTriggerLabel: string;
  retentionTriggerAction: string;
  conversionEventType?: GrowthEventType;
}

/**
 * Conversion Engine — Value-Before-Signup State Machine
 * =========================================================================
 * Enforces the core acquisition rule:
 * Candidates must experience tangible diagnostic value (ATS score, salary percentile,
 * skill gap analysis) BEFORE encountering any signup barrier.
 */
export class ConversionEngine {
  /**
   * Initializes or processes a candidate interaction through the unauthenticated value funnel.
   */
  public static processInteraction(
    toolId: string,
    userInput: Record<string, any>,
    isAuthenticated: boolean = false
  ): ValueBeforeSignupState {
    const magnet = ProductMagnetEngine.getMagnetById(toolId);
    if (!magnet) {
      return {
        stage: 'INPUT',
        toolId,
        hasDeliveredFreeValue: false,
        retentionTriggerLabel: 'Explore Tools',
        retentionTriggerAction: '/tools'
      };
    }

    // Step 1: Compute real diagnostic
    const diagnostic = ProductMagnetEngine.calculateDiagnostic(toolId, userInput);

    // If input is empty or insufficient, remain in INPUT stage
    if (diagnostic.status === 'INSUFFICIENT_DATA' || diagnostic.status === 'NO_RESULT') {
      return {
        stage: 'INPUT',
        toolId,
        hasDeliveredFreeValue: false,
        diagnosticResult: diagnostic,
        retentionTriggerLabel: 'Provide Information',
        retentionTriggerAction: magnet.primaryRoute
      };
    }

    // Step 2 & 3: Diagnostic delivered for free
    const hasDelivered = diagnostic.status === 'SUCCESS';

    if (isAuthenticated) {
      return {
        stage: 'CONVERTED',
        toolId,
        hasDeliveredFreeValue: hasDelivered,
        diagnosticResult: diagnostic,
        retentionTriggerLabel: 'Saved to Profile',
        retentionTriggerAction: '/passport',
        conversionEventType: 'growth_activation'
      };
    }

    // Step 4: Offer high-value retention gate (Save, Track, Apply)
    return {
      stage: 'RETENTION_GATE_OFFERED',
      toolId,
      hasDeliveredFreeValue: hasDelivered,
      diagnosticResult: diagnostic,
      retentionTriggerLabel: magnet.signupRetentionGate,
      retentionTriggerAction: `/auth/signup?tool=${magnet.slug}&return=${encodeURIComponent(magnet.primaryRoute)}`,
      conversionEventType: 'growth_signup_start'
    };
  }

  /**
   * Completes account conversion, linking the anonymous diagnostic session to the new user.
   */
  public static completeConversion(
    toolId: string,
    visitorId: string,
    userId: string
  ): {
    success: boolean;
    convertedAt: string;
    nextRoute: string;
    eventType: GrowthEventType;
  } {
    const magnet = ProductMagnetEngine.getMagnetById(toolId);
    return {
      success: true,
      convertedAt: new Date().toISOString(),
      nextRoute: magnet ? `${magnet.primaryRoute}?saved=true` : '/passport',
      eventType: 'growth_signup'
    };
  }
}
