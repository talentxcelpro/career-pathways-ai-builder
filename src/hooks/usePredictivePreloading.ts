/**
 * AI-Powered Route Predictor
 * Learns user navigation patterns and preloads likely next routes
 */

import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface RouteTransition {
  from: string;
  to: string;
  timestamp: number;
}

interface RoutePrediction {
  route: string;
  probability: number;
}

const STORAGE_KEY = 'route_history';
const MAX_HISTORY = 100;
const PREDICTION_THRESHOLD = 0.3;

class RoutePredictor {
  private history: RouteTransition[] = [];
  private transitionMatrix: Map<string, Map<string, number>> = new Map();
  private preloadedRoutes: Set<string> = new Set();

  constructor() {
    this.loadHistory();
    this.buildTransitionMatrix();
  }

  private loadHistory() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.history = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load route history:', error);
    }
  }

  private saveHistory() {
    try {
      const recent = this.history.slice(-MAX_HISTORY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
    } catch (error) {
      console.warn('Failed to save route history:', error);
    }
  }

  private buildTransitionMatrix() {
    this.transitionMatrix.clear();

    this.history.forEach((transition) => {
      if (!this.transitionMatrix.has(transition.from)) {
        this.transitionMatrix.set(transition.from, new Map());
      }

      const fromMap = this.transitionMatrix.get(transition.from)!;
      fromMap.set(transition.to, (fromMap.get(transition.to) || 0) + 1);
    });
  }

  recordTransition(from: string, to: string) {
    const transition: RouteTransition = {
      from,
      to,
      timestamp: Date.now(),
    };

    this.history.push(transition);
    this.saveHistory();
    this.buildTransitionMatrix();
  }

  predictNextRoutes(currentRoute: string): RoutePrediction[] {
    const transitions = this.transitionMatrix.get(currentRoute);
    if (!transitions) return [];

    const total = Array.from(transitions.values()).reduce((sum, count) => sum + count, 0);
    if (total === 0) return [];

    const predictions: RoutePrediction[] = [];

    transitions.forEach((count, route) => {
      const probability = count / total;
      if (probability >= PREDICTION_THRESHOLD) {
        predictions.push({ route, probability });
      }
    });

    return predictions.sort((a, b) => b.probability - a.probability);
  }

  async preloadRoute(route: string) {
    if (this.preloadedRoutes.has(route)) return;

    try {
      // Prefetch the route module
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);

      this.preloadedRoutes.add(route);
      console.log(`🔮 Preloaded route: ${route}`);
    } catch (error) {
      console.warn('Failed to preload route:', route, error);
    }
  }

  getPatterns() {
    const patterns: Record<string, { destinations: string[]; frequency: number }> = {};

    this.transitionMatrix.forEach((transitions, from) => {
      const total = Array.from(transitions.values()).reduce((sum, count) => sum + count, 0);
      const destinations = Array.from(transitions.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([route]) => route);

      patterns[from] = { destinations, frequency: total };
    });

    return patterns;
  }

  clearHistory() {
    this.history = [];
    this.transitionMatrix.clear();
    this.preloadedRoutes.clear();
    localStorage.removeItem(STORAGE_KEY);
  }
}

const routePredictor = new RoutePredictor();

export function usePredictivePreloading() {
  const location = useLocation();
  const previousRoute = useRef<string>('/');

  useEffect(() => {
    const currentRoute = location.pathname;

    // Record transition
    if (previousRoute.current !== currentRoute) {
      routePredictor.recordTransition(previousRoute.current, currentRoute);
      previousRoute.current = currentRoute;
    }

    // Predict and preload next likely routes
    const predictions = routePredictor.predictNextRoutes(currentRoute);
    
    predictions.slice(0, 2).forEach((prediction) => {
      console.log(
        `🎯 Predicted route: ${prediction.route} (${(prediction.probability * 100).toFixed(1)}%)`
      );
      routePredictor.preloadRoute(prediction.route);
    });
  }, [location]);

  const getNavigationPatterns = useCallback(() => {
    return routePredictor.getPatterns();
  }, []);

  const clearPredictions = useCallback(() => {
    routePredictor.clearHistory();
  }, []);

  return {
    getNavigationPatterns,
    clearPredictions,
  };
}

export { routePredictor };
