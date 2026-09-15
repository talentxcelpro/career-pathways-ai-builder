/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * Possibility Graph Engine
 * 
 * Top-level engine for the Possibility Graph.
 * Organizes possible paths, coordinates path simulation,
 * and outputs the Best Path resolution.
 */

import { UDXIntent } from '../core/IntentTypes';
import { PersonContext } from '../person/PersonContext';
import { BestPathResolver } from './BestPathResolver';
import { BestPathResolution } from './types';

export class PossibilityGraphEngine {
  public static resolve(
    intent: UDXIntent,
    person?: PersonContext
  ): BestPathResolution {
    return BestPathResolver.resolveBestPath(intent, person);
  }
}
