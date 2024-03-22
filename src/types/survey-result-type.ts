export interface SurveyResult {
  survey_administration_id: number
  user_id: number
  status?: string
  created_by_id?: number
  updated_by_id?: number
  created_at?: Date
  updated_at?: Date
}

export enum SurveyResultStatus {
  ForReview = "For Review",
  Draft = "Draft",
  Ready = "Ready",
  Ongoing = "Ongoing",
  Closed = "Closed",
  Completed = "Completed",
  Cancelled = "Cancelled",
  NoResult = "No Result",
}
