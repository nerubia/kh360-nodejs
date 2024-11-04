import { Body, Container, Text, Html, Img, render, Section } from "@react-email/components"
import { type EmailPaymentContent } from "../types/payment-type"
import { formatDate } from "./format-date"

const nerubiaLogo = "https://drive.google.com/uc?export=view&id=1nBqgLU0-mSLkqgSLrhhVEG-E6_cwxjTE"
const ideaRobinLogo = "https://drive.google.com/uc?export=view&id=1-w2Y3YQcw6oc_6zl0YmqfErWeKchCfHV"

export const generatePaymentEmailContent = async (payment: EmailPaymentContent) => {
  return await render(<EmailContent payment={payment} />)
}

const main = { padding: "20px" }

const container = {
  padding: "20px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  border: "1px solid #eee",
  borderRadius: "5px",
}

const imgStyle = {
  marginLeft: "200px",
}

const companyText = { color: "#000000", fontSize: "18px", textAlign: "center" as const }

const emailTitle = { padding: "0 20px", color: "#000000" }
const emailBody = { padding: "0 20px", marginTop: "30px", color: "#000000" }
const emailSection = { width: "100%" }

const receiptSummaryContainer = {
  padding: "0 20px",
}

const receiptSummary = {
  padding: "0 20px",
  backgroundColor: "#e2e8f0",
}

const footerFontSize = {
  fontSize: "10px",
  textAlign: "center" as const,
  lineHeight: "16px",
}

interface EmailContentProps {
  payment: EmailPaymentContent
}

export default function EmailContent({ payment }: EmailContentProps) {
  const getSalutation = () => {
    const client = payment.clients

    if (client === undefined || client === null) return ""

    if (
      client.contact_first_name !== undefined &&
      client.contact_last_name !== undefined &&
      client.contact_first_name !== null &&
      client.contact_last_name !== null &&
      client.contact_first_name.length > 0 &&
      client.contact_last_name.length > 0
    ) {
      return `Dear ${client.contact_first_name} ${client.contact_last_name},`
    }

    if (
      client.display_name !== undefined &&
      client.display_name !== null &&
      client.display_name?.length > 0
    ) {
      return `Dear ${client.display_name},`
    }

    return `Dear ${client.name},`
  }

  return (
    <Html>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Img
              title='company logo'
              src={payment.companies?.shorthand === "NRB" ? nerubiaLogo : ideaRobinLogo}
              width='50'
              height='50'
              alt='logo'
              style={imgStyle}
            />
            <Text style={companyText}>{payment.companies?.name}</Text>
            <Container style={emailSection}>
              <Text style={emailTitle}>{getSalutation()}</Text>
              <Text style={emailBody}>Please find our payment receipt attached to this email:</Text>
              <Container style={receiptSummaryContainer}>
                <Container style={receiptSummary}>
                  <Text>
                    Payment No: {payment.payment_no}
                    <br />
                    Payment Date: {formatDate(payment.payment_date)}
                    <br />
                    {payment.payment_no !== null && `OR No: ${payment.or_no}`}
                    <br />
                    Amount Received: {payment.payment_amount}
                  </Text>
                </Container>
              </Container>
              <Text style={emailBody}>
                Thank you
                <br />
                {payment.companies?.name}
              </Text>
            </Container>
            <hr style={{ marginTop: "16px", width: "90%" }} />
            <Text style={footerFontSize}>
              {payment.companies?.name}
              <br />
              {payment.companies?.street} {payment.companies?.city}, {payment.companies?.state}{" "}
              {payment.companies?.zip} {payment.companies?.country}
              <br />
              {payment.companies?.public_url}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
