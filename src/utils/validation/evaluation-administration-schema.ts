import { array, object, string } from "yup"

export const addEvaluatorSchema = object().shape({
  evaluation_template_id: string().required("Template Type is required"),
  evaluation_result_id: string().required("Evaluation result id is required"),
  evaluee_id: string().required("Evaluee id is required"),
  project_member_id: string().optional(),
  user_id: string().required("User is required"),
  is_external: string().required("User is required"),
})

export const addExternalEvaluatorsSchema = object().shape({
  evaluation_template_id: string().required("Evaluation template id is required"),
  evaluation_result_id: string().required("Evaluation result id is required"),
  evaluee_id: string().required("Evaluee id is required"),
  external_user_ids: array().of(string()).min(1).required("External user ids are required"),
})
