import { type Request, type Response } from "express"
import { verifySendGridRequest } from "../utils/sendgrid"
import * as InvoiceActivityService from "../services/khbooks/invoice-activity-service"
import * as InvoiceService from "../services/khbooks/invoice-service"
import * as EmailLogRepository from "../repositories/email-log-repository"
import { InvoiceActivityAction } from "../types/invoice-activity-type"
import { InvoiceStatus } from "../types/invoice-type"
import { type SendGridEvent, SendGridEventType } from "../types/sendgrid-type"

export const handleSendGrid = async (req: Request, res: Response) => {
  try {
    if (!verifySendGridRequest(req)) {
      return res.status(400).send("Invalid signature")
    }

    const parsedBody = JSON.parse(req.body.toString())

    const events: SendGridEvent[] = parsedBody

    for (const event of events) {
      const mailId = event.sg_message_id.split(".")[0]

      const emailLog = await EmailLogRepository.getByMailId(mailId)

      if (emailLog === null) continue

      const notes = JSON.parse(emailLog.notes ?? "")
      const invoiceId = notes.invoice_id as number

      const invoice = await InvoiceService.getInvoiceById(invoiceId)

      if (invoice === null) continue

      if (event.event === SendGridEventType.OPEN) {
        await InvoiceActivityService.create({
          action: InvoiceActivityAction.OPENED,
          description: event.email,
          invoice_id: invoice.id,
        })
      }

      if (event.event === SendGridEventType.CLICK) {
        await InvoiceActivityService.create({
          action: InvoiceActivityAction.VIEWED,
          description: event.email,
          invoice_id: invoice.id,
        })

        if (invoice.invoice_status === InvoiceStatus.BILLED) {
          await InvoiceService.updateInvoiceStatusById(invoice.id, InvoiceStatus.VIEWED)
        }
      }
    }

    res.send("ok")
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
