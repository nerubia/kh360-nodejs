import { boolean, object, string } from "yup"

export const createTestApiSchema = object().shape({
  name: string().required("Name is required"),
  endpoint: string().required("Endpoint is required"),
  http_method: string().required("Http method is required"),
  env: string().required("Env is required"),
  status: boolean().required("Status is required"),
})
