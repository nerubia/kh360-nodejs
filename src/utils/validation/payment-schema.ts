import { number, object, string, array } from "yup"

const emailSchema = string().test("valid-emails", "Some emails are invalid", (value) => {
  if (value === undefined) return false
  const emails = value.split(",").map((email) => email.trim())
  return emails.every((email) => string().email().isValidSync(email))
})

const paymentDetailSchema = object().shape({
  payment_id: number().optional().nullable(),
  invoice_id: number().required("Invoice id is required"),
  payment_amount: number().required("Payment amount is required"),
})

export const createPaymentSchema = object().shape({
  client_id: number().nullable().required("Client is required"),
  to: emailSchema.required(`Client's E-mail is required`),
  cc: emailSchema.optional(),
  bcc: emailSchema.optional(),
  currency_id: number().nullable().required("Currency is required"),

  payment_date: string().required("Payment date is required"),
  payment_details: array().of(paymentDetailSchema),

  remarks: string().nullable(),
})

export const paymentAmountSchema = object().shape({
  payment_amount: number()
    .typeError("Payment Amount is required")
    .required("Payment Amount is required"),
})
