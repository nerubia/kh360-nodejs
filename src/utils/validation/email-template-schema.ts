import { object, string } from "yup"

export const addEmailTemplate = object().shape({
  name: string().required("Name is required"),
  template_type: string().required("Template Type is required"),
  subject: string(),
  content: string().required("Content is required"),
})
