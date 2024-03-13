import { number, object, string, boolean } from "yup"

export const createSkillSchema = object().shape({
  name: string().required("Skill name is required"),
  description: string(),
  status: boolean().required("Status is required"),
  skill_category_id: number().required("Skill category id is required"),
})
