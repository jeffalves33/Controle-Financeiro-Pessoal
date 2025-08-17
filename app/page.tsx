"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFinanceData } from "@/hooks/use-finance-data"
import { formatCurrency, formatMonthYear } from "@/lib/finance-utils"
import { GoalsModal } from "@/components/goals-modal"
import { TransactionModal } from "@/components/transaction-modal"
import { TransactionsList } from "@/components/transactions-list"
import { AnnualView } from "@/components/annual-view"
import { AuthWrapper } from "@/components/auth-wrapper"
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Target, Plus, List, Calendar } from "lucide-react"

function FinanceDashboard() {
  const {
    data,
    isLoading,
    getMonthlyData,
    getGoalsForYear,
    getCurrentMonth,
    getCurrentYear,
    getMonthsWithData,
    getYearsWithData,
  } = useFinanceData()

  const monthsWithData = getMonthsWithData()
  const yearsWithData = getYearsWithData()

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentMonth = getCurrentMonth()
    return monthsWithData.includes(currentMonth) ? currentMonth : monthsWithData[0] || currentMonth
  })

  const [selectedYear, setSelectedYear] = useState(() => {
    const currentYear = getCurrentYear()
    return yearsWithData.includes(currentYear) ? currentYear : yearsWithData[0] || currentYear
  })

  const [view, setView] = useState<"monthly" | "annual">("monthly")
  const [activeTab, setActiveTab] = useState("dashboard")

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando seus dados financeiros...</p>
        </div>
      </div>
    )
  }

  const monthlyData = getMonthlyData(selectedMonth)
  const yearGoals = getGoalsForYear(view === "monthly" ? getCurrentYear() : selectedYear)

  const balance =
    monthlyData.totalIncome - monthlyData.totalExpenses - monthlyData.totalSavings - monthlyData.totalInvestments
  const isPositiveBalance = balance >= 0

  // Calculate progress percentages
  const expenseProgress = yearGoals ? (monthlyData.totalExpenses / yearGoals.monthlyBudget) * 100 : 0
  const savingsProgress = yearGoals ? (monthlyData.totalSavings / (yearGoals.emergencyReserve / 12)) * 100 : 0
  const investmentProgress = yearGoals ? (monthlyData.totalInvestments / (yearGoals.plannedInvestments / 12)) * 100 : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-4 sticky top-0 z-50">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-4 text-center">Controle Financeiro</h1>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12">
              <TabsTrigger
                value="dashboard"
                className="flex flex-col items-center gap-1 text-xs sm:flex-row sm:gap-2 sm:text-sm"
              >
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Home</span>
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="flex flex-col items-center gap-1 text-xs sm:flex-row sm:gap-2 sm:text-sm"
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Transações</span>
                <span className="sm:hidden">Lista</span>
              </TabsTrigger>
              <TabsTrigger
                value="annual"
                className="flex flex-col items-center gap-1 text-xs sm:flex-row sm:gap-2 sm:text-sm"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Anual</span>
                <span className="sm:hidden">Ano</span>
              </TabsTrigger>
            </TabsList>

            {activeTab === "dashboard" && (
              <div className="mt-4">
                {/* View Toggle */}
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={view === "monthly" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setView("monthly")}
                    className="flex-1 h-10"
                  >
                    Mensal
                  </Button>
                  <Button
                    variant={view === "annual" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setView("annual")}
                    className="flex-1 h-10"
                  >
                    Anual
                  </Button>
                </div>

                {/* Month/Year Selector */}
                {view === "monthly" ? (
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder="Selecione o mês" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthsWithData.length > 0 ? (
                        monthsWithData.map((month) => (
                          <SelectItem key={month} value={month}>
                            {formatMonthYear(month)}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value={getCurrentMonth()}>{formatMonthYear(getCurrentMonth())}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
                  >
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder="Selecione o ano" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearsWithData.length > 0 ? (
                        yearsWithData.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value={getCurrentYear().toString()}>{getCurrentYear()}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </Tabs>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4 pb-24">
        {activeTab === "dashboard" && (
          <div className="space-y-4">
            {view === "monthly" ? (
              <>
                {/* Balance Card */}
                <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Saldo Líquido do Mês
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${isPositiveBalance ? "text-chart-3" : "text-destructive"}`}>
                        {formatCurrency(balance)}
                      </span>
                      {isPositiveBalance ? (
                        <TrendingUp className="h-5 w-5 text-chart-3" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{formatMonthYear(selectedMonth)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Receitas - Gastos - Poupança - Investimentos</p>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs sm:text-sm text-muted-foreground">Receitas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg sm:text-xl font-semibold text-chart-3">
                        {formatCurrency(monthlyData.totalIncome)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs sm:text-sm text-muted-foreground">Gastos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg sm:text-xl font-semibold text-destructive">
                        {formatCurrency(monthlyData.totalExpenses)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs sm:text-sm text-muted-foreground">Poupança</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg sm:text-xl font-semibold text-chart-1">
                        {formatCurrency(monthlyData.totalSavings)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs sm:text-sm text-muted-foreground">Investimentos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg sm:text-xl font-semibold text-chart-4">
                        {formatCurrency(monthlyData.totalInvestments)}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Progress vs Goals */}
                {yearGoals && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Progresso vs Metas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Gastos Mensais</span>
                          <span>{Math.round(expenseProgress)}%</span>
                        </div>
                        <Progress value={Math.min(expenseProgress, 100)} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          Meta: {formatCurrency(yearGoals.monthlyBudget)}
                        </p>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Poupança Mensal</span>
                          <span>{Math.round(savingsProgress)}%</span>
                        </div>
                        <Progress value={Math.min(savingsProgress, 100)} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          Meta: {formatCurrency(yearGoals.emergencyReserve / 12)}
                        </p>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Investimentos Mensais</span>
                          <span>{Math.round(investmentProgress)}%</span>
                        </div>
                        <Progress value={Math.min(investmentProgress, 100)} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          Meta: {formatCurrency(yearGoals.plannedInvestments / 12)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Transactions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Transações Recentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {monthlyData.transactions.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">Nenhuma transação registrada este mês</p>
                    ) : (
                      <div className="space-y-3">
                        {monthlyData.transactions
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .slice(0, 5)
                          .map((transaction) => (
                            <div key={transaction.id} className="flex items-center justify-between py-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{transaction.description}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(transaction.date + "T00:00:00").toLocaleDateString("pt-BR")}
                                </p>
                              </div>
                              <div className="text-right ml-2">
                                <p
                                  className={`font-semibold text-sm ${
                                    transaction.type === "income"
                                      ? "text-chart-3"
                                      : transaction.type === "expense"
                                        ? "text-destructive"
                                        : transaction.type === "savings"
                                          ? "text-chart-1"
                                          : "text-chart-4"
                                  }`}
                                >
                                  {transaction.type === "income" ? "+" : "-"}
                                  {formatCurrency(transaction.amount)}
                                </p>
                                <Badge variant="outline" className="text-xs">
                                  {transaction.type === "income"
                                    ? "Receita"
                                    : transaction.type === "expense"
                                      ? "Gasto"
                                      : transaction.type === "savings"
                                        ? "Poupança"
                                        : "Investimento"}
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              /* Annual View - Legacy simple view, now replaced by dedicated tab */
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Metas Anuais {selectedYear}</CardTitle>
                </CardHeader>
                <CardContent>
                  {yearGoals ? (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Lucro Esperado:</span>
                        <span className="font-semibold">{formatCurrency(yearGoals.expectedProfit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Orçamento Mensal:</span>
                        <span className="font-semibold">{formatCurrency(yearGoals.monthlyBudget)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reserva de Emergência:</span>
                        <span className="font-semibold">{formatCurrency(yearGoals.emergencyReserve)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Investimentos Planejados:</span>
                        <span className="font-semibold">{formatCurrency(yearGoals.plannedInvestments)}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">Nenhuma meta definida para {selectedYear}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "transactions" && <TransactionsList />}
        {activeTab === "annual" && <AnnualView />}
      </div>

      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex gap-3 px-4">
          <TransactionModal>
            <Button size="lg" className="h-14 px-6 shadow-lg">
              <Plus className="h-5 w-5 mr-2" />
              Nova Transação
            </Button>
          </TransactionModal>
          <GoalsModal>
            <Button variant="outline" size="lg" className="h-14 px-6 bg-background shadow-lg">
              <PiggyBank className="h-5 w-5 mr-2" />
              Metas
            </Button>
          </GoalsModal>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <AuthWrapper>
      <FinanceDashboard />
    </AuthWrapper>
  )
}
