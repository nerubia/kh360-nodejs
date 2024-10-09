import * as InvoiceService from "../services/khbooks/invoice-service"

export const updateInvoiceJob = async () => {
  await InvoiceService.updateOverdueInvoices()
}
