import { type Invoice } from "./invoice-type"

export interface PaymentDetail {
  id?: number
  payment_id: number | null
  invoice_id: number | null
  payment_amount: string | number
  showQuantityField: boolean
  quantityError?: string

  invoices?: Invoice
  open_balance?: number
}
