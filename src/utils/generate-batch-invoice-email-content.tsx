import {
  Body,
  Container,
  Text,
  Html,
  Img,
  render,
  Section,
  Row,
  Column,
} from "@react-email/components"
import { type Company } from "../types/company-type"
import { type Client } from "../types/client-type"
import { type BatchInvoice } from "../types/invoice-type"
import { shortenFormatDate } from "./format-date"
import { formatAmount } from "./format-amount"

const nerubiaLogo = "https://drive.google.com/uc?export=view&id=1nBqgLU0-mSLkqgSLrhhVEG-E6_cwxjTE"
const ideaRobinLogo = "https://drive.google.com/uc?export=view&id=1-w2Y3YQcw6oc_6zl0YmqfErWeKchCfHV"

export const generateBatchInvoiceEmailContent = async ({
  client,
  company,
  content,
  invoices,
}: {
  client: Client
  company: Company
  content: string
  invoices: BatchInvoice[]
}) => {
  let emailContent = await render(
    <EmailContent client={client} company={company} content={content} />
  )
  const invoiceDetailsTable = await render(<InvoiceDetailsTable invoices={invoices} />)
  emailContent = emailContent.replace("{{invoice_details_table}}", invoiceDetailsTable)
  return emailContent
}

const main = { padding: "20px" }

const container = {
  width: "550px",
  maxWidth: "100%",
  padding: "20px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  border: "1px solid #eee",
  borderRadius: "5px",
}

const imgStyle = {
  margin: "0 auto",
}

const companyText = { color: "#000000", fontSize: "18px", textAlign: "center" as const }

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

const column = {
  width: "25%",
  backgroundColor: "#eee",
  fontSize: "12px",
}

const InvoiceDetailsTable = ({ invoices }: { invoices: BatchInvoice[] }) => {
  return (
    <Section>
      <Row>
        <Column align='center' style={column}>
          INVOICE DATE
        </Column>
        <Column align='center' style={column}>
          INVOICE NO
        </Column>
        <Column align='center' style={column}>
          INVOICE AMOUNT
        </Column>
        <Column align='center' style={column}>
          DUE DATE
        </Column>
      </Row>
      {invoices.map((invoice, index) => (
        <Row key={index}>
          <Column align='center' style={column}>
            {shortenFormatDate(invoice.invoice_date)}
          </Column>
          <Column align='center' style={column}>
            {invoice.invoice_no}
          </Column>
          <Column align='center' style={column}>
            {invoice?.currencies?.code} {formatAmount(Number(invoice.invoice_amount))}
          </Column>
          <Column align='center' style={column}>
            {shortenFormatDate(invoice.due_date)}
          </Column>
        </Row>
      ))}
    </Section>
  )
}

export default function EmailContent({
  client,
  company,
  content,
}: {
  client: Client
  company: Company
  content: string
}) {
  const getClientName = () => {
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
      company: company.name ?? "",
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
              <Img
                title='company logo'
                src={company.shorthand === "NRB" ? nerubiaLogo : ideaRobinLogo}
                width='50'
                height='50'
                alt='logo'
                style={imgStyle}
              />
              <Text style={companyText}>{company.name}</Text>

              {getEmailContent()}

              <hr style={{ marginTop: "16px", width: "90%" }} />
              <Text style={footerFontSize}>
                {company.name}
                <br />
                {company.street} {company.city}, {company.state} {company.zip} {company.country}
                <br />
                {company.public_url}
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </>
  )
}
