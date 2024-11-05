export enum TemplateType {
  CreateEvaluation = "Create Evaluation",
  NARating = "Performance Evaluation NA Rating",
  HighRating = "Performance Evaluation High Rating",
  LowRating = "Performance Evaluation Low Rating",
}

export interface EmailTemplate {
  name: string
  template_type: string
  is_default: boolean
  subject: string
  content: string
  system_name?: string
  created_by_id?: number
  updated_by_id?: number
  created_at?: Date
  updated_at?: Date
}
