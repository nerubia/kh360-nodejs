import { number, object, string } from "yup"

export const createAddressSchema = object().shape({
  address1: string().optional(),
  address2: string().optional(),
  city: string().optional(),
  state: string().optional(),
  country_id: number().optional().nullable(),
  postal_code: string().optional(),
})
