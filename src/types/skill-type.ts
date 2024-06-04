export interface SkillType {
  id?: number | undefined
  skill_category_id: number
  status: boolean
  description: string
  name: string
  start_date?: Date
  end_date?: Date
}
