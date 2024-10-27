export interface PaymentAttachment {
  id: number
  sequence_no: number | null
  filename: string | null
  description: string | null
  url?: string
}
