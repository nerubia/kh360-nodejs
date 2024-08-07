import { array, boolean, number, object, string } from "yup"

export const createTestBatchSchema = object().shape({
  name: string().required("Name is required"),
  description: string().required("Description is required"),
  status: boolean().required("Status is required"),
  itemIds: array().of(number()),
})
