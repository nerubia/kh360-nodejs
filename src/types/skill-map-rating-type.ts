export interface SkillMapRating {
  id?: number | string
  skill_map_administration_id: number
  skill_map_result_id: number
  skill_id: number
  skill_category_id?: number | string
  other_skill_name?: string
  answer_option_id?: number | string
  status: string
  created_by_id: number
  updated_by_id: number
  created_at: Date
  updated_at: Date
}

export enum SkillMapRatingStatus {
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
