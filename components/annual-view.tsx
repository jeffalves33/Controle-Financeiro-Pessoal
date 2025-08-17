"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useFinanceData } from "@/hooks/use-finance-data"
import { formatCurrency } from "@/lib/finance-utils"
import { TrendingUp, TrendingDown, Target, Calendar, BarChart3, LineChart } from "lucide-react"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface MonthlyBreakdown {
  month: string
  monthName: string
  totalIncome: number
  totalExpenses: number
  totalSavings: number
  totalInvestments: number
  balance: number
  netBalance: number
}

const COLORS = {
  income: "#10b981",
  expense: "#ef4444",
  savings: "#3b82f6",
  investment: "#8b5cf6",
}

export function AnnualView() {
  const { data, getGoalsForYear, getCurrentYear, getAnnualData, getMonthlyBreakdown, getYearsWithData } =
    useFinanceData()
  const [selectedYear, setSelectedYear] = useState(getCurrentYear())

  const availableYears = getYearsWithData()

  if (availableYears.length === 0) {
    availableYears.push(getCurrentYear())
  }

  const annualData = getAnnualData(selectedYear)
  const yearGoals = getGoalsForYear(selectedYear)

  const monthlyBreakdown: MonthlyBreakdown[] = getMonthlyBreakdown(selectedYear).map((month) => {
    const monthName = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(
      new Date(selectedYear, Number.parseInt(month.month.split("-")[1]) - 1),
    )
    return {
      ...month,
      monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      balance: month.totalIncome - month.totalExpenses, // Old balance calculation for compatibility
    }
  })

  const evolutionData = monthlyBreakdown.map((month) => ({
    month: month.monthName,
    receitas: month.totalIncome,
    gastos: month.totalExpenses,
    poupanca: month.totalSavings,
    investimentos: month.totalInvestments,
    saldoLiquido: month.netBalance,
  }))

  const distributionData = [
    { name: "Receitas", value: annualData.totalIncome, color: COLORS.income },
    { name: "Gastos", value: annualData.totalExpenses, color: COLORS.expense },
    { name: "Poupança", value: annualData.totalSavings, color: COLORS.savings },
    { name: "Investimentos", value: annualData.totalInvestments, color: COLORS.investment },
  ].filter((item) => item.value > 0)

  // Calculate progress percentages
  const incomeProgress = yearGoals ? (annualData.totalIncome / yearGoals.expectedProfit) * 100 : 0
  const expenseProgress = yearGoals ? (annualData.totalExpenses / (yearGoals.monthlyBudget * 12)) * 100 : 0
  const savingsProgress = yearGoals ? (annualData.totalSavings / yearGoals.emergencyReserve) * 100 : 0
  const investmentProgress = yearGoals ? (annualData.totalInvestments / yearGoals.plannedInvestments) * 100 : 0

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
            Saldo Líquido Anual {selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${annualData.netBalance >= 0 ? "text-chart-3" : "text-destructive"}`}>
              {formatCurrency(annualData.netBalance)}
            </span>
            {annualData.netBalance >= 0 ? (
              <TrendingUp className="h-5 w-5 text-chart-3" />
            ) : (
              <TrendingDown className="h-5 w-5 text-destructive" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{annualData.transactions.length} transações registradas</p>
          <p className="text-xs text-muted-foreground mt-1">Receitas - Gastos - Poupança - Investimentos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Evolução Mensal {selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), ""]}
                  labelClassName="text-foreground"
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Line type="monotone" dataKey="receitas" stroke={COLORS.income} strokeWidth={2} name="Receitas" />
                <Line type="monotone" dataKey="gastos" stroke={COLORS.expense} strokeWidth={2} name="Gastos" />
                <Line type="monotone" dataKey="poupanca" stroke={COLORS.savings} strokeWidth={2} name="Poupança" />
                <Line
                  type="monotone"
                  dataKey="investimentos"
                  stroke={COLORS.investment}
                  strokeWidth={2}
                  name="Investimentos"
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição Anual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), ""]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {distributionData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Saldo Líquido Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Saldo Líquido"]}
                    labelClassName="text-foreground"
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Bar
                    dataKey="saldoLiquido"
                    fill={(data: any) => (data.saldoLiquido >= 0 ? COLORS.income : COLORS.expense)}
                    radius={[4, 4, 0, 0]}
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Annual Totals */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Receitas Anuais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-chart-3">{formatCurrency(annualData.totalIncome)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Gastos Anuais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-destructive">{formatCurrency(annualData.totalExpenses)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Poupança Anual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-chart-1">{formatCurrency(annualData.totalSavings)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Investimentos Anuais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-chart-4">{formatCurrency(annualData.totalInvestments)}</p>
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
                <span>Receitas Anuais</span>
                <span>{Math.round(incomeProgress)}%</span>
              </div>
              <Progress value={Math.min(incomeProgress, 100)} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Atual: {formatCurrency(annualData.totalIncome)}</span>
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
                <span>Atual: {formatCurrency(annualData.totalExpenses)}</span>
                <span>Limite: {formatCurrency(yearGoals.monthlyBudget * 12)}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Poupança Anual</span>
                <span>{Math.round(savingsProgress)}%</span>
              </div>
              <Progress value={Math.min(savingsProgress, 100)} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Atual: {formatCurrency(annualData.totalSavings)}</span>
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
                <span>Atual: {formatCurrency(annualData.totalInvestments)}</span>
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
                <span>Receitas Anuais Esperadas:</span>
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
                <span>Meta de Poupança Anual:</span>
                <div className="text-right">
                  <span className="font-semibold">{formatCurrency(yearGoals.emergencyReserve)}</span>
                  <Badge variant={savingsProgress >= 100 ? "default" : "secondary"} className="ml-2 text-xs">
                    {savingsProgress >= 100 ? "Atingido" : `${Math.round(savingsProgress)}%`}
                  </Badge>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Meta de Investimentos Anuais:</span>
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
            Resumo Mensal do Ano {selectedYear}
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
                    <div className="text-right">
                      <span className={`font-semibold ${month.netBalance >= 0 ? "text-chart-3" : "text-destructive"}`}>
                        {formatCurrency(month.netBalance)}
                      </span>
                      <p className="text-xs text-muted-foreground">Saldo Líquido</p>
                    </div>
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
