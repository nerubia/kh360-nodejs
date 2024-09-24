import { type Address } from "./address-type"
import { type Client } from "./client-type"
import { type Company } from "./company-type"
import { type Currency } from "./currency-type"
import { type InvoiceDetail } from "./invoice-detail-type"
import { type PaymentAccount } from "./payment-account-type"

export interface Invoice {
  client_id?: number
  to?: string
  cc?: string
  bcc?: string
  company_id?: number
  currency_id?: number
  invoice_no?: string
  invoice_date: string
  due_date: string
  invoice_amount?: number
  sub_total?: number
  tax_amount?: number
  tax_type_id: number
  payment_account_id: number
  payment_term_id: number
  billing_address_id?: number
  clients?: Client
  companies?: Company
  currencies?: Currency
  invoice_details: InvoiceDetail[]
  invoice_attachment_ids?: number[]
}

export interface EmailInvoiceContent {
  invoice_no?: string
  invoice_date: string
  due_date: string
  invoice_amount?: number
  sub_total?: number
  tax_amount?: number
  clients?: Client | null
  companies?: Company | null
  currencies?: Currency | null
  billing_addresses: Address | null
  payment_accounts: PaymentAccount | null
  invoice_details: InvoiceDetail[]
}

export enum InvoiceDateFilter {
  THIS_MONTH = "this_month",
  LAST_3_MONTHS = "last_3_months",
  LAST_6_MONTHS = "last_6_months",
  LAST_12_MONTHS = "last_12_months",
}

export enum InvoiceStatusFilter {
  DRAFT = "draft",
  UNPAID = "unpaid",
  UNPAID_OVERDUE = "unpaid_overdue",
  UNPAID_NOT_DUE = "unpaid_not_due",
  PAID = "paid",
  CANCELLED = "cancelled",
}

export enum InvoiceStatus {
  DRAFT = "draft",
  BILLED = "billed",
  VIEWED = "viewed",
  PAID = "paid",
  CANCELLED = "cancelled",
}

export enum PaymentStatus {
  OPEN = "open",
  OVERDUE = "overdue",
  PAID = "paid",
  CANCELLED = "cancelled",
}
