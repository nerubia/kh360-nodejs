import { boolean, object, string } from "yup"

export const createTestApiSchema = object().shape({
  name: string().required("Name is required"),
  endpoint: string().required("Endpoint is required"),
  env: string().required("Env is required"),
  description: string().required("Description is required"),
  status: boolean().required("Status is required"),
})
