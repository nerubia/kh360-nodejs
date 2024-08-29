import { number, object, string } from "yup"

export const createOfferingSchema = object().shape({
  name: string().required("Name is required"),
  client_id: number().required("Client is required"),
  offering_category_id: number().required("Category is required"),
  currency_id: number().required("Currency is required"),
  price: number().required("Price is required"),
  description: string().optional(),
})
