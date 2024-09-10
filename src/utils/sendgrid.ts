import sgMail from "@sendgrid/mail"

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string)

export const sendMail = async (to: string, subject: string, content: string) => {
  try {
    const msg = {
      to,
      from: process.env.SENDGRID_FROM_ADDRESS as string,
      subject,
      html: content,
    }
    return await sgMail.send(msg)
  } catch (error) {
    return null
  }
}

export const sendMultipleMail = async (to: string[], subject: string, content: string) => {
  try {
    const msg = {
      to,
      from: process.env.SENDGRID_FROM_ADDRESS as string,
      subject,
      html: content,
    }
    await sgMail.sendMultiple(msg)
  } catch (error) {}
}

export const sendMailWithAttachment = async (
  to: string,
  cc: string[],
  bcc: string[],
  subject: string,
  content: string,
  pdfBuffer: Buffer
) => {
  try {
    const msg = {
      to,
      cc,
      bcc,
      from: process.env.SENDGRID_FROM_ADDRESS as string,
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
