import { array, number, object, string } from "yup"

const invoiceDetailSchema = object().shape({
  contract_id: number().optional().nullable(),
  contract_billing_id: number().optional().nullable(),
  offering_id: number().optional().nullable(),
  project_id: number().optional().nullable(),
  employee_id: number().optional().nullable(),
  period_start: string().optional().nullable(),
  period_end: string().optional().nullable(),
  details: string().required("Details is required"),
  quantity: number().required("Quantity is required"),
  uom_id: number().optional().nullable(),
  rate: number().optional().nullable(),
  sub_total: number().optional().nullable(),
  tax: number().optional().nullable(),
  total: number().optional().nullable(),
})

export const createInvoiceSchema = object().shape({
  client_id: number().required("Client is required"),
  currency_id: number().required("Currency is required"),
  invoice_date: string().required("Invoice date is required"),
  due_date: string().required("Due date is required"),
  invoice_amount: number().required("Invoice amount is required"),
  sub_total: number().required("Sub total is required"),
  tax_type_id: number().required("Tax type is required"),
  payment_term_id: number().required("Payment term is required"),
  invoice_details: array().of(invoiceDetailSchema),
})
