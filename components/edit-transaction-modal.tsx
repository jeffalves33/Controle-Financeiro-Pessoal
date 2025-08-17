"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFinanceData } from "@/hooks/use-finance-data"
import { formatCurrency } from "@/lib/finance-utils"
import { Edit3, Save, X } from "lucide-react"
import type { DailyTransaction } from "@/types/finance"

interface EditTransactionModalProps {
  transaction: DailyTransaction
  onClose: () => void
}

export function EditTransactionModal({ transaction, onClose }: EditTransactionModalProps) {
  const { updateTransaction } = useFinanceData()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    type: transaction.type,
    amount: transaction.amount.toString(),
    description: transaction.description,
    category: transaction.category,
    date: transaction.date,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || !formData.description || !formData.type) return

    setIsLoading(true)
    try {
      await updateTransaction(transaction.id!, {
        type: formData.type as any,
        amount: Number.parseFloat(formData.amount),
        description: formData.description,
        category: formData.category,
        date: formData.date,
      })
      onClose()
    } catch (error) {
      console.error("Error updating transaction:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "income":
        return "text-chart-3"
      case "expense":
        return "text-destructive"
      case "savings":
        return "text-chart-1"
      case "investment":
        return "text-chart-4"
      default:
        return "text-foreground"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "income":
        return "Receita"
      case "expense":
        return "Gasto"
      case "savings":
        return "Poupança"
      case "investment":
        return "Investimento"
      default:
        return type
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto my-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Editar Transação
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Transação</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">💰 Receita</SelectItem>
                <SelectItem value="expense">💸 Gasto</SelectItem>
                <SelectItem value="savings">🏦 Poupança</SelectItem>
                <SelectItem value="investment">📈 Investimento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">R$</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Salário, Supermercado, Poupança..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria (opcional)</Label>
            <Input
              id="category"
              placeholder="Ex: Alimentação, Transporte, Lazer..."
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          {/* Preview */}
          <div className="bg-muted/50 rounded-lg p-3 border">
            <h4 className="font-medium mb-2">Preview da Transação:</h4>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{formData.description || "Descrição"}</p>
                <p className="text-sm text-muted-foreground">
                  {getTypeLabel(formData.type)}
                  {formData.category && ` • ${formData.category}`}
                </p>
              </div>
              <div className="text-right ml-2">
                <p className={`font-semibold ${getTypeColor(formData.type)}`}>
                  {formData.type === "income" ? "+" : "-"}
                  {formatCurrency(Number.parseFloat(formData.amount) || 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formData.date ? new Date(formData.date + "T00:00:00").toLocaleDateString("pt-BR") : "Data"}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
