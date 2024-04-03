import { object, string } from "yup"

export const createExternalUserSchema = object().shape({
  user_type: string()
    .required("User type is required")
    .max(75, "User type should not exceed 75 characters."),
  email: string()
    .when("user_type", {
      is: (val: string) => val === "evaluation",
      then: () => string().required(),
    })
    .max(255, "Email should not exceed 255 characters."),
  first_name: string()
    .required("First name is required")
    .max(100, "First name should not exceed 100 characters."),
  middle_name: string().optional().max(75, "Middle name should not exceed 75 characters."),
  last_name: string()
    .required("Last name is required")
    .max(75, "Last name should not exceed 75 characters."),
  role: string()
    .when("user_type", {
      is: (val: string) => val === "evaluation",
      then: () => string().required(),
    })
    .max(255, "Role name should not exceed 255 characters."),
  company: string()
    .when("user_type", {
      is: (val: string) => val === "evaluation",
      then: () => string().required(),
    })
    .max(255, "Company name should not exceed 255 characters."),
})
