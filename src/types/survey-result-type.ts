export interface SurveyResult {
  survey_administration_id: number
  user_id: number | null
  external_respondent_id: number | null
  status?: string
  created_by_id?: number
  updated_by_id?: number
  created_at?: Date
  updated_at?: Date
}

export enum SurveyResultStatus {
  ForReview = "For Review",
  Open = "Open",
  Draft = "Draft",
  Ready = "Ready",
  Ongoing = "Ongoing",
  Closed = "Closed",
  Submitted = "Submitted",
  Cancelled = "Cancelled",
  NoResult = "No Result",
}
