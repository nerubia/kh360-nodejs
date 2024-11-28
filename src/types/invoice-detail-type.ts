import { type Contract } from "./contract-type"
import { type Project } from "./project-type"

export interface InvoiceDetail {
  id?: number
  sequence_no?: number
  contract_id: number | null
  contract_billing_id: number | null
  offering_id: number | null
  project_id: number | null
  employee_id: number | null
  period_start: string | null
  period_end: string | null
  details: string | null
  quantity: number | null
  uom_id: number | null
  rate: string | null
  sub_total: string | null
  tax: string | null
  total: number | null
  contracts?: Contract
  projects?: Project
}
