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
