"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useFinanceData } from "@/hooks/use-finance-data"
import { formatCurrency } from "@/lib/finance-utils"
import { TrendingUp, TrendingDown, Target, Calendar, BarChart3 } from "lucide-react"

interface MonthlyBreakdown {
  month: string
  monthName: string
  totalIncome: number
  totalExpenses: number
  totalSavings: number
  totalInvestments: number
  balance: number
}

export function AnnualView() {
  const { data, getGoalsForYear, getCurrentYear } = useFinanceData()
  const [selectedYear, setSelectedYear] = useState(getCurrentYear())

  // Get all available years from transactions
  const availableYears = Array.from(new Set(data.transactions.map((t) => new Date(t.date).getFullYear()))).sort(
    (a, b) => b - a,
  )

  if (availableYears.length === 0) {
    availableYears.push(getCurrentYear())
  }

  // Calculate annual totals
  const yearTransactions = data.transactions.filter((t) => new Date(t.date).getFullYear() === selectedYear)

  const annualTotals = yearTransactions.reduce(
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

  const annualBalance = annualTotals.totalIncome - annualTotals.totalExpenses
  const yearGoals = getGoalsForYear(selectedYear)

  // Calculate monthly breakdown
  const monthlyBreakdown: MonthlyBreakdown[] = []
  for (let month = 0; month < 12; month++) {
    const monthString = `${selectedYear}-${String(month + 1).padStart(2, "0")}`
    const monthTransactions = yearTransactions.filter((t) => t.date.startsWith(monthString))

    const monthTotals = monthTransactions.reduce(
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

    const monthName = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(new Date(selectedYear, month))

    monthlyBreakdown.push({
      month: monthString,
      monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      ...monthTotals,
      balance: monthTotals.totalIncome - monthTotals.totalExpenses,
    })
  }

  // Calculate progress percentages
  const incomeProgress = yearGoals ? (annualTotals.totalIncome / yearGoals.expectedProfit) * 100 : 0
  const expenseProgress = yearGoals ? (annualTotals.totalExpenses / (yearGoals.monthlyBudget * 12)) * 100 : 0
  const savingsProgress = yearGoals ? (annualTotals.totalSavings / yearGoals.emergencyReserve) * 100 : 0
  const investmentProgress = yearGoals ? (annualTotals.totalInvestments / yearGoals.plannedInvestments) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Year Selector */}
      <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number.parseInt(value))}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione o ano" />
        </SelectTrigger>
        <SelectContent>
          {availableYears.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Annual Balance Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Saldo Anual {selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${annualBalance >= 0 ? "text-chart-3" : "text-destructive"}`}>
              {formatCurrency(annualBalance)}
            </span>
            {annualBalance >= 0 ? (
              <TrendingUp className="h-5 w-5 text-chart-3" />
            ) : (
              <TrendingDown className="h-5 w-5 text-destructive" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{yearTransactions.length} transações registradas</p>
        </CardContent>
      </Card>

      {/* Annual Totals */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Receitas Anuais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-chart-3">{formatCurrency(annualTotals.totalIncome)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Gastos Anuais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-destructive">{formatCurrency(annualTotals.totalExpenses)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Poupança Anual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-chart-1">{formatCurrency(annualTotals.totalSavings)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Investimentos Anuais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-chart-4">{formatCurrency(annualTotals.totalInvestments)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress vs Annual Goals */}
      {yearGoals && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Progresso vs Metas Anuais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Lucro Esperado</span>
                <span>{Math.round(incomeProgress)}%</span>
              </div>
              <Progress value={Math.min(incomeProgress, 100)} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Atual: {formatCurrency(annualTotals.totalIncome)}</span>
                <span>Meta: {formatCurrency(yearGoals.expectedProfit)}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Gastos Anuais</span>
                <span>{Math.round(expenseProgress)}%</span>
              </div>
              <Progress value={Math.min(expenseProgress, 100)} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Atual: {formatCurrency(annualTotals.totalExpenses)}</span>
                <span>Limite: {formatCurrency(yearGoals.monthlyBudget * 12)}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Reserva de Emergência</span>
                <span>{Math.round(savingsProgress)}%</span>
              </div>
              <Progress value={Math.min(savingsProgress, 100)} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Atual: {formatCurrency(annualTotals.totalSavings)}</span>
                <span>Meta: {formatCurrency(yearGoals.emergencyReserve)}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Investimentos Anuais</span>
                <span>{Math.round(investmentProgress)}%</span>
              </div>
              <Progress value={Math.min(investmentProgress, 100)} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Atual: {formatCurrency(annualTotals.totalInvestments)}</span>
                <span>Meta: {formatCurrency(yearGoals.plannedInvestments)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Metas Definidas para {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          {yearGoals ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Lucro Esperado:</span>
                <div className="text-right">
                  <span className="font-semibold">{formatCurrency(yearGoals.expectedProfit)}</span>
                  <Badge variant={incomeProgress >= 100 ? "default" : "secondary"} className="ml-2 text-xs">
                    {incomeProgress >= 100 ? "Atingido" : `${Math.round(incomeProgress)}%`}
                  </Badge>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Orçamento Anual:</span>
                <div className="text-right">
                  <span className="font-semibold">{formatCurrency(yearGoals.monthlyBudget * 12)}</span>
                  <Badge variant={expenseProgress <= 100 ? "default" : "destructive"} className="ml-2 text-xs">
                    {expenseProgress <= 100 ? "Dentro do limite" : "Acima do limite"}
                  </Badge>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Reserva de Emergência:</span>
                <div className="text-right">
                  <span className="font-semibold">{formatCurrency(yearGoals.emergencyReserve)}</span>
                  <Badge variant={savingsProgress >= 100 ? "default" : "secondary"} className="ml-2 text-xs">
                    {savingsProgress >= 100 ? "Atingido" : `${Math.round(savingsProgress)}%`}
                  </Badge>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Investimentos Planejados:</span>
                <div className="text-right">
                  <span className="font-semibold">{formatCurrency(yearGoals.plannedInvestments)}</span>
                  <Badge variant={investmentProgress >= 100 ? "default" : "secondary"} className="ml-2 text-xs">
                    {investmentProgress >= 100 ? "Atingido" : `${Math.round(investmentProgress)}%`}
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">Nenhuma meta definida para {selectedYear}</p>
          )}
        </CardContent>
      </Card>

      {/* Monthly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Breakdown Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {monthlyBreakdown
              .filter(
                (month) =>
                  month.totalIncome > 0 ||
                  month.totalExpenses > 0 ||
                  month.totalSavings > 0 ||
                  month.totalInvestments > 0,
              )
              .map((month) => (
                <div key={month.month} className="border rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{month.monthName}</h4>
                    <span className={`font-semibold ${month.balance >= 0 ? "text-chart-3" : "text-destructive"}`}>
                      {formatCurrency(month.balance)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Receitas:</span>
                      <span className="text-chart-3">{formatCurrency(month.totalIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gastos:</span>
                      <span className="text-destructive">{formatCurrency(month.totalExpenses)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Poupança:</span>
                      <span className="text-chart-1">{formatCurrency(month.totalSavings)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Investimentos:</span>
                      <span className="text-chart-4">{formatCurrency(month.totalInvestments)}</span>
                    </div>
                  </div>
                </div>
              ))}
            {monthlyBreakdown.every(
              (month) =>
                month.totalIncome === 0 &&
                month.totalExpenses === 0 &&
                month.totalSavings === 0 &&
                month.totalInvestments === 0,
            ) && (
              <p className="text-muted-foreground text-center py-4">Nenhuma transação registrada em {selectedYear}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
