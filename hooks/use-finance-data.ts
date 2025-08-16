"use client"

import { useState, useEffect } from "react"
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
    if (!user) {
      setIsLoading(false)
      return
    }

    const loadData = async () => {
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

        setData({ goals, transactions })
      } catch (error) {
        console.error("Error loading finance data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user])

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

      // Update local state
      setData((prev) => {
        const existingIndex = prev.goals.findIndex((g) => g.year === goals.year)
        if (existingIndex >= 0) {
          const newGoals = [...prev.goals]
          newGoals[existingIndex] = goals
          return { ...prev, goals: newGoals }
        } else {
          return { ...prev, goals: [...prev.goals, goals] }
        }
      })
    } catch (error) {
      console.error("Error saving goals:", error)
    }
  }

  const addTransaction = async (transaction: Omit<DailyTransaction, "id">) => {
    if (!user) return

    try {
      const { data: newTransaction, error } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          category: transaction.category,
          date: transaction.date,
        })
        .select()
        .single()

      if (error) throw error

      // Update local state
      const formattedTransaction: DailyTransaction = {
        id: newTransaction.id,
        type: newTransaction.type,
        amount: newTransaction.amount,
        description: newTransaction.description || "",
        category: newTransaction.category || "",
        date: newTransaction.date,
      }

      setData((prev) => ({
        ...prev,
        transactions: [...prev.transactions, formattedTransaction],
      }))
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

      // Update local state
      setData((prev) => ({
        ...prev,
        transactions: prev.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      }))
    } catch (error) {
      console.error("Error updating transaction:", error)
    }
  }

  const deleteTransaction = async (id: string) => {
    if (!user) return

    try {
      const { error } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id)

      if (error) throw error

      // Update local state
      setData((prev) => ({
        ...prev,
        transactions: prev.transactions.filter((t) => t.id !== id),
      }))
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
  }
}
