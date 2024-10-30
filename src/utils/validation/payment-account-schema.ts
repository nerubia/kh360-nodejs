import { object, string, number } from "yup"

export const createPaymentAccountSchema = object().shape({
  name: string().required("Account name is required"),
  account_name: string().required("Account holder's name is required"),
  account_no: string().required("Account number is required"),
  bank_name: string().required("Bank name is required"),

  currency_id: number().nullable(),
  payment_network_id: number().nullable(),

  account_type: string().nullable(),
  bank_branch: string().nullable(),
  bank_code: string().nullable(),
  swift_code: string().nullable(),

  address1: string().nullable(),
  address2: string().nullable(),
  city: string().nullable(),
  state: string().nullable(),
  country_id: number().nullable(),
  postal_code: string().nullable(),
})
