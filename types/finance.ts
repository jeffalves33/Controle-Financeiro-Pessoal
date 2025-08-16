export interface AnnualGoals {
  year: number
  expectedProfit: number
  monthlyBudget: number
  emergencyReserve: number
  plannedInvestments: number
}

export interface DailyTransaction {
  id: string
  date: string // YYYY-MM-DD format
  type: "income" | "expense" | "savings" | "investment"
  amount: number
  description: string
  category?: string
}

export interface MonthlyData {
  month: string // YYYY-MM format
  transactions: DailyTransaction[]
  totalIncome: number
  totalExpenses: number
  totalSavings: number
  totalInvestments: number
}

export interface FinanceData {
  goals: AnnualGoals[]
  transactions: DailyTransaction[]
}
