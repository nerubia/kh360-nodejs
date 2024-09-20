import { type Prisma } from "@prisma/client"
import { type InvoiceDetail } from "../../types/invoice-detail-type"
import * as InvoiceRepository from "../../repositories/khbooks/invoice-repository"
import * as InvoiceDetailRepository from "../../repositories/khbooks/invoice-detail-repository"
import CustomError from "../../utils/custom-error"

export const updateByInvoiceId = async (id: number, invoiceDetails: InvoiceDetail[]) => {
  const invoice = await InvoiceRepository.getById(id)
  if (invoice === null) {
    throw new CustomError("Invoice not found", 400)
  }

  const currentDate = new Date()

  const newInvoiceDetails: Prisma.invoice_detailsCreateManyInput[] = []
  const newIds: number[] = []

  for (const invoiceDetail of invoiceDetails) {
    const periodStart =
      invoiceDetail.period_start !== null ? new Date(invoiceDetail.period_start) : null
    const periodEnd = invoiceDetail.period_end !== null ? new Date(invoiceDetail.period_end) : null

    if (invoiceDetail.id === undefined) {
      newInvoiceDetails.push({
        invoice_id: invoice.id,
        contract_id: invoiceDetail.contract_id,
        contract_billing_id: invoiceDetail.contract_billing_id,
        offering_id: invoiceDetail.offering_id,
        project_id: invoiceDetail.project_id,
        employee_id: invoiceDetail.employee_id,
        period_start: periodStart,
        period_end: periodEnd,
        details: invoiceDetail.details,
        quantity: invoiceDetail.quantity,
        uom_id: invoiceDetail.uom_id,
        rate: invoiceDetail.rate,
        sub_total: invoiceDetail.sub_total,
        tax: invoiceDetail.tax,
        total: invoiceDetail.total,
        created_at: currentDate,
        updated_at: currentDate,
      })
    } else {
      await InvoiceDetailRepository.updateById(invoiceDetail.id, {
        invoice_id: invoice.id,
        contract_id: invoiceDetail.contract_id,
        contract_billing_id: invoiceDetail.contract_billing_id,
        offering_id: invoiceDetail.offering_id,
        project_id: invoiceDetail.project_id,
        employee_id: invoiceDetail.employee_id,
        period_start: periodStart,
        period_end: periodEnd,
        details: invoiceDetail.details,
        quantity: invoiceDetail.quantity,
        uom_id: invoiceDetail.uom_id,
        rate: invoiceDetail.rate,
        sub_total: invoiceDetail.sub_total,
        tax: invoiceDetail.tax,
        total: invoiceDetail.total,
        updated_at: currentDate,
      })

      newIds.push(invoiceDetail.id)
    }
  }

  await InvoiceDetailRepository.createMany(newInvoiceDetails)

  const existingIds = invoice.invoice_details.map((invoiceDetail) => invoiceDetail.id)
  const toDelete = existingIds.filter((itemId) => !newIds.includes(itemId))

  await InvoiceDetailRepository.deleteMany(toDelete)
}
