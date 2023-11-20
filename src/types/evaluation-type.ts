export interface Evaluation {
  for_evaluation?: boolean
  eval_start_date?: string
  eval_end_date?: string
  percent_involvement?: string
  score?: string
  weight?: number
  weighted_score?: number
  comments?: string
  status?: string
  submission_method?: string
  submitted_date?: Date
  is_external?: boolean
  updated_at: Date
}

export enum EvaluationStatus {
  Draft = "Draft",
  Excluded = "Excluded",
  Pending = "Pending",
  Open = "Open",
  Ongoing = "Ongoing",
  Submitted = "Submitted",
  Cancelled = "Cancelled",
  Expired = "Expired",
}
