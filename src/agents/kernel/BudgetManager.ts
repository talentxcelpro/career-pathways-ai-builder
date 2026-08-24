// src/agents/kernel/BudgetManager.ts
// Departmental Budget Allocations, Quotas, and Real Spending Controls

class KernelBudgetManager {
  private departmentBudgetsINR = new Map<string, { monthlyCap: number; spentThisMonth: number }>([
    ['growth_marketing', { monthlyCap: 50000, spentThisMonth: 0 }],
    ['employer', { monthlyCap: 20000, spentThisMonth: 0 }],
    ['jobs', { monthlyCap: 15000, spentThisMonth: 0 }],
    ['candidates', { monthlyCap: 20000, spentThisMonth: 0 }],
    ['colleges', { monthlyCap: 20000, spentThisMonth: 0 }],
    ['claim1', { monthlyCap: 30000, spentThisMonth: 0 }],
    ['revenue', { monthlyCap: 10000, spentThisMonth: 0 }],
    ['product_engineering', { monthlyCap: 25000, spentThisMonth: 0 }],
    ['executive', { monthlyCap: 50000, spentThisMonth: 0 }],
  ]);

  canSpend(department: string, amountINR: number): boolean {
    const budget = this.departmentBudgetsINR.get(department);
    if (!budget) return false;
    return budget.spentThisMonth + amountINR <= budget.monthlyCap;
  }

  recordSpend(department: string, amountINR: number) {
    const budget = this.departmentBudgetsINR.get(department);
    if (budget) {
      budget.spentThisMonth += amountINR;
    }
  }

  getBudget(department: string) {
    return this.departmentBudgetsINR.get(department) || { monthlyCap: 0, spentThisMonth: 0 };
  }

  setMonthlyCap(department: string, capINR: number) {
    const budget = this.departmentBudgetsINR.get(department);
    if (budget) {
      budget.monthlyCap = capINR;
    }
  }
}

export const kernelBudgetManager = new KernelBudgetManager();
