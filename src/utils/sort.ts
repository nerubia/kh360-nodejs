import { type InvoiceDetail } from "../types/invoice-detail-type"

export const sortInvoiceDetailsBySequenceNumber = (
  invoiceDetails: InvoiceDetail[],
  direction: "asc" | "desc" = "asc"
) => {
  const clonedInvoiceDetails = [...invoiceDetails]
  return clonedInvoiceDetails.sort((a, b) => {
    const nameA = a.sequence_no ?? 0
    const nameB = b.sequence_no ?? 0
    if (nameA < nameB) return direction === "asc" ? -1 : 1
    if (nameA > nameB) return direction === "asc" ? 1 : -1
    return 0
  })
}
