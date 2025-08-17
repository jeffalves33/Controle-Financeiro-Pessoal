"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { FinanceData, AnnualGoals, DailyTransaction, MonthlyData } from "@/types/finance"

const STORAGE_KEY = "finance-control-data"

const defaultData: FinanceData = {
  goals: [],
  transactions: [],
}

export function useFinanceData() {
  const [data, setData] = useState<FinanceData>(defaultData)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  const loadData = useCallback(async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    console.log("[v0] Loading finance data...")
    try {
      // Load goals
      const { data: goalsData, error: goalsError } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("year", { ascending: false })

      if (goalsError) throw goalsError

      // Load transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })

      if (transactionsError) throw transactionsError

      // Transform data to match existing types
      const goals: AnnualGoals[] = (goalsData || []).map((goal) => ({
        year: goal.year,
        expectedProfit: goal.annual_income,
        monthlyBudget: goal.monthly_budget,
        emergencyReserve: goal.emergency_reserve,
        plannedInvestments: goal.planned_investments,
      }))

      const transactions: DailyTransaction[] = (transactionsData || []).map((transaction) => ({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description || "",
        category: transaction.category || "",
        date: transaction.date,
      }))

      console.log("[v0] Data loaded:", { goals: goals.length, transactions: transactions.length })
      setData({ goals, transactions })
    } catch (error) {
      console.error("Error loading finance data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Load data from localStorage on mount
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (!user) return

    console.log("[v0] Setting up subscriptions for user:", user.id)

    const goalsSubscription = supabase
      .channel(`goals_changes_${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "goals", filter: `user_id=eq.${user.id}` },
        (payload) => {
          console.log("[v0] Goals changed:", payload)
          loadData()
        },
      )
      .subscribe()

    const transactionsSubscription = supabase
      .channel(`transactions_changes_${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions", filter: `user_id=eq.${user.id}` },
        (payload) => {
          console.log("[v0] Transactions changed:", payload)
          loadData()
        },
      )
      .subscribe()

    return () => {
      console.log("[v0] Unsubscribing from channels")
      goalsSubscription.unsubscribe()
      transactionsSubscription.unsubscribe()
    }
  }, [user, loadData])

  // Save data to localStorage whenever data changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch (error) {
        console.error("Error saving finance data:", error)
      }
    }
  }, [data, isLoading])

  const addOrUpdateGoals = async (goals: AnnualGoals) => {
    if (!user) return

    try {
      const { error } = await supabase.from("goals").upsert({
        user_id: user.id,
        year: goals.year,
        annual_income: goals.expectedProfit,
        monthly_budget: goals.monthlyBudget,
        emergency_reserve: goals.emergencyReserve,
        planned_investments: goals.plannedInvestments,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      // Data will be updated automatically via subscription
    } catch (error) {
      console.error("Error saving goals:", error)
    }
  }

  const addTransaction = async (transaction: Omit<DailyTransaction, "id">) => {
    if (!user) return

    console.log("[v0] Adding transaction:", transaction)
    try {
      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        date: transaction.date,
      })

      if (error) throw error
      console.log("[v0] Transaction added successfully")

      // Force refresh after a short delay to ensure data is updated
      setTimeout(() => {
        loadData()
      }, 500)
    } catch (error) {
      console.error("Error adding transaction:", error)
    }
  }

  const updateTransaction = async (id: string, updates: Partial<DailyTransaction>) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from("transactions")
        .update({
          type: updates.type,
          amount: updates.amount,
          description: updates.description,
          category: updates.category,
          date: updates.date,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) throw error

      // Data will be updated automatically via subscription
    } catch (error) {
      console.error("Error updating transaction:", error)
    }
  }

  const deleteTransaction = async (id: string) => {
    if (!user) return

    try {
      const { error } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id)

      if (error) throw error

      // Data will be updated automatically via subscription
    } catch (error) {
      console.error("Error deleting transaction:", error)
    }
  }

  const getGoalsForYear = (year: number): AnnualGoals | undefined => {
    return data.goals.find((g) => g.year === year)
  }

  const getMonthlyData = (month: string): MonthlyData => {
    const monthTransactions = data.transactions.filter((t) => t.date.startsWith(month))

    const totals = monthTransactions.reduce(
      (acc, transaction) => {
        switch (transaction.type) {
          case "income":
            acc.totalIncome += transaction.amount
            break
          case "expense":
            acc.totalExpenses += transaction.amount
            break
          case "savings":
            acc.totalSavings += transaction.amount
            break
          case "investment":
            acc.totalInvestments += transaction.amount
            break
        }
        return acc
      },
      {
        totalIncome: 0,
        totalExpenses: 0,
        totalSavings: 0,
        totalInvestments: 0,
      },
    )

    return {
      month,
      transactions: monthTransactions,
      ...totals,
    }
  }

  const getAnnualData = (year: number) => {
    const yearTransactions = data.transactions.filter((t) => t.date.startsWith(year.toString()))

    const totals = yearTransactions.reduce(
      (acc, transaction) => {
        switch (transaction.type) {
          case "income":
            acc.totalIncome += transaction.amount
            break
          case "expense":
            acc.totalExpenses += transaction.amount
            break
          case "savings":
            acc.totalSavings += transaction.amount
            break
          case "investment":
            acc.totalInvestments += transaction.amount
            break
        }
        return acc
      },
      {
        totalIncome: 0,
        totalExpenses: 0,
        totalSavings: 0,
        totalInvestments: 0,
      },
    )

    const netBalance = totals.totalIncome - totals.totalExpenses - totals.totalSavings - totals.totalInvestments

    return {
      year,
      transactions: yearTransactions,
      ...totals,
      netBalance,
    }
  }

  const getMonthlyBreakdown = (year: number) => {
    const months = []
    for (let month = 1; month <= 12; month++) {
      const monthStr = `${year}-${String(month).padStart(2, "0")}`
      const monthData = getMonthlyData(monthStr)
      const netBalance =
        monthData.totalIncome - monthData.totalExpenses - monthData.totalSavings - monthData.totalInvestments
      months.push({
        ...monthData,
        netBalance,
      })
    }
    return months
  }

  const getMonthsWithData = (): string[] => {
    const monthsSet = new Set<string>()
    data.transactions.forEach((transaction) => {
      const month = transaction.date.substring(0, 7) // YYYY-MM
      monthsSet.add(month)
    })
    return Array.from(monthsSet).sort().reverse()
  }

  const getYearsWithData = (): number[] => {
    const yearsSet = new Set<number>()
    data.transactions.forEach((transaction) => {
      const year = Number.parseInt(transaction.date.substring(0, 4))
      yearsSet.add(year)
    })
    data.goals.forEach((goal) => {
      yearsSet.add(goal.year)
    })
    return Array.from(yearsSet).sort().reverse()
  }

  const getCurrentMonth = (): string => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  }

  const getCurrentYear = (): number => {
    return new Date().getFullYear()
  }

  return {
    data,
    isLoading,
    user,
    addOrUpdateGoals,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getGoalsForYear,
    getMonthlyData,
    getCurrentMonth,
    getCurrentYear,
    getAnnualData,
    getMonthlyBreakdown,
    getMonthsWithData,
    getYearsWithData,
    refreshData: loadData,
  }
}
