export interface SurveyAnswer {
  survey_administration_id: number
  survey_result_id: number
  user_id: number
  survey_template_id: number
  survey_template_answer_id?: number
  survey_template_question_id: number
  status: string
  created_by_id: number
  updated_by_id: number
  created_at: Date
  updated_at: Date
}

export enum SurveyAnswerStatus {
  ForReview = "For Review",
  Draft = "Draft",
  Ready = "Ready",
  Ongoing = "Ongoing",
  Completed = "Completed",
  Cancelled = "Cancelled",
  NoResult = "No Result",
}
