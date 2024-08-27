import { renderToStream } from "@react-pdf/renderer"
import { MyDocument } from "./sample"
import { sendMailWithAttachment } from "../../utils/sendgrid"

export const sendInvoice = async (id: number) => {
  const pdfStream = await renderToStream(<MyDocument />)

  const buffers: Buffer[] = []

  pdfStream.on("data", (chunk) => buffers.push(chunk))
  pdfStream.on("end", async () => {
    const pdfBuffer = Buffer.concat(buffers)
    await sendMailWithAttachment("jlerit@nerubia.com", "Invoice", "Your invoice", pdfBuffer)
  })
}
