import { type InvoiceEmail } from "../../types/invoice-email-type"
import * as InvoiceRepository from "../../repositories/khbooks/invoice-repository"
import * as InvoiceEmailRepository from "../../repositories/khbooks/invoice-email-repository"
import CustomError from "../../utils/custom-error"

export const create = async (data: InvoiceEmail) => {
  const invoice = await InvoiceRepository.getById(data.invoice_id ?? 0)

  if (invoice === null) {
    throw new CustomError("Invoice not found", 400)
  }

  const currentDate = new Date()

  return await InvoiceEmailRepository.create({
    invoice_id: invoice.id,
    email_type: data.email_type,
    email_address: data.email_address,
    created_at: currentDate,
    updated_at: currentDate,
  })
}
