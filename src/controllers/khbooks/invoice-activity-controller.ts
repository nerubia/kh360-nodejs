import { type Request, type Response } from "express"
import logger from "../../utils/logger"
import CustomError from "../../utils/custom-error"
import { getFileUrl } from "../../utils/s3"
import { getInvoiceFromToken } from "../../services/khbooks/invoice-service"
import * as InvoiceActivityService from "../../services/khbooks/invoice-activity-service"

export const captureAndShow = async (req: Request, res: Response) => {
  try {
    const { token } = req.params
    const invoice = await getInvoiceFromToken(token)
    if (invoice !== null) {
      await InvoiceActivityService.create({
        action: "view",
        description: "",
        invoice_id: invoice.id,
      })
    }
    res.redirect(await getFileUrl(invoice?.pdf_link ?? ""))
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}
