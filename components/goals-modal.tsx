"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useFinanceData } from "@/hooks/use-finance-data"
import { formatCurrency } from "@/lib/finance-utils"
import { PiggyBank, Target, TrendingUp, Wallet } from "lucide-react"
import type { AnnualGoals } from "@/types/finance"

interface GoalsModalProps {
  children: React.ReactNode
}

export function GoalsModal({ children }: GoalsModalProps) {
  const { addOrUpdateGoals, getGoalsForYear, getCurrentYear } = useFinanceData()
  const [open, setOpen] = useState(false)

  const currentYear = getCurrentYear()
  const existingGoals = getGoalsForYear(currentYear)

  const [formData, setFormData] = useState<AnnualGoals>({
    year: currentYear,
    expectedProfit: existingGoals?.expectedProfit || 0,
    monthlyBudget: existingGoals?.monthlyBudget || 0,
    emergencyReserve: existingGoals?.emergencyReserve || 0,
    plannedInvestments: existingGoals?.plannedInvestments || 0,
  })

  const handleInputChange = (field: keyof AnnualGoals, value: string) => {
    const numericValue = Number.parseFloat(value) || 0
    setFormData((prev) => ({ ...prev, [field]: numericValue }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addOrUpdateGoals(formData)
    setOpen(false)
  }

  const monthlyEmergencyTarget = formData.emergencyReserve / 12
  const monthlyInvestmentTarget = formData.plannedInvestments / 12

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-y-auto mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5" />
            Metas para {currentYear}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Expected Profit */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-chart-3" />
                Lucro Esperado no Ano
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="expectedProfit" className="text-sm text-muted-foreground">
                Quanto você espera lucrar em {currentYear}?
              </Label>
              <Input
                id="expectedProfit"
                type="number"
                step="0.01"
                min="0"
                value={formData.expectedProfit || ""}
                onChange={(e) => handleInputChange("expectedProfit", e.target.value)}
                placeholder="0,00"
                className="mt-2 h-12 text-lg"
              />
            </CardContent>
          </Card>

          {/* Monthly Budget */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="h-4 w-4 text-destructive" />
                Orçamento Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="monthlyBudget" className="text-sm text-muted-foreground">
                Quanto você planeja gastar por mês?
              </Label>
              <Input
                id="monthlyBudget"
                type="number"
                step="0.01"
                min="0"
                value={formData.monthlyBudget || ""}
                onChange={(e) => handleInputChange("monthlyBudget", e.target.value)}
                placeholder="0,00"
                className="mt-2 h-12 text-lg"
              />
            </CardContent>
          </Card>

          {/* Emergency Reserve */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <PiggyBank className="h-4 w-4 text-chart-1" />
                Reserva de Emergência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="emergencyReserve" className="text-sm text-muted-foreground">
                Quanto você quer ter de reserva até o final do ano?
              </Label>
              <Input
                id="emergencyReserve"
                type="number"
                step="0.01"
                min="0"
                value={formData.emergencyReserve || ""}
                onChange={(e) => handleInputChange("emergencyReserve", e.target.value)}
                placeholder="0,00"
                className="mt-2 h-12 text-lg"
              />
              {formData.emergencyReserve > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Meta mensal: {formatCurrency(monthlyEmergencyTarget)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Planned Investments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-chart-4" />
                Investimentos Planejados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="plannedInvestments" className="text-sm text-muted-foreground">
                Quanto você planeja investir no ano?
              </Label>
              <Input
                id="plannedInvestments"
                type="number"
                step="0.01"
                min="0"
                value={formData.plannedInvestments || ""}
                onChange={(e) => handleInputChange("plannedInvestments", e.target.value)}
                placeholder="0,00"
                className="mt-2 h-12 text-lg"
              />
              {formData.plannedInvestments > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Meta mensal: {formatCurrency(monthlyInvestmentTarget)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          {(formData.expectedProfit > 0 ||
            formData.monthlyBudget > 0 ||
            formData.emergencyReserve > 0 ||
            formData.plannedInvestments > 0) && (
            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Resumo das Metas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {formData.expectedProfit > 0 && (
                  <div className="flex justify-between">
                    <span>Lucro anual:</span>
                    <span className="font-medium text-chart-3">{formatCurrency(formData.expectedProfit)}</span>
                  </div>
                )}
                {formData.monthlyBudget > 0 && (
                  <div className="flex justify-between">
                    <span>Gastos mensais:</span>
                    <span className="font-medium text-destructive">{formatCurrency(formData.monthlyBudget)}</span>
                  </div>
                )}
                {formData.emergencyReserve > 0 && (
                  <div className="flex justify-between">
                    <span>Reserva total:</span>
                    <span className="font-medium text-chart-1">{formatCurrency(formData.emergencyReserve)}</span>
                  </div>
                )}
                {formData.plannedInvestments > 0 && (
                  <div className="flex justify-between">
                    <span>Investimentos anuais:</span>
                    <span className="font-medium text-chart-4">{formatCurrency(formData.plannedInvestments)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1 h-12">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 h-12">
              {existingGoals ? "Atualizar Metas" : "Salvar Metas"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
