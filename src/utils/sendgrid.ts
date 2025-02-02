import sgMail from "@sendgrid/mail"
import CustomError from "./custom-error"
import logger from "./logger"
import { type Request } from "express"
import { EventWebhook, EventWebhookHeader } from "@sendgrid/eventwebhook"
import { type SendGridAttachment } from "../types/sendgrid-type"

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string)

const DEFAULT_FROM_ADDRESS = process.env.SENDGRID_FROM_ADDRESS ?? ""

interface MailProps {
  to: string[]
  cc?: string[]
  bcc?: string[]
  from?: string | null
  subject: string
  content: string
  attachments?: SendGridAttachment[]
  custom_args?: Record<string, string>
}

const getUniqueEmails = (group: string[], others: string[]) => {
  const uniqueEmails: string[] = []
  for (const email of group) {
    if (!uniqueEmails.includes(email)) {
      uniqueEmails.push(email)
    }
  }
  return uniqueEmails.filter((email) => !others.includes(email))
}

export const sendMail = async ({
  to,
  cc,
  bcc,
  from,
  subject,
  content,
  attachments,
  custom_args,
}: MailProps) => {
  try {
    const uniqueTo: string[] = getUniqueEmails(to, [])
    let uniqueCc: string[] = []
    let uniqueBcc: string[] = []

    if (cc !== undefined) {
      uniqueCc = getUniqueEmails(cc, uniqueTo)
    }
    if (bcc !== undefined) {
      uniqueBcc = getUniqueEmails(bcc, [...uniqueTo, ...uniqueCc])
    }

    const msg = {
      to: uniqueTo,
      cc: uniqueCc,
      bcc: uniqueBcc,
      from: from ?? DEFAULT_FROM_ADDRESS,
      subject,
      html: content,
      attachments,
      custom_args,
    }

    return await sgMail.send(msg)
  } catch (error) {
    logger.error(error)
    throw new CustomError("Unable to send email", 400)
  }
}

export const sendMultipleMail = async ({ to, from, subject, content }: MailProps) => {
  try {
    const msg = {
      to,
      from: from ?? DEFAULT_FROM_ADDRESS,
      subject,
      html: content,
    }
    await sgMail.sendMultiple(msg)
  } catch (error) {}
}

export const sendMailWithAttachment = async ({
  to,
  cc,
  bcc,
  from,
  subject,
  content,
  pdfBuffer,
}: MailProps & { pdfBuffer: Buffer }) => {
  try {
    const msg = {
      to,
      cc,
      bcc,
      from: from ?? DEFAULT_FROM_ADDRESS,
      subject,
      html: content,
      attachments: [
        {
          content: pdfBuffer.toString("base64"),
          filename: "invoice.pdf",
          type: "application/pdf",
          disposition: "attachment",
        },
      ],
    }

    return await sgMail.send(msg)
  } catch (error) {
    return null
  }
}

export const verifySendGridRequest = (req: Request) => {
  const publicKey = process.env.SENDGRID_PUBLIC_KEY ?? ""
  const payload = req.body

  const signature = req.get(EventWebhookHeader.SIGNATURE()) ?? ""
  const timestamp = req.get(EventWebhookHeader.TIMESTAMP()) ?? ""

  const eventWebhook = new EventWebhook()
  const ecPublicKey = eventWebhook.convertPublicKeyToECDSA(publicKey)
  return eventWebhook.verifySignature(ecPublicKey, payload, signature, timestamp)
}
