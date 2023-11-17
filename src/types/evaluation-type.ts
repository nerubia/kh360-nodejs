export interface Evaluation {
  score?: string
  weight?: number
  weighted_score?: number
  submission_method?: string
  submitted_date?: Date
  comments?: string
  eval_start_date?: string
  eval_end_date?: string
  percent_involvement?: string
  status?: string
  for_evaluation?: boolean
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
}
