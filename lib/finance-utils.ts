export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00")
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

export function formatMonthYear(monthString: string): string {
  const [year, month] = monthString.split("-")
  const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date)
}

export function getMonthOptions(startYear = 2020): Array<{ value: string; label: string }> {
  const options = []
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  for (let year = startYear; year <= currentYear + 1; year++) {
    const maxMonth = year === currentYear + 1 ? 0 : year === currentYear ? currentMonth : 11
    for (let month = 0; month <= maxMonth; month++) {
      const monthString = `${year}-${String(month + 1).padStart(2, "0")}`
      const date = new Date(year, month)
      const label = new Intl.DateTimeFormat("pt-BR", {
        month: "long",
        year: "numeric",
      }).format(date)
      options.push({ value: monthString, label })
    }
  }

  return options.reverse() // Most recent first
}
