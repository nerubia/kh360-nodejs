import { type PaymentDetail } from "./payment-detail-type"
import { type PaymentEmail } from "./payment-email-type"
import { type Client } from "./client-type"
import { type Company } from "./company-type"
import { type Currency } from "./currency-type"

export interface Payment {
  id?: number
  to: string
  cc: string
  bcc: string
  client_id?: number | null
  company_id?: number | null
  currency_id: number | null
  payment_date: string | Date | null
  payment_reference_no?: string | null
  or_no?: string | null
  payment_account_id?: number | null
  payment_amount: number | null
  payment_amount_php: number | null
  payment_status: string | null
  payment_details?: PaymentDetail[]
  payment_emails?: PaymentEmail[]
  clients?: Client | null
  payment_attachment_ids?: number[]
}

export enum PaymentDateFilter {
  THIS_MONTH = "this_month",
  LAST_3_MONTHS = "last_3_months",
  LAST_6_MONTHS = "last_6_months",
  LAST_12_MONTHS = "last_12_months",
}

export enum PaymentStatusFilter {
  DRAFT = "draft",
  RECEIVED = "received",
  CANCELLED = "cancelled",
}

export enum SendPaymentAction {
  NONE = "none",
  RECEIVED = "received",
  SEND = "send",
  EDITED = "edited",
}

export enum PaymentStatus {
  DRAFT = "draft",
  RECEIVED = "received",
  CANCELLED = "cancelled",
}

export interface EmailPaymentContent {
  payment_no: string | null
  payment_date: string
  payment_amount: string | null
  or_no: string | null
  payment_details?: PaymentDetail[]

  clients: Partial<Client> | null
  companies?: Company | null
  currencies?: Currency | null
}
