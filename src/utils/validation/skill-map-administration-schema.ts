import { object, string } from "yup"

export const createSkillMapAdministrationSchema = object().shape({
  name: string().required("Name is required").max(100, "Name must be at most 100 characters"),
  skill_map_period_start_date: string()
    .required("Start period is required")
    .test("start-date", "Start period must be before end period", function (start_date) {
      const end_date = this.parent.skill_map_period_end_date
      return new Date(start_date) <= new Date(end_date)
    }),
  skill_map_period_end_date: string()
    .required("End period is required")
    .test("end-date", "End period must not be later than start schedule", function (end_date) {
      const start_schedule = this.parent.skill_map_schedule_start_date
      return new Date(end_date) <= new Date(start_schedule)
    }),
  skill_map_schedule_start_date: string()
    .required("Start schedule is required")
    .test("start-date", "Start schedule must be before end schedule", function (start_date) {
      const end_date = this.parent.skill_map_schedule_end_date
      return new Date(start_date) <= new Date(end_date)
    }),
  skill_map_schedule_end_date: string().required("End schedule is required"),
  remarks: string().required("Description is required"),
  email_subject: string().required("Email subject is required"),
  email_content: string().required("Email content is required"),
})
