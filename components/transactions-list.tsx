"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFinanceData } from "@/hooks/use-finance-data"
import { formatCurrency, formatDate, getMonthOptions } from "@/lib/finance-utils"
import { TransactionModal } from "@/components/transaction-modal"
import { TrendingUp, TrendingDown, PiggyBank, Target, Plus, Trash2 } from "lucide-react"

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
  const { getMonthlyData, deleteTransaction, getCurrentMonth } = useFinanceData()
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())

  const monthlyData = getMonthlyData(selectedMonth)
  const monthOptions = getMonthOptions()

  const sortedTransactions = monthlyData.transactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  const handleDeleteTransaction = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta transação?")) {
      deleteTransaction(id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Transações</h2>
        <TransactionModal>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </TransactionModal>
      </div>

      {/* Month Selector */}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total de Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{monthlyData.transactions.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Saldo do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${
                monthlyData.totalIncome - monthlyData.totalExpenses >= 0 ? "text-chart-3" : "text-destructive"
              }`}
            >
              {formatCurrency(monthlyData.totalIncome - monthlyData.totalExpenses)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Todas as Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Nenhuma transação registrada neste mês</p>
              <TransactionModal>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar primeira transação
                </Button>
              </TransactionModal>
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
                          {transaction.type === "expense" ? "-" : "+"}
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
