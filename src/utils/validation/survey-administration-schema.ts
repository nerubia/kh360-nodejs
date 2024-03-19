import { number, object, string, date } from "yup"

export const createSurveyAdministrationSchema = object().shape({
  name: string().required("Survey name is required"),
  survey_start_date: date().required("Survey start date is required"),
  survey_end_date: date().required("Survey end date is required"),
  survey_template_id: number().required("Survey template id is required"),
  remarks: string().required("Survey remarks is required"),
  email_subject: string().required("Survey email subject is required"),
  email_content: string().required("Survey email content is required"),
})
