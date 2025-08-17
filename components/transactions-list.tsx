"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFinanceData } from "@/hooks/use-finance-data"
import { formatCurrency, formatDate } from "@/lib/finance-utils"
import { TrendingUp, TrendingDown, PiggyBank, Target, Trash2, Filter, Edit3, PieChart } from "lucide-react"
import { EditTransactionModal } from "./edit-transaction-modal"
import type { DailyTransaction } from "@/types/finance"

const transactionIcons = {
  income: TrendingUp,
  expense: TrendingDown,
  savings: PiggyBank,
  investment: Target,
}

const transactionColors = {
  income: "text-chart-3",
  expense: "text-destructive",
  savings: "text-chart-1",
  investment: "text-chart-4",
}

const transactionLabels = {
  income: "Receita",
  expense: "Gasto",
  savings: "Poupança",
  investment: "Investimento",
}

export function TransactionsList() {
  const {
    getMonthlyData,
    getAnnualData,
    deleteTransaction,
    getCurrentMonth,
    getCurrentYear,
    getMonthsWithData,
    getYearsWithData,
  } = useFinanceData()

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [selectedYear, setSelectedYear] = useState(getCurrentYear())
  const [view, setView] = useState<"monthly" | "annual">("monthly")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [editingTransaction, setEditingTransaction] = useState<DailyTransaction | null>(null)

  const monthsWithData = getMonthsWithData()
  const yearsWithData = getYearsWithData()

  const monthlyData = getMonthlyData(selectedMonth)
  const annualData = getAnnualData(selectedYear)

  // Filter transactions by type
  const transactions = view === "monthly" ? monthlyData.transactions : annualData.transactions
  const filteredTransactions = typeFilter === "all" ? transactions : transactions.filter((t) => t.type === typeFilter)

  const sortedTransactions = filteredTransactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  const analytics = {
    totalIncome: transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0),
    totalSavings: transactions.filter((t) => t.type === "savings").reduce((sum, t) => sum + t.amount, 0),
    totalInvestments: transactions.filter((t) => t.type === "investment").reduce((sum, t) => sum + t.amount, 0),
  }

  const expensesByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, t) => {
        const category = t.category || "Sem categoria"
        acc[category] = (acc[category] || 0) + t.amount
        return acc
      },
      {} as Record<string, number>,
    )

  const topExpenseCategories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const handleDeleteTransaction = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta transação?")) {
      deleteTransaction(id)
    }
  }

  const handleEditTransaction = (transaction: DailyTransaction) => {
    setEditingTransaction(transaction)
  }

  const formatMonthLabel = (month: string) => {
    const [year, monthNum] = month.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(monthNum) - 1)
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
  }

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          variant={view === "monthly" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("monthly")}
          className="flex-1"
        >
          Mensal
        </Button>
        <Button
          variant={view === "annual" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("annual")}
          className="flex-1"
        >
          Anual
        </Button>
      </div>

      {/* Period Selector */}
      {view === "monthly" ? (
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o mês" />
          </SelectTrigger>
          <SelectContent>
            {monthsWithData.map((month) => (
              <SelectItem key={month} value={month}>
                {formatMonthLabel(month)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number.parseInt(value))}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o ano" />
          </SelectTrigger>
          <SelectContent>
            {yearsWithData.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-chart-3/10 border-chart-3/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-chart-3" />
              <span className="text-sm font-medium">Receitas</span>
            </div>
            <p className="text-lg font-bold text-chart-3 mt-1">{formatCurrency(analytics.totalIncome)}</p>
          </CardContent>
        </Card>

        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium">Gastos</span>
            </div>
            <p className="text-lg font-bold text-destructive mt-1">{formatCurrency(analytics.totalExpenses)}</p>
          </CardContent>
        </Card>

        <Card className="bg-chart-1/10 border-chart-1/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-4 w-4 text-chart-1" />
              <span className="text-sm font-medium">Poupança</span>
            </div>
            <p className="text-lg font-bold text-chart-1 mt-1">{formatCurrency(analytics.totalSavings)}</p>
          </CardContent>
        </Card>

        <Card className="bg-chart-4/10 border-chart-4/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-chart-4" />
              <span className="text-sm font-medium">Investimentos</span>
            </div>
            <p className="text-lg font-bold text-chart-4 mt-1">{formatCurrency(analytics.totalInvestments)}</p>
          </CardContent>
        </Card>
      </div>

      {topExpenseCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Onde Você Mais Gasta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topExpenseCategories.map(([category, amount], index) => {
                const percentage = (amount / analytics.totalExpenses) * 100
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-destructive opacity-${100 - index * 20}`} />
                      <span className="text-sm font-medium">{category}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-destructive">{formatCurrency(amount)}</p>
                      <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Type Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="income">Receitas</SelectItem>
            <SelectItem value="expense">Gastos</SelectItem>
            <SelectItem value="savings">Poupança</SelectItem>
            <SelectItem value="investment">Investimentos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>
              {typeFilter === "all"
                ? "Todas as Transações"
                : `${transactionLabels[typeFilter as keyof typeof transactionLabels]}`}
            </span>
            <Badge variant="secondary" className="text-xs">
              {filteredTransactions.length} {filteredTransactions.length === 1 ? "transação" : "transações"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                {typeFilter === "all"
                  ? `Nenhuma transação registrada ${view === "monthly" ? "neste mês" : "neste ano"}`
                  : `Nenhuma transação do tipo "${transactionLabels[typeFilter as keyof typeof transactionLabels]}" encontrada`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedTransactions.map((transaction) => {
                const Icon = transactionIcons[transaction.type]
                const colorClass = transactionColors[transaction.type]
                const label = transactionLabels[transaction.type]

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleEditTransaction(transaction)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${colorClass}`} />
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {label}
                          </Badge>
                          {transaction.category && (
                            <Badge variant="secondary" className="text-xs">
                              {transaction.category}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(transaction.date)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`font-semibold ${colorClass}`}>
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditTransaction(transaction)
                          }}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteTransaction(transaction.id)
                          }}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {editingTransaction && (
        <EditTransactionModal transaction={editingTransaction} onClose={() => setEditingTransaction(null)} />
      )}
    </div>
  )
}
