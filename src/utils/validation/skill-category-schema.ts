import { boolean, object, string } from "yup"

export const createSkillCategorySchema = object().shape({
  name: string().required("Skills Category name is required"),
  description: string().nullable(),
  status: boolean().required("Status is required"),
})
