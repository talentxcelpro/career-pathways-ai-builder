// src/agents/email/ReplyClassifier.ts
// Inbound Intent Classifier for Autonomous Action Routing

import type { ReplyIntent } from './types';

export class ReplyClassifier {
  classify(subject: string, bodyText: string): ReplyIntent {
    const text = `${subject} ${bodyText}`.toLowerCase().trim();

    // 1. Unsubscribe / Stop Commands (Immediate Priority)
    if (
      text.includes('stop') ||
      text.includes('unsubscribe') ||
      text.includes('remove me') ||
      text.includes('do not contact') ||
      text.includes('dont contact') ||
      text.includes('take me off') ||
      text.includes('leave me alone')
    ) {
      return 'UNSUBSCRIBE_STOP';
    }

    // 2. Out of Office
    if (
      text.includes('out of office') ||
      text.includes('automatic reply') ||
      text.includes('auto-reply') ||
      text.includes('on annual leave') ||
      text.includes('away from my desk')
    ) {
      return 'OUT_OF_OFFICE';
    }

    // 3. Meeting Request
    if (
      text.includes('schedule a call') ||
      text.includes('book a call') ||
      text.includes('set up a meeting') ||
      text.includes('send calendar') ||
      text.includes('calendly') ||
      text.includes('availabilities') ||
      text.includes('google meet') ||
      text.includes('zoom link')
    ) {
      return 'MEETING_REQUESTED';
    }

    // 4. Payment Intent
    if (
      text.includes('how to pay') ||
      text.includes('payment link') ||
      text.includes('send invoice') ||
      text.includes('bank details') ||
      text.includes('gst details') ||
      text.includes('razorpay')
    ) {
      return 'PAYMENT_INTENT';
    }

    // 5. Support Request
    if (
      text.includes('cannot login') ||
      text.includes('cant login') ||
      text.includes('reset password') ||
      text.includes('error on page') ||
      text.includes('bug') ||
      text.includes('my resume is not loading') ||
      text.includes('help with my account')
    ) {
      return 'SUPPORT_REQUEST';
    }

    // 6. Positive Interest
    if (
      text.includes('interested') ||
      text.includes('send details') ||
      text.includes('send more info') ||
      text.includes('sounds good') ||
      text.includes('yes, please') ||
      text.includes('yes please') ||
      text.includes('tell me more') ||
      text.includes('share candidate') ||
      text.includes('lets connect') ||
      text.includes("let's connect") ||
      text.includes('share the dossier')
    ) {
      return 'INTERESTED';
    }

    // 7. Explicit Negative Interest
    if (
      text.includes('not interested') ||
      text.includes('not looking') ||
      text.includes('no thanks') ||
      text.includes('no thank you') ||
      text.includes('not at this time') ||
      text.includes('already have a vendor')
    ) {
      return 'NOT_INTERESTED';
    }

    return 'NEUTRAL_INQUIRY';
  }
}

export const coreReplyClassifier = new ReplyClassifier();
