import { type EmailLog } from "./email-log-type"
import { type User } from "./user-type"

export interface SkillMapResult {
  id: number
  skill_map_administration_id?: string
  status?: string
  remarks?: string
  users?: User
  email_logs?: EmailLog[]
  last_skill_map_date?: string
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
