import { Body, Container, Text, Html, Img, render, Section } from "@react-email/components"
import { type Company } from "../types/company-type"
import { type Client } from "../types/client-type"

const nerubiaLogo = "https://drive.google.com/uc?export=view&id=1nBqgLU0-mSLkqgSLrhhVEG-E6_cwxjTE"
const ideaRobinLogo = "https://drive.google.com/uc?export=view&id=1-w2Y3YQcw6oc_6zl0YmqfErWeKchCfHV"

export const generateBatchInvoiceEmailContent = async ({
  client,
  company,
  content,
}: {
  client: Client
  company: Company
  content: string
}) => {
  return await render(<EmailContent client={client} company={company} content={content} />)
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
