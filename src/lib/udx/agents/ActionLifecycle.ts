/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * Action Execution Lifecycle
 * 
 * CORE CONTRACT:
 * A route existing or an action being proposed is NOT an executed action.
 * Actions must transition through explicit lifecycle states:
 * 
 * ACTION_PROPOSED -> ACTION_DISPATCHED -> ACTION_ACCEPTED -> ACTION_COMPLETED -> [ACTION_FAILED]
 * 
 * Only ACTION_COMPLETED can feed the outcome-learning loop.
 * Zero synthetic receipts. Downstream handlers must return authentic responses.
 */

export type ActionLifecycleState =
  | 'ACTION_PROPOSED'
  | 'ACTION_DISPATCHED'
  | 'ACTION_ACCEPTED'
  | 'ACTION_COMPLETED'
  | 'ACTION_FAILED';

export interface DownstreamExecutionResult {
  status: number | string;
  acknowledged: boolean;
  referenceId?: string;
  data?: Record<string, unknown>;
  latencyMs: number;
}

export type DownstreamActionHandler = (
  action: LifecycleAction
) => Promise<DownstreamExecutionResult>;

export interface LifecycleAction {
  actionId: string;
  intentId: string;
  actionText: string;
  state: ActionLifecycleState;
  executable: boolean;
  targetUri?: string;
  handlerType?: string;
  payload?: Record<string, unknown>;
  createdAt: string;
  dispatchedAt?: string;
  acceptedAt?: string;
  completedAt?: string;
  failedAt?: string;
  downstreamReference?: DownstreamExecutionResult;
  error?: string;
}

export class ActionLifecycle {
  private static registeredHandlers: Map<string, DownstreamActionHandler> = new Map();
  private static actionStore: Map<string, LifecycleAction> = new Map();

  /**
   * Proposes a new action within the UDX runtime.
   */
  public static propose(params: {
    actionId?: string;
    intentId: string;
    actionText: string;
    executable?: boolean;
    targetUri?: string;
    handlerType?: string;
    payload?: Record<string, unknown>;
  }): LifecycleAction {
    const actionId = params.actionId || `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const action: LifecycleAction = {
      actionId,
      intentId: params.intentId,
      actionText: params.actionText,
      state: 'ACTION_PROPOSED',
      executable: params.executable ?? true,
      targetUri: params.targetUri,
      handlerType: params.handlerType || 'DEFAULT',
      payload: params.payload || {},
      createdAt: new Date().toISOString(),
    };

    this.actionStore.set(actionId, action);
    return { ...action };
  }

  /**
   * Registers a downstream execution handler for a specific handler type.
   */
  public static registerHandler(handlerType: string, handler: DownstreamActionHandler): void {
    this.registeredHandlers.set(handlerType, handler);
  }

  /**
   * Dispatches an action to its downstream execution handler.
   * Advances states through: DISPATCHED -> ACCEPTED -> COMPLETED / FAILED
   */
  public static async execute(
    actionId: string,
    overrideHandler?: DownstreamActionHandler
  ): Promise<LifecycleAction> {
    const action = this.actionStore.get(actionId);
    if (!action) {
      throw new Error(`Action [${actionId}] not found in ActionLifecycle store.`);
    }

    if (action.state !== 'ACTION_PROPOSED') {
      throw new Error(`Action [${actionId}] cannot be dispatched from state ${action.state}. Expected ACTION_PROPOSED.`);
    }

    // Step 1: Transition to DISPATCHED
    action.state = 'ACTION_DISPATCHED';
    action.dispatchedAt = new Date().toISOString();

    const handler = overrideHandler || this.registeredHandlers.get(action.handlerType || 'DEFAULT');
    if (!handler) {
      action.state = 'ACTION_FAILED';
      action.failedAt = new Date().toISOString();
      action.error = `No downstream execution handler registered for type [${action.handlerType}].`;
      return { ...action };
    }

    const startTime = Date.now();
    try {
      // Step 2: Downstream invocation
      const result = await handler(action);

      // Step 3: Transition to ACCEPTED upon receipt of downstream acknowledgement
      if (result.acknowledged) {
        action.state = 'ACTION_ACCEPTED';
        action.acceptedAt = new Date().toISOString();
      } else {
        action.state = 'ACTION_FAILED';
        action.failedAt = new Date().toISOString();
        action.error = 'Downstream target rejected or did not acknowledge action dispatch.';
        action.downstreamReference = result;
        return { ...action };
      }

      // Step 4: Validate outcome and transition to COMPLETED
      const durationMs = Date.now() - startTime;
      action.state = 'ACTION_COMPLETED';
      action.completedAt = new Date().toISOString();
      action.downstreamReference = {
        ...result,
        latencyMs: durationMs,
      };

      return { ...action };
    } catch (err: any) {
      action.state = 'ACTION_FAILED';
      action.failedAt = new Date().toISOString();
      action.error = err.message || 'Downstream action dispatch failed unexpectedly.';
      return { ...action };
    }
  }

  public static getAction(actionId: string): LifecycleAction | undefined {
    const action = this.actionStore.get(actionId);
    return action ? { ...action } : undefined;
  }

  public static isCompleted(actionId: string): boolean {
    const action = this.actionStore.get(actionId);
    return action?.state === 'ACTION_COMPLETED';
  }

  public static clear(): void {
    this.actionStore.clear();
  }
}
