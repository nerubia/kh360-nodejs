export interface EvaluationRating {
  answer_option_id: number
  rate: number
  score: number
  updated_at: Date
  comments?: string
  answer_type?: string
  percentage?: number
}
