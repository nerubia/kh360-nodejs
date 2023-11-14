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
    await sgMail.send(msg)
  } catch (error) {}
}
