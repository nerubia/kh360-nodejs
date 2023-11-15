import { object, string } from "yup"

export const createExternalUserSchema = object().shape({
  email: string().email().required("Email is required"),
  first_name: string().required("First name is required"),
  middle_name: string().optional(),
  last_name: string().required("Last name is required"),
  role: string().optional(),
  company: string().optional(),
})
