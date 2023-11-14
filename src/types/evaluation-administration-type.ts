export interface EvaluationAdministration {
  name: string
  eval_period_start_date: Date
  eval_period_end_date: Date
  eval_schedule_start_date: Date
  eval_schedule_end_date: Date
  remarks: string
  email_subject: string
  email_content: string
  status: string
}

export enum EvaluationAdministrationStatus {
  Draft = "Draft",
  Pending = "Pending",
  Ongoing = "Ongoing",
  Closed = "Closed",
  Cancelled = "Cancelled",
}
