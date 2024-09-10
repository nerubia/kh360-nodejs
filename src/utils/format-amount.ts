export const formatAmount = (value?: number | null) => {
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return formatter.format(value ?? 0)
}
