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
import { PiggyBank, Target, TrendingUp, Wallet, Info } from "lucide-react"
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
      <DialogContent className="w-[95vw] max-w-md mx-auto my-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5" />
            Defina Suas Metas para {currentYear}
          </DialogTitle>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                <strong>Dica:</strong> Defina metas realistas baseadas na sua renda atual. Você pode ajustar essas metas
                a qualquer momento.
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Expected Profit */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-chart-3" />💰 Quanto Quero Ganhar Este Ano
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="expectedProfit" className="text-sm text-muted-foreground">
                Soma de todos os seus ganhos (salário, freelances, vendas, etc.)
              </Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">R$</span>
                <Input
                  id="expectedProfit"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.expectedProfit || ""}
                  onChange={(e) => handleInputChange("expectedProfit", e.target.value)}
                  placeholder="Ex: 60000,00"
                  className="pl-10 h-12 text-lg"
                />
              </div>
              {formData.expectedProfit > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  📅 Por mês: {formatCurrency(formData.expectedProfit / 12)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Monthly Budget */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="h-4 w-4 text-destructive" />🛒 Quanto Posso Gastar Por Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="monthlyBudget" className="text-sm text-muted-foreground">
                Gastos com alimentação, transporte, lazer, contas, etc.
              </Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">R$</span>
                <Input
                  id="monthlyBudget"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.monthlyBudget || ""}
                  onChange={(e) => handleInputChange("monthlyBudget", e.target.value)}
                  placeholder="Ex: 3000,00"
                  className="pl-10 h-12 text-lg"
                />
              </div>
              {formData.monthlyBudget > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  📅 No ano: {formatCurrency(formData.monthlyBudget * 12)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Emergency Reserve */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <PiggyBank className="h-4 w-4 text-chart-1" />🏦 Minha Reserva de Emergência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="emergencyReserve" className="text-sm text-muted-foreground">
                Dinheiro guardado para imprevistos (recomendado: 6 meses de gastos)
              </Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">R$</span>
                <Input
                  id="emergencyReserve"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.emergencyReserve || ""}
                  onChange={(e) => handleInputChange("emergencyReserve", e.target.value)}
                  placeholder="Ex: 18000,00"
                  className="pl-10 h-12 text-lg"
                />
              </div>
              {formData.emergencyReserve > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  📅 Guardar por mês: {formatCurrency(monthlyEmergencyTarget)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Planned Investments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-chart-4" />📈 Quanto Vou Investir Este Ano
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="plannedInvestments" className="text-sm text-muted-foreground">
                Dinheiro para investimentos (ações, fundos, tesouro, etc.)
              </Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">R$</span>
                <Input
                  id="plannedInvestments"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.plannedInvestments || ""}
                  onChange={(e) => handleInputChange("plannedInvestments", e.target.value)}
                  placeholder="Ex: 12000,00"
                  className="pl-10 h-12 text-lg"
                />
              </div>
              {formData.plannedInvestments > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  📅 Investir por mês: {formatCurrency(monthlyInvestmentTarget)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          {(formData.expectedProfit > 0 ||
            formData.monthlyBudget > 0 ||
            formData.emergencyReserve > 0 ||
            formData.plannedInvestments > 0) && (
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">✅ Resumo das Suas Metas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {formData.expectedProfit > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        💰 <span>Vou ganhar no ano:</span>
                      </span>
                      <span className="font-semibold text-chart-3">{formatCurrency(formData.expectedProfit)}</span>
                    </div>
                  )}
                  {formData.monthlyBudget > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        🛒 <span>Vou gastar por mês:</span>
                      </span>
                      <span className="font-semibold text-destructive">{formatCurrency(formData.monthlyBudget)}</span>
                    </div>
                  )}
                  {formData.emergencyReserve > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        🏦 <span>Reserva de emergência:</span>
                      </span>
                      <span className="font-semibold text-chart-1">{formatCurrency(formData.emergencyReserve)}</span>
                    </div>
                  )}
                  {formData.plannedInvestments > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        📈 <span>Vou investir no ano:</span>
                      </span>
                      <span className="font-semibold text-chart-4">{formatCurrency(formData.plannedInvestments)}</span>
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
              {existingGoals ? "✅ Atualizar Metas" : "💾 Salvar Metas"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
