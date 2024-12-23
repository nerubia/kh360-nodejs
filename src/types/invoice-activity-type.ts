export interface InvoiceActivity {
  invoice_id: number
  action: string
  description: string
}

export enum InvoiceActivityAction {
  BILLED = "billed",
  SENT_MAIL = "sent_mail",
  RESENT = "resent",
  EDITED = "edited",
  OPENED = "opened",
  VIEWED = "viewed",
  REMINDER_SENT = "reminder_sent",
  PAID = "paid",
  CANCELLED = "cancelled",
  SENT_BATCH_MAIL = "sent_batch_mail",
}
