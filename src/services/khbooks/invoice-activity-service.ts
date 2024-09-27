import { type InvoiceActivity } from "../../types/invoice-activity-type"
import * as InvoiceActivityRepository from "../../repositories/khbooks/invoice-activity-repository"

export const create = async (data: InvoiceActivity) => {
  const currentDate = new Date()
  return await InvoiceActivityRepository.create({
    ...data,
    created_at: currentDate,
    updated_at: currentDate,
  })
}
