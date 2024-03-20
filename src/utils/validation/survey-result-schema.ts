import { object, string, number } from "yup"

export const createSurveyResultSchema = object().shape({
  survey_administration_id: number().required("Survey administration id is required"),
  remarks: string().required("Remarks is required"),
  status: string().required("Status is required"),
  created_by_id: number().optional(),
  updated_by_id: number().optional(),
})
