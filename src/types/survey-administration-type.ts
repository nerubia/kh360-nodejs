export interface SurveyAdministrationType {
  id?: number
  name: string
  survey_start_date: Date
  survey_end_date: Date
  survey_template_id: number
  remarks: string
  email_subject: string
  email_content: string
  status: string
}
export enum SurveyAdministrationStatus {
  Draft = "Draft",
  Pending = "Pending",
  Processing = "Processing",
  Ongoing = "Ongoing",
  Closed = "Closed",
  Cancelled = "Cancelled",
  Published = "Published",
}
