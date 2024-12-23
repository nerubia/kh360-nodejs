import { array, boolean, number, object, string } from "yup"

const MAX_INVOICE_AMOUNT = 9_999_999_999.99

const emailSchema = string().test("valid-emails", "Some emails are invalid", (value) => {
  if (value === undefined) return false
  const emails = value.split(",").map((email) => email.trim())
  return emails.every((email) => string().email().isValidSync(email))
})

const invoiceDetailSchema = object().shape({
  contract_id: number().optional().nullable(),
  contract_billing_id: number().optional().nullable(),
  offering_id: number().optional().nullable(),
  project_id: number().optional().nullable(),
  employee_id: number().optional().nullable(),
  period_start: string().optional().nullable(),
  period_end: string().optional().nullable(),
  details: string().required("Details is required"),
  quantity: number().optional().nullable(),
  uom_id: number().optional().nullable(),
  rate: number().optional().nullable(),
  sub_total: number().optional().nullable(),
  tax: number().optional().nullable(),
  total: number().optional().nullable(),
})

export const createInvoiceSchema = object().shape({
  client_id: number().required("Client is required"),
  to: emailSchema.required(`Client's E-mail is required`),
  cc: emailSchema.optional(),
  bcc: emailSchema.optional(),
  currency_id: number().required("Currency is required"),
  invoice_date: string().required("Invoice date is required"),
  due_date: string().required("Due date is required"),
  invoice_amount: number()
    .required("Invoice amount is required")
    .test("is-valid", "Max supported amount per invoice is only 9,999,999,999.99", (value) => {
      const invoiceAmount = Number(value)
      return invoiceAmount <= MAX_INVOICE_AMOUNT
    }),
  sub_total: number().required("Sub total is required"),
  discount_amount: number().required("Discount amount is required"),
  discount_toggle: boolean().required("Discount toggle is required"),
  tax_amount: number().required("Tax amount is required"),
  tax_type_id: number().required("Tax type is required"),
  tax_toggle: boolean().required("Tax toggle is requried"),
  payment_account_id: number().required("Payment account is required"),
  payment_term_id: number().required("Payment term is required"),
  invoice_details: array().of(invoiceDetailSchema),
  invoice_attachment_ids: array().of(number()).optional(),
  subject: string().optional(),
  content: string().optional(),
  should_attach_invoice: boolean().required("Should attach invoice is requried"),
})
