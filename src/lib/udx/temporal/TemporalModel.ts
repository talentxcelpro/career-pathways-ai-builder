/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * Temporal Model
 * 
 * Source of truth for time-aware reasoning across:
 * - PAST (OBSERVED history & telemetry)
 * - NOW (VERIFIED_TRUTH live inventory & current state)
 * - FUTURE (DETECTED & FORECAST trajectories)
 */

import { HistoricalModel } from './HistoricalModel';
import { CurrentStateModel } from './CurrentStateModel';
import { FutureModel } from './FutureModel';

export class TemporalModel {
  private past: HistoricalModel;
  private now: CurrentStateModel;
  private future: FutureModel;

  constructor() {
    this.past = new HistoricalModel();
    this.now = new CurrentStateModel();
    this.future = new FutureModel();
  }

  public getPast(): HistoricalModel {
    return this.past;
  }

  public getNow(): CurrentStateModel {
    return this.now;
  }

  public getFuture(): FutureModel {
    return this.future;
  }
}
