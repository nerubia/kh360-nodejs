import { type Request, type Response } from "express"
import logger from "../../utils/logger"
import * as InvoiceService from "../../services/khbooks/invoice-service"
import { generateAndSendInvoice } from "../../services/khbooks/invoice-generator"

/**
 * List invoices based on provided filters.
 * @param req.query.invoice_date - Filter by invoice date.
 * @param req.query.client_id - Filter by client_id.
 * @param req.query.status - Filter by status.
 * @param req.query.due_date - Filter by due_date.
 * @param req.query.page - Page number for pagination.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { invoice_date, client_id, status, due_date, page } = req.query
    const results = await InvoiceService.getAllByFilters(
      invoice_date as string,
      parseInt(client_id as string),
      status as string,
      due_date as string,
      page as string
    )
    res.json(results)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Send invoice
 */
export const sendInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.query
    await generateAndSendInvoice(parseInt(id as string))
    res.json({ message: "Invoice sent" })
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}
