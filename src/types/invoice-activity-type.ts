export interface InvoiceActivity {
  invoice_id: number
  action: string
  description: string
}

export enum InvoiceActivityAction {
  VIEWED = "viewed",
  REMINDER_SENT = "reminder_sent",
}
