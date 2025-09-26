import {
  SESClient,
  SendEmailCommand,
  type SendEmailRequest,
  SendRawEmailCommand,
  type SendRawEmailRequest,
} from "@aws-sdk/client-ses"
import CustomError from "./custom-error"
import logger from "./logger"
import type { SendGridAttachment } from "../types/sendgrid-type"

const ses = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
})

const DEFAULT_FROM_ADDRESS = process.env.AWS_SES_FROM_ADDRESS ?? ""

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
  const uniqueEmails = group.filter((email, index) => group.indexOf(email) === index)
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
  // eslint-disable-next-line no-console
  console.log("sendMail:", { to, cc, bcc, from, subject, content, attachments, custom_args })

  // If no attachments, fallback to normal sendMail
  if (attachments === undefined || attachments.length === 0) {
    return await sendMailWithoutAttachment({ to, cc, bcc, from, subject, content })
  }

  // Build MIME message
  const boundary = `----=_Part_${Math.random().toString(36).slice(2)}`
  const eol = "\r\n"
  const fromAddress = from ?? DEFAULT_FROM_ADDRESS

  let mime = ""
  mime += `From: ${fromAddress}${eol}`
  mime += `To: ${to.join(", ")}${eol}`
  if (cc !== undefined && cc.length > 0) mime += `Cc: ${cc.join(", ")}${eol}`
  if (bcc !== undefined && bcc.length > 0) mime += `Bcc: ${bcc.join(", ")}${eol}`
  mime += `Subject: ${subject}${eol}`
  mime += `MIME-Version: 1.0${eol}`
  mime += `Content-Type: multipart/mixed; boundary="${boundary}"${eol}`
  mime += eol
  mime += `--${boundary}${eol}`
  mime += `Content-Type: text/html; charset=UTF-8${eol}`
  mime += `Content-Transfer-Encoding: 7bit${eol}${eol}`
  mime += `${content}${eol}`

  for (const att of attachments) {
    mime += `--${boundary}${eol}`
    mime += `Content-Type: ${att.type ?? "application/octet-stream"}; name="${att.filename}"${eol}`
    mime += `Content-Disposition: ${att.disposition ?? "attachment"}; filename="${att.filename}"${eol}`
    mime += `Content-Transfer-Encoding: base64${eol}${eol}`
    mime += `${att.content}${eol}`
  }
  mime += `--${boundary}--${eol}`

  const params: SendRawEmailRequest = {
    RawMessage: { Data: Buffer.from(mime) },
    Source: fromAddress,
    Destinations: [...to, ...(cc ?? []), ...(bcc ?? [])].filter(
      (email) => typeof email === "string" && email.trim() !== ""
    ),
  }

  try {
    const command = new SendRawEmailCommand(params)
    return await ses.send(command)
  } catch (error) {
    logger.error(error)
    throw new CustomError("Unable to send email with attachment via SES", 400)
  }
}

export const sendMailWithoutAttachment = async ({
  to,
  cc,
  bcc,
  from,
  subject,
  content,
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
    const params: SendEmailRequest = {
      Destination: {
        ToAddresses: uniqueTo,
        CcAddresses: uniqueCc.length > 0 ? uniqueCc : undefined,
        BccAddresses: uniqueBcc.length > 0 ? uniqueBcc : undefined,
      },
      Message: {
        Subject: { Data: subject },
        Body: { Html: { Data: content } },
      },
      Source: from ?? DEFAULT_FROM_ADDRESS,
    }
    const command = new SendEmailCommand(params)
    return await ses.send(command)
  } catch (error) {
    logger.error(error)
    throw new CustomError("Unable to send email via SES", 400)
  }
}
