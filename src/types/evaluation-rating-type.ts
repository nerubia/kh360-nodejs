import { type Decimal } from "@prisma/client/runtime/library"
export interface EvaluationRating {
  evaluation_administration_id?: number | null
  evaluation_id?: number | null
  evaluation_template_id?: number | null
  evaluation_template_content_id?: number | null
  answer_option_id?: number
  rate?: Decimal | number | null
  score?: number
  updated_at?: Date
  comments?: string
  answer_type?: string
  percentage?: Decimal | number | null
}
