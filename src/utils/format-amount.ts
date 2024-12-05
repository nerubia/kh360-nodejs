export const formatAmount = (value?: number | null) => {
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return formatter.format(value ?? 0)
}

export const formatInteger = (value: number) => {
  return value.toLocaleString("en-US")
}
