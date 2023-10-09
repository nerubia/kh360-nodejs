import sgMail from "@sendgrid/mail"

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string)

export const sendMail = async (to: string, subject: string, text: string) => {
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_ADDRESS as string,
    subject,
    text,
  }
  return await sgMail.send(msg)
}
