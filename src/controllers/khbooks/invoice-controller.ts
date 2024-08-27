import { type Request, type Response } from "express"
import logger from "../../utils/logger"
import * as InvoiceService from "../../services/khbooks/invoice-service"

/**
 * Send invoice
 */
export const sendInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.query
    await InvoiceService.sendInvoice(parseInt(id as string))
    res.json({ message: "Invoice sent" })
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}
