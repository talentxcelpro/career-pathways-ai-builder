// Performance tracking utility
export class PerformanceTracker {
  private static startTimes = new Map<string, number>();
  private static metrics = new Map<string, number[]>();

  // Start timing a operation
  static start(label: string): void {
    this.startTimes.set(label, performance.now());
  }

  // End timing and record metric
  static end(label: string): number {
    const startTime = this.startTimes.get(label);
    if (!startTime) {
      console.warn(`No start time found for ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.startTimes.delete(label);

    // Store metric
    const existing = this.metrics.get(label) || [];
    existing.push(duration);
    this.metrics.set(label, existing);

    if ((import.meta as any)?.env?.MODE === 'development') {
      console.log(`⚡ ${label}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  // Get performance metrics
  static getMetrics(label?: string): Record<string, { avg: number; count: number; latest: number }> {
    const result: Record<string, { avg: number; count: number; latest: number }> = {};

    const metricsToProcess = label ? 
      [[label, this.metrics.get(label) || []] as [string, number[]]] : 
      Array.from(this.metrics.entries());

    for (const [key, values] of metricsToProcess) {
      if (Array.isArray(values) && values.length > 0) {
        result[key] = {
          avg: values.reduce((sum, val) => sum + val, 0) / values.length,
          count: values.length,
          latest: values[values.length - 1],
        };
      }
    }

    return result;
  }

  // Clear all metrics
  static clear(): void {
    this.startTimes.clear();
    this.metrics.clear();
  }

  // Track Web Vitals manually
  static trackWebVital(name: string, value: number): void {
    const existing = this.metrics.get(`webvital_${name}`) || [];
    existing.push(value);
    this.metrics.set(`webvital_${name}`, existing);

    if ((import.meta as any)?.env?.MODE === 'development') {
      console.log(`📊 ${name}: ${value.toFixed(2)}`);
    }
  }

  // Track navigation performance
  static trackNavigation(route: string, loadTime: number): void {
    this.trackWebVital(`navigation_${route}`, loadTime);
  }

  // Get performance report
  static getReport(): string {
    const metrics = this.getMetrics();
    let report = '📊 Performance Report:\n';
    
    for (const [label, data] of Object.entries(metrics)) {
      report += `${label}: ${data.latest.toFixed(2)}ms (avg: ${data.avg.toFixed(2)}ms, ${data.count} samples)\n`;
    }

    return report;
  }
}