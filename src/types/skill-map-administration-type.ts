export interface SkillMapAdministration {
  id?: number
  name?: string
  skill_map_period_start_date?: Date
  skill_map_period_end_date?: Date
  skill_map_schedule_start_date?: Date
  skill_map_schedule_end_date?: Date
  remarks?: string
  email_subject?: string
  email_content?: string
  status?: string
  file?: string
}
export enum SkillMapAdministrationStatus {
  Draft = "Draft",
  Pending = "Pending",
  Processing = "Processing",
  Ongoing = "Ongoing",
  Closed = "Closed",
  Cancelled = "Cancelled",
  Published = "Published",
}
