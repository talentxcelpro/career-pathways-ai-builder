/**
 * Performance budget monitoring and enforcement
 */

interface PerformanceBudget {
  lcp: number; // Largest Contentful Paint
  fcp: number; // First Contentful Paint
  cls: number; // Cumulative Layout Shift
  fid: number; // First Input Delay
  ttfb: number; // Time to First Byte
  inp: number; // Interaction to Next Paint
}

const performanceBudget: PerformanceBudget = {
  lcp: 2500,   // 2.5s
  fcp: 1800,   // 1.8s
  cls: 0.1,    // 0.1
  fid: 100,    // 100ms
  ttfb: 800,   // 800ms
  inp: 200,    // 200ms
};

interface PerformanceMetrics {
  lcp?: number;
  fcp?: number;
  cls?: number;
  fid?: number;
  ttfb?: number;
  inp?: number;
}

export class PerformanceBudgetMonitor {
  private metrics: PerformanceMetrics = {};
  private violations: string[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // LCP Observer
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.metrics.lcp = lastEntry.startTime;
          this.checkBudget('lcp', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // FCP Observer
        const fcpObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.fcp = entry.startTime;
              this.checkBudget('fcp', entry.startTime);
            }
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });

        // CLS Observer
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.metrics.cls = clsValue;
          this.checkBudget('cls', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // FID Observer
        const fidObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            const fidValue = entry.processingStart - entry.startTime;
            this.metrics.fid = fidValue;
            this.checkBudget('fid', fidValue);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // INP Observer (if supported)
        try {
          const inpObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry: any) => {
              this.metrics.inp = entry.duration;
              this.checkBudget('inp', entry.duration);
            });
          });
          inpObserver.observe({ entryTypes: ['event'] });
        } catch (e) {
          // INP not supported in this browser
        }

      } catch (error) {
        console.warn('Performance observers not fully supported:', error);
      }
    }

    // TTFB from Navigation Timing
    if ('performance' in window && performance.getEntriesByType) {
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntries.length > 0) {
        const ttfb = navEntries[0].responseStart - navEntries[0].requestStart;
        this.metrics.ttfb = ttfb;
        this.checkBudget('ttfb', ttfb);
      }
    }
  }

  private checkBudget(metric: keyof PerformanceBudget, value: number) {
    const budget = performanceBudget[metric];
    const isViolation = value > budget;
    
    if (isViolation) {
      const violation = `${metric.toUpperCase()}: ${Math.round(value)}${metric === 'cls' ? '' : 'ms'} exceeds budget of ${budget}${metric === 'cls' ? '' : 'ms'}`;
      this.violations.push(violation);
      
      // Log violation in development
      if (import.meta.env.DEV) {
        console.warn('🚨 Performance Budget Violation:', violation);
      }
      
      // Report to analytics in production
      if (!import.meta.env.DEV && window.gtag) {
        window.gtag('event', 'performance_budget_violation', {
          metric,
          value: Math.round(value),
          budget,
          violation_severity: this.getViolationSeverity(metric, value, budget)
        });
      }
    }

    // Log success in development
    if (import.meta.env.DEV && !isViolation) {
      console.log(`✅ ${metric.toUpperCase()}: ${Math.round(value)}${metric === 'cls' ? '' : 'ms'} (within budget)`);
    }
  }

  private getViolationSeverity(metric: keyof PerformanceBudget, value: number, budget: number): 'low' | 'medium' | 'high' | 'critical' {
    const ratio = value / budget;
    if (ratio > 5) return 'critical';
    if (ratio > 3) return 'high';
    if (ratio > 2) return 'medium';
    return 'low';
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getViolations(): string[] {
    return [...this.violations];
  }

  public getBudgetStatus(): { metric: string; value: number; budget: number; status: 'pass' | 'fail' }[] {
    return Object.entries(performanceBudget).map(([metric, budget]) => ({
      metric,
      value: this.metrics[metric as keyof PerformanceMetrics] || 0,
      budget,
      status: (this.metrics[metric as keyof PerformanceMetrics] || 0) <= budget ? 'pass' : 'fail'
    }));
  }

  public generateReport(): string {
    const status = this.getBudgetStatus();
    const violations = this.getViolations();
    
    let report = '📊 Performance Budget Report\n';
    report += '================================\n\n';
    
    status.forEach(({ metric, value, budget, status }) => {
      const icon = status === 'pass' ? '✅' : '❌';
      const unit = metric === 'cls' ? '' : 'ms';
      report += `${icon} ${metric.toUpperCase()}: ${Math.round(value)}${unit} (budget: ${budget}${unit})\n`;
    });
    
    if (violations.length > 0) {
      report += '\n🚨 Budget Violations:\n';
      violations.forEach(violation => {
        report += `• ${violation}\n`;
      });
    }
    
    return report;
  }
}

// Global instance
export const performanceBudgetMonitor = new PerformanceBudgetMonitor();

// Development helper
if (import.meta.env.DEV) {
  // @ts-ignore
  window.performanceBudget = performanceBudgetMonitor;
  
  // Log budget status after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      console.log(performanceBudgetMonitor.generateReport());
    }, 3000);
  });
}