import { boolean, number, object, string } from "yup"

export const createEvaluationTemplate = object().shape({
  name: string().required("Name is required"),
  display_name: string().required("Display name is required"),
  template_type: string().required("Template type is required"),
  template_class: string().required("Template class is required"),
  with_recommendation: boolean().required("With recommendation is required"),
  evaluator_role_id: number().required("Evaluator role id is required"),
  evaluee_role_id: number().required("Evaluee role id is required"),
  rate: number().required("Rate is required"),
  answer_id: number().required("Answer id is required"),
  description: string(),
  is_active: boolean().required("Is active is required"),
})
