import { array, boolean, number, object, string } from "yup"

export const createTestBatchSchema = object().shape({
  apiId: number().required("Api ID is required"),
  name: string().required("Name is required"),
  status: boolean().required("Status is required"),
  itemIds: array().of(number()),
})
