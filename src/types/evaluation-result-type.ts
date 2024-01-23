export interface EvaluationResult {
  status?: string
  score: number
  updated_at: Date
}

export enum EvaluationResultStatus {
  ForReview = "For Review",
  Draft = "Draft",
  Ready = "Ready",
  Ongoing = "Ongoing",
  Completed = "Completed",
  Cancelled = "Cancelled",
  NoResult = "No Result",
}
export const CheckEvaluatorStatus = {
  CheckEvaluator: true as const,
} as const
