export interface InvoiceActivity {
  invoice_id: number
  action: string
  description: string
}

export enum InvoiceActivityAction {
  BILLED = "billed",
  VIEWED = "viewed",
  REMINDER_SENT = "reminder_sent",
}
