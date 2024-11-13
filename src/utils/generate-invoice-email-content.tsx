import { Body, Container, Text, Html, Img, render, Section, Button } from "@react-email/components"
import { convertToFullDate } from "./format-date"
import { type EmailInvoiceContent } from "../types/invoice-type"
import { formatAmount } from "./format-amount"

const nerubiaLogo = "https://drive.google.com/uc?export=view&id=1nBqgLU0-mSLkqgSLrhhVEG-E6_cwxjTE"
const ideaRobinLogo = "https://drive.google.com/uc?export=view&id=1-w2Y3YQcw6oc_6zl0YmqfErWeKchCfHV"

export const generateInvoiceEmailContent = async (
  invoice: EmailInvoiceContent,
  content: string
) => {
  let emailContent = await render(<EmailContent invoice={invoice} content={content} />)

  const viewButton = await render(<ViewButton invoice={invoice} />)
  emailContent = emailContent.replace("{{view_invoice_button}}", viewButton)

  return emailContent
}

const main = { padding: "20px" }

const container = {
  padding: "20px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  border: "1px solid #eee",
  borderRadius: "5px",
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
const paymentHistoryStyle = {
  fontSize: "11px",
  marginTop: "0px",
  marginBottom: "0px",
  color: "#000000",
  textAlign: "center" as const,
}
const amount = {
  marginTop: "30px",
  fontWeight: "bold",
  fontSize: "2rem",
  color: "#000000",
  textAlign: "center" as const,
}

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

const emailSection = {
  width: "100%",
  marginTop: "30px",
  padding: "0px 20px",
  color: "#000000",
  whiteSpace: "pre",
}

interface EmailContentProps {
  invoice: EmailInvoiceContent
  content: string
}

const ViewButton = ({ invoice }: { invoice: EmailInvoiceContent }) => {
  return (
    <Section style={sectionStyle}>
      <Button
        style={buttonStyle}
        href={`${process.env.HOST_NAME}/kh-books/client/invoices/${invoice.token}`}
      >
        View Invoice
      </Button>
    </Section>
  )
}

export default function EmailContent({ invoice, content }: EmailContentProps) {
  const getClientName = () => {
    const client = invoice.clients

    if (client === undefined || client === null) return ""

    if (
      client.contact_first_name !== null &&
      client.contact_last_name !== null &&
      client.contact_first_name.length > 0 &&
      client.contact_last_name.length > 0
    ) {
      return `${client.contact_first_name} ${client.contact_last_name}`
    }

    if (
      client.display_name !== undefined &&
      client.display_name !== null &&
      client.display_name?.length > 0
    ) {
      return `${client.display_name}`
    }

    return `${client.name}`
  }

  const getEmailContent = () => {
    const replacements: Record<string, string> = {
      client: getClientName(),
      company: invoice.companies?.name ?? "",
    }

    const modifiedContent: string = content.replace(/{{(.*?)}}/g, (match: string, p1: string) => {
      return replacements[p1] ?? match
    })

    return <Container style={emailSection}>{modifiedContent}</Container>
  }

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

              <Text style={dueDateStyle}>DUE {convertToFullDate(new Date(invoice.due_date))}</Text>

              {invoice.previous_payments?.map((payment, idx) => (
                <Text style={paymentHistoryStyle} key={idx}>
                  {convertToFullDate(payment.payment_date ?? new Date())} | Payment{" "}
                  {payment.payment_no} | {invoice.currencies?.code} {payment.payment_amount}
                </Text>
              ))}

              <Text style={amount}>
                {invoice.currencies?.code} {formatAmount(invoice.open_balance)}
              </Text>

              {getEmailContent()}

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
