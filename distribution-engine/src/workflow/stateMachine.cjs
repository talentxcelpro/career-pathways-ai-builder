// distribution-engine/src/workflow/stateMachine.cjs
// 13-State Workflow State Machine for TalentXcel Content Distribution Engine

const config = require('../../config.cjs');

class WorkflowStateMachine {
  constructor(db) {
    this.db = db;
    this.states = config.WORKFLOW_STATES;

    // Define permissible transitions
    this.allowedTransitions = {
      [this.states.DISCOVERED]: [
        this.states.DUPLICATE,
        this.states.NEEDS_VERIFICATION,
        this.states.REJECTED
      ],
      [this.states.DUPLICATE]: [], // Terminal
      [this.states.REJECTED]: [
        this.states.NEEDS_VERIFICATION // Allowed if appeals/re-evaluates
      ],
      [this.states.NEEDS_VERIFICATION]: [
        this.states.VERIFIED_FREE,
        this.states.VERIFIED_PAID,
        this.states.REJECTED
      ],
      [this.states.VERIFIED_PAID]: [], // Kept on file, not pursued in free phase
      [this.states.VERIFIED_FREE]: [
        this.states.APPROVED,
        this.states.REJECTED
      ],
      [this.states.APPROVED]: [
        this.states.CONTENT_READY,
        this.states.REJECTED
      ],
      [this.states.CONTENT_READY]: [
        this.states.SUBMISSION_READY,
        this.states.REJECTED
      ],
      [this.states.SUBMISSION_READY]: [
        this.states.SUBMITTED,
        this.states.FAILED
      ],
      [this.states.SUBMITTED]: [
        this.states.PUBLISHED,
        this.states.FAILED,
        this.states.FOLLOW_UP_REQUIRED
      ],
      [this.states.FOLLOW_UP_REQUIRED]: [
        this.states.SUBMITTED,
        this.states.PUBLISHED,
        this.states.FAILED
      ],
      [this.states.PUBLISHED]: [], // Terminal success
      [this.states.FAILED]: [
        this.states.SUBMISSION_READY,
        this.states.REJECTED
      ]
    };
  }

  /**
   * Validates if transition is legally allowed under state machine rules
   */
  canTransition(currentState, nextState, context = {}) {
    const validNextStates = this.allowedTransitions[currentState];
    if (!validNextStates || !validNextStates.includes(nextState)) {
      return { allowed: false, reason: `Transition from ${currentState} to ${nextState} is not permitted.` };
    }

    // Guard: Cannot move to PUBLISHED without verifiable publication URL
    if (nextState === this.states.PUBLISHED) {
      if (!context.publication_url || typeof context.publication_url !== 'string' || !context.publication_url.startsWith('http')) {
        return { allowed: false, reason: 'Cannot mark as PUBLISHED without a verifiable, live publication URL.' };
      }
    }

    // Guard: Cannot move to APPROVED if score < 70
    if (nextState === this.states.APPROVED) {
      if (context.overall_score !== undefined && context.overall_score < 70) {
        return { allowed: false, reason: `Cannot approve platform with score ${context.overall_score} (< 70 threshold).` };
      }
    }

    return { allowed: true };
  }

  /**
   * Executes state transition in database with full audit integrity
   */
  transition(platformId, nextState, context = {}) {
    if (!this.db) return false;

    const row = this.db.prepare('SELECT submission_status, overall_score FROM platforms WHERE platform_id = ?').get(platformId);
    if (!row) {
      throw new Error(`Platform ${platformId} not found`);
    }

    const currentState = row.submission_status;
    const check = this.canTransition(currentState, nextState, { ...context, overall_score: row.overall_score });

    if (!check.allowed) {
      throw new Error(`Invalid transition: ${check.reason}`);
    }

    const now = new Date().toISOString();
    let query = 'UPDATE platforms SET submission_status = ?, last_verified_at = ?';
    const params = [nextState, now];

    if (nextState === this.states.PUBLISHED) {
      query += ', publication_url = ?, publication_date = ?';
      params.push(context.publication_url, now);
    } else if (nextState === this.states.SUBMITTED) {
      query += ', submission_date = ?';
      params.push(now);
    }

    if (context.notes) {
      query += ", notes = coalesce(notes, '') || ' | ' || ?";
      params.push(context.notes);
    }

    query += ' WHERE platform_id = ?';
    params.push(platformId);

    const stmt = this.db.prepare(query);
    stmt.run(...params);
    return true;
  }
}

module.exports = { WorkflowStateMachine };
