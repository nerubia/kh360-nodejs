import { number, object, string } from "yup"

export const createTestItemSchema = object().shape({
  apiId: number().required("Api ID is required"),
  httpMethod: string().required("Http method is required"),
  payload: string().required("Payload is required"),
  response: string().required("Response is required"),
  description: string().required("Description is required"),
})
