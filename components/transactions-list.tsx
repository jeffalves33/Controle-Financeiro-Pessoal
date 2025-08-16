"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFinanceData } from "@/hooks/use-finance-data"
import { formatCurrency, formatDate, getMonthOptions } from "@/lib/finance-utils"
import { TrendingUp, TrendingDown, PiggyBank, Target, Trash2, Filter } from "lucide-react"

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
  const { getMonthlyData, getAnnualData, deleteTransaction, getCurrentMonth, getCurrentYear } = useFinanceData()
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [selectedYear, setSelectedYear] = useState(getCurrentYear())
  const [view, setView] = useState<"monthly" | "annual">("monthly")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const monthlyData = getMonthlyData(selectedMonth)
  const annualData = getAnnualData(selectedYear)
  const monthOptions = getMonthOptions()

  // Get available years from transactions
  const availableYears = Array.from(
    new Set(
      (view === "monthly" ? monthlyData.transactions : annualData.transactions).map((t) =>
        new Date(t.date).getFullYear(),
      ),
    ),
  ).sort((a, b) => b - a)

  // Filter transactions by type
  const transactions = view === "monthly" ? monthlyData.transactions : annualData.transactions
  const filteredTransactions = typeFilter === "all" ? transactions : transactions.filter((t) => t.type === typeFilter)

  const sortedTransactions = filteredTransactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  const handleDeleteTransaction = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta transação?")) {
      deleteTransaction(id)
    }
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
            {monthOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
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
            {availableYears.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
