export interface SkillMapResult {
  skill_map_administration_id: number
  status?: string
  created_by_id?: number
  updated_by_id?: number
  created_at?: Date
  updated_at?: Date
}

export enum SkillMapResultStatus {
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