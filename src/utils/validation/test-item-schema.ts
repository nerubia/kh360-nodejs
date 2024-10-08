import { boolean, number, object, string } from "yup"

export const createTestItemSchema = object().shape({
  apiId: number().required("Api ID is required"),
  payload: string().required("Payload is required"),
  response: string().required("Response is required"),
  status: boolean().required("Status is required"),
})
