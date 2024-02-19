import { object, string } from "yup"

export const createExternalUserSchema = object().shape({
  email: string()
    .email()
    .required("Email is required")
    .max(255, "Email should not exceed 255 characters."),
  first_name: string()
    .required("First name is required")
    .max(100, "First name should not exceed 100 characters."),
  middle_name: string().optional().max(75, "Middle name should not exceed 75 characters."),
  last_name: string()
    .required("Last name is required")
    .max(75, "Last name should not exceed 75 characters."),
  role: string()
    .required("Role is required")
    .max(255, "Role name should not exceed 255 characters."),
  company: string()
    .required("Company is required")
    .max(255, "Company name should not exceed 255 characters."),
})
