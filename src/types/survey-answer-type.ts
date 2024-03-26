export interface SurveyAnswer {
  id?: number | string
  survey_administration_id: number
  survey_result_id: number
  user_id: number
  survey_template_id: number
  survey_template_answer_id?: number | string
  survey_template_question_id: number | string
  status: string
  created_by_id: number
  updated_by_id: number
  created_at: Date
  updated_at: Date
}

export enum SurveyAnswerStatus {
  Draft = "Draft",
  Excluded = "Excluded",
  Pending = "Pending",
  Open = "Open",
  Ongoing = "Ongoing",
  Submitted = "Submitted",
  Cancelled = "Cancelled",
  Expired = "Expired",
  Reviewed = "Reviewed",
  ForRemoval = "For Removal",
  Removed = "Removed",
}
