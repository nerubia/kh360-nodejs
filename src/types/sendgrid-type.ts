export interface SendGridEvent {
  email: string
  event: string
  url: string
  timestamp: number
  "smtp-id": string
  category: string[]
  sg_event_id: string
  sg_message_id: string
}

export enum SendGridEventType {
  OPEN = "open",
  CLICK = "click",
}
