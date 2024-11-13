import { Body, Container, Text, Html, Img, render, Section } from "@react-email/components"
import { type EmailPaymentContent } from "../types/payment-type"
import { formatDate } from "./format-date"

const nerubiaLogo = "https://drive.google.com/uc?export=view&id=1nBqgLU0-mSLkqgSLrhhVEG-E6_cwxjTE"
const ideaRobinLogo = "https://drive.google.com/uc?export=view&id=1-w2Y3YQcw6oc_6zl0YmqfErWeKchCfHV"

export const generatePaymentEmailContent = async (
  payment: EmailPaymentContent,
  content: string
) => {
  let emailContent = await render(<EmailContent payment={payment} content={content} />)

  const receiptSummary = await render(<ReceiptSummary payment={payment} />)
  emailContent = emailContent.replace("{{receipt_summary}}", receiptSummary)

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

const imgStyle = {
  marginLeft: "200px",
}

const companyText = { color: "#000000", fontSize: "18px", textAlign: "center" as const }

const emailSection = {
  width: "100%",
  marginTop: "30px",
  padding: "0px 20px",
  color: "#000000",
  whiteSpace: "pre",
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
  content: string
}

const ReceiptSummary = ({ payment }: { payment: EmailPaymentContent }) => {
  return (
    <Container style={receiptSummary}>
      <Text>
        Payment No: {payment.payment_no}
        <br />
        Payment Date: {formatDate(payment.payment_date)}
        <br />
        {payment.or_no !== null && payment.or_no.length > 0 && (
          <>
            OR No: {payment.or_no}
            <br />
          </>
        )}
        Amount Received: {payment.payment_amount}
      </Text>
    </Container>
  )
}

export default function EmailContent({ payment, content }: EmailContentProps) {
  const getClientName = () => {
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
      company: payment.companies?.name ?? "",
    }

    const modifiedContent: string = content.replace(/{{(.*?)}}/g, (match: string, p1: string) => {
      return replacements[p1] ?? match
    })

    return <Container style={emailSection}>{modifiedContent}</Container>
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
            {getEmailContent()}
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
