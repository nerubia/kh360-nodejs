import { Body, Container, Text, Html, Img, render, Section, Button } from "@react-email/components"
import { formatDate } from "./format-date"
import { type EmailInvoiceContent } from "../types/invoice-type"
import { formatAmount } from "./format-amount"
import { SendInvoiceType } from "../types/send-invoice-type"

const nerubiaLogo = "https://drive.google.com/uc?export=view&id=1nBqgLU0-mSLkqgSLrhhVEG-E6_cwxjTE"
const ideaRobinLogo = "https://drive.google.com/uc?export=view&id=1-w2Y3YQcw6oc_6zl0YmqfErWeKchCfHV"

export const generateInvoiceEmailContent = async (invoice: EmailInvoiceContent, type: string) => {
  return await render(<EmailContent invoice={invoice} type={type} />)
}

const main = { backgroundColor: "#525659", padding: "20px" }
const container = {
  padding: "20px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
}

const text = {
  fontSize: "11px",
  color: "#000000",
  textAlign: "center" as const,
  lineHeight: "normal",
}

const imgStyle = {
  marginLeft: "200px",
}

const companyText = { color: "#000000", fontSize: "18px", textAlign: "center" as const }
const dueDateStyle = {
  fontSize: "11px",
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

const sectionStyle = {
  textAlign: "center" as const,
}

const buttonStyle = {
  fontSize: "14px",
  textAlign: "center" as const,
  backgroundColor: "#a78ec8",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "8px",
}

const footerFontSize = {
  fontSize: "10px",
  textAlign: "center" as const,
  lineHeight: "16px",
}
const emailSection = { width: "100%" }

interface EmailContentProps {
  invoice: EmailInvoiceContent
  type: string
}

export default function EmailContent({ invoice, type }: EmailContentProps) {
  return (
    <>
      <Html>
        <Body style={main}>
          <Container style={container}>
            <Section>
              <Text style={text}>INVOICE NO. {invoice.invoice_no}</Text>
              <Img
                title='company logo'
                src={invoice.companies?.shorthand === "NRB" ? nerubiaLogo : ideaRobinLogo}
                width='50'
                height='50'
                alt='logo'
                style={imgStyle}
              />

              <Text style={companyText}>{invoice.companies?.name}</Text>

              <Text style={dueDateStyle}>DUE {formatDate(invoice.due_date)}</Text>

              <Text style={amount}>
                {invoice.currencies?.code} {formatAmount(invoice.invoice_amount)}
              </Text>

              <Container style={emailSection}>
                <Text style={emailTitle}>Dear {invoice.clients?.name},</Text>
                {type === SendInvoiceType.Invoice ? (
                  <Text style={emailBody}>
                    Here’s your invoice! We appreciate your prompt payment.
                  </Text>
                ) : (
                  <Text style={emailBody}>
                    Just a reminder that we have not received a payment for this invoice yet. Let us
                    know if you have questions.
                  </Text>
                )}
                <Section style={sectionStyle}>
                  <Button
                    style={buttonStyle}
                    href={`${process.env.HOST_NAME}/kh-books/client/invoices/${invoice.token}`}
                  >
                    View Invoice
                  </Button>
                </Section>
                <Text style={emailBody}>
                  Thanks for your business!
                  <br />
                  {invoice.companies?.name}
                </Text>
              </Container>
              <hr style={{ marginTop: "16px", width: "90%" }} />
              <Text style={footerFontSize}>
                {invoice.companies?.name}
                <br />
                {invoice.companies?.street} {invoice.companies?.city}, {invoice.companies?.state}{" "}
                {invoice.companies?.zip} {invoice.companies?.country}
                <br />
                {invoice.companies?.public_url}
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </>
  )
}
