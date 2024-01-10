import { boolean, number, object, string } from "yup"

export const createEvaluationTemplateContentSchema = object().shape({
  name: string().required("Name is required"),
  description: string().required("Description name is required"),
  category: string().required("Category is required"),
  rate: number().required("Rate is required"),
  is_active: boolean().required("Is active is required"),
})
