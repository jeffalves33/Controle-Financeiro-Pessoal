"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useFinanceData } from "@/hooks/use-finance-data"
import { formatCurrency } from "@/lib/finance-utils"
import { DollarSign, TrendingUp, TrendingDown, PiggyBank, Target } from "lucide-react"
import type { DailyTransaction } from "@/types/finance"

interface TransactionModalProps {
  children: React.ReactNode
}

const transactionTypes = [
  { value: "income", label: "Receita", icon: TrendingUp, color: "text-chart-3" },
  { value: "expense", label: "Gasto", icon: TrendingDown, color: "text-destructive" },
  { value: "savings", label: "Poupança", icon: PiggyBank, color: "text-chart-1" },
  { value: "investment", label: "Investimento", icon: Target, color: "text-chart-4" },
] as const

const expenseCategories = ["Alimentação", "Transporte", "Moradia", "Saúde", "Educação", "Lazer", "Roupas", "Outros"]

const incomeCategories = ["Salário", "Freelance", "Investimentos", "Vendas", "Outros"]

export function TransactionModal({ children }: TransactionModalProps) {
  const { addTransaction } = useFinanceData()
  const [open, setOpen] = useState(false)

  const [formData, setFormData] = useState<Omit<DailyTransaction, "id">>({
    date: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
    type: "expense",
    amount: 0,
    description: "",
    category: "",
  })

  const handleInputChange = (field: keyof Omit<DailyTransaction, "id">, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.amount > 0 && formData.description.trim()) {
      addTransaction(formData)
      setFormData({
        date: new Date().toISOString().split("T")[0],
        type: "expense",
        amount: 0,
        description: "",
        category: "",
      })
      setOpen(false)
    }
  }

  const selectedType = transactionTypes.find((t) => t.value === formData.type)
  const availableCategories = formData.type === "income" ? incomeCategories : expenseCategories

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-y-auto mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5" />
            Nova Transação
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transaction Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tipo de Transação</Label>
            <div className="grid grid-cols-2 gap-3">
              {transactionTypes.map((type) => {
                const Icon = type.icon
                const isSelected = formData.type === type.value
                return (
                  <Card
                    key={type.value}
                    className={`cursor-pointer transition-all ${
                      isSelected ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                    onClick={() => handleInputChange("type", type.value)}
                  >
                    <CardContent className="p-4 text-center">
                      <Icon className={`h-6 w-6 mx-auto mb-2 ${isSelected ? "text-primary" : type.color}`} />
                      <p className={`text-sm font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {type.label}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Valor
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">R$</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount || ""}
                onChange={(e) => handleInputChange("amount", Number.parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                className="pl-10 h-12 text-lg"
                required
              />
            </div>
            {formData.amount > 0 && (
              <p className="text-xs text-muted-foreground">Valor formatado: {formatCurrency(formData.amount)}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descrição
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Ex: Almoço no restaurante, Salário mensal, Depósito poupança..."
              className="min-h-[100px] resize-none"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Categoria (opcional)
            </Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium">
              Data
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              max={new Date().toISOString().split("T")[0]} // Can't select future dates
              className="h-12"
              required
            />
          </div>

          {/* Preview */}
          {formData.amount > 0 && formData.description.trim() && selectedType && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <selectedType.icon className={`h-5 w-5 ${selectedType.color}`} />
                    <div>
                      <p className="font-medium">{formData.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedType.label}
                        {formData.category && ` • ${formData.category}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${selectedType.color}`}>
                      {formData.type === "expense" ? "-" : "+"}
                      {formatCurrency(formData.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(formData.date + "T00:00:00").toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1 h-12">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 h-12" disabled={!formData.amount || !formData.description.trim()}>
              Adicionar Transação
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
