export interface EmailLog {
  content: string | null
  created_at?: Date
  email_address: string
  email_status: EmailLogType
  email_type: string | null
  mail_id: string
  notes?: string
  sent_at: Date
  subject: string | null
  updated_at?: Date
  user_id?: number
}

export enum EmailLogType {
  Error = "Error",
  Pending = "Pending",
  Sent = "Sent",
}
