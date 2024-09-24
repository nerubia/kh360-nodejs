import { Body, Container, Text, Html, Img, render, Section } from "@react-email/components"
import { formatDate } from "./format-date"
import { type EmailInvoiceContent } from "../types/invoice-type"

const logo =
  "https://scontent.fceb1-2.fna.fbcdn.net/v/t39.30808-6/305456072_504047941725461_5917402848048936618_n.png?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=PtGQnTbKwZMQ7kNvgHDQpQa&_nc_ht=scontent.fceb1-2.fna&_nc_gid=Ay8SDtgTEFjSf-OFEtPINiS&oh=00_AYAFZ9YuSVnNZcsz9OvPTfeW69BBn4-Mp8nzq1vL-yPUCA&oe=66F70176"

export const generateInvoiceEmailContent = async (invoice: EmailInvoiceContent) => {
  return await render(<EmailContent invoice={invoice} />)
}

const main = { backgroundColor: "#525659", padding: "20px" }
const container = {
  padding: "20px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
}

const text = {
  fontWeight: "bold",
  color: "#000000",
  textAlign: "center" as const,
  lineHeight: "normal",
}

const imgStyle = {
  marginLeft: "200px",
}

const companyText = { color: "#000000", fontSize: "20px", textAlign: "center" as const }
const dueDateStyle = {
  fontWeight: "bold",
  color: "#000000",
  textAlign: "center" as const,
}
const amount = {
  fontWeight: "bold",
  fontSize: "2rem",
  color: "#000000",
  textAlign: "center" as const,
}
const emailTitle = { padding: "0 20px", color: "#000000" }
const emailBody = { padding: "0 20px", marginTop: "30px", color: "#000000" }

const footerFontSize = {
  fontSize: "10px",
  textAlign: "center" as const,
  lineHeight: "16px",
}
const emailSection = { width: "100%" }

export default function EmailContent({ invoice }: { invoice: EmailInvoiceContent }) {
  return (
    <>
      <Html>
        <Body style={main}>
          <Container style={container}>
            <Section>
              <Text style={text}>Invoice no. {invoice.invoice_no}</Text>
              <Img src={logo} width='50' height='50' alt='Nerubia logo' style={imgStyle} />

              <Text style={companyText}>Nerubia Web Solutions, Inc.</Text>

              <Text style={dueDateStyle}>DUE {formatDate(invoice.due_date)}</Text>

              <Text style={amount}>
                {invoice.currencies?.code} {invoice.invoice_amount}
              </Text>

              <Container style={emailSection}>
                <Text style={emailTitle}>Dear {invoice.clients?.display_name},</Text>
                <Text style={emailBody}>Here’s your invoice! We appreciate your payment.</Text>
                <Text style={emailBody}>
                  Thanks for your business!
                  <br />
                  Nerubia Web Solutions, Inc
                </Text>
              </Container>
              <hr style={{ marginTop: "16px", width: "90%" }} />
              <Text style={footerFontSize}>
                Nerubia Web Solutions, Inc
                <br />
                1101 Park Centrale, Cebu IT Park Cebu City, Cebu 6000 PH
                <br />
                www.nerubia.com
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </>
  )
}
