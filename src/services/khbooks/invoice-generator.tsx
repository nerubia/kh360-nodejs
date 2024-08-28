// TODO: move to utils ??

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
  renderToStream,
} from "@react-pdf/renderer"
import { formatDate } from "../../utils/format-date"
import React from "react"

import { sendMailWithAttachment } from "../../utils/sendgrid"
import path from "path"

const logo = path.resolve(__dirname, "./assets/nerubia.png")
const openSansRegularPath = path.resolve(__dirname, "./assets/fonts/OpenSans-Regular.ttf")
const openSansMediumPath = path.resolve(__dirname, "./assets/fonts/OpenSans-Medium.ttf")
const openSansSemiBoldPath = path.resolve(__dirname, "./assets/fonts/OpenSans-SemiBold.ttf")
const openSansBoldPath = path.resolve(__dirname, "./assets/fonts/OpenSans-Bold.ttf")
const openSansExtraBoldPath = path.resolve(__dirname, "./assets/fonts/OpenSans-ExtraBold.ttf")

Font.register({
  family: "Open Sans",
  fonts: [
    {
      src: openSansRegularPath,
      fontWeight: "normal",
    },
    {
      src: openSansMediumPath,
      fontWeight: "medium",
    },
    {
      src: openSansSemiBoldPath,
      fontWeight: "semibold",
    },
    {
      src: openSansBoldPath,
      fontWeight: "bold",
    },
    {
      src: openSansExtraBoldPath,
      fontWeight: "heavy",
    },
  ],
})

const styles = StyleSheet.create({
  page: {
    fontFamily: "Open Sans",
    fontSize: 12,
    padding: 20,
  },
})

const invoiceData = {
  invoice: {
    invoice_number: 1234,
    currency: "PHP",
    subtotal: 200.0,
    tax: 0,
    amount: 200.0,
    issue_date: "2024-08-20T08:41:33.000Z",
    due_date: "2024-08-20T08:41:33.000Z",
    items: [
      {
        id: 1,
        details: "Invoice details 1",
        period: "Period",
        project_name: "Project Name",
        contract_number: "Contract Number",
        other_details: "Other Details",
        quantity: 1,
        rate: 200,
        amount: 100,
      },
      {
        id: 2,
        details: "Invoice details 2",
        period: "Period",
        project_name: "Project Name",
        contract_number: "Contract Number",
        other_details: "Other Details",
        quantity: 1,
        rate: 200,
        amount: 100,
      },
    ],
  },
  company: {
    display_name: "Nerubia Web Solutions, Inc.",
    address: {
      street: "1101 Park Centrale, Cebu IT Park",
      city: "Cebu City, Cebu",
      country: "Philippines",
      postal_code: 6000,
    },
    account: {
      name: "Jane Doe",
      type: "Checking",
      number: "123456789",
    },
    bank: {
      name: "RCBC",
      branch: "Cebu",
      code: "1234",
    },
  },
  client: {
    display_name: "John Doe",
    company_name: "Google LLC",
  },
}

export const generateAndSendInvoice = async (id: number) => {
  const pdfStream = await renderToStream(<MyDocument />)

  const buffers: Buffer[] = []

  pdfStream.on("data", (chunk) => buffers.push(chunk))
  pdfStream.on("end", async () => {
    const pdfBuffer = Buffer.concat(buffers)
    await sendMailWithAttachment("jlerit@nerubia.com", "Invoice", "Your invoice", pdfBuffer)
  })
}

export const MyDocument: React.FC = () => {
  return (
    <Document>
      <Page size='A4' style={styles.page}>
        {/* Company details */}
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View style={{ display: "flex", flexDirection: "row" }}>
            <Image
              src={logo}
              style={{
                width: 40,
                height: 40,
              }}
            />
            <View>
              <Text style={{ fontWeight: "bold" }}>{invoiceData.company.display_name}</Text>
              <Text>{invoiceData.company.address.street}</Text>
              <Text>{invoiceData.company.address.city}</Text>
              <Text>
                {invoiceData.company.address.country} {invoiceData.company.address.postal_code}
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            Invoice {invoiceData.invoice.invoice_number}
          </Text>
        </View>

        {/* Divider */}
        <View style={{ paddingTop: 40 }}>
          <Text
            style={{
              borderTop: "2px",
              borderColor: "black",
            }}
          />
        </View>

        {/* Billing */}
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            paddingTop: 8,
          }}
        >
          <View>
            <Text style={{ fontSize: 10 }}>BILL TO</Text>
            <Text style={{ fontWeight: "bold" }}>{invoiceData.client.display_name}</Text>
            <Text style={{ fontSize: 10 }}>{invoiceData.client.company_name}</Text>
          </View>
          <View style={{ display: "flex", flexDirection: "row", fontSize: 10 }}>
            <View
              style={{
                backgroundColor: "#e2e8f0",
                display: "flex",
                alignItems: "center",
                padding: 20,
              }}
            >
              <Text>DATE</Text>
              <Text>{formatDate(invoiceData.invoice.issue_date)}</Text>
            </View>
            <View
              style={{
                backgroundColor: "#172554",
                color: "white",
                display: "flex",
                alignItems: "center",
                padding: 20,
              }}
            >
              <Text>PLEASE PAY</Text>
              <Text>
                {invoiceData.invoice.currency} {invoiceData.invoice.amount}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: "#e2e8f0",
                display: "flex",
                alignItems: "center",
                padding: 20,
              }}
            >
              <Text>DUE DATE</Text>
              <Text>{formatDate(invoiceData.invoice.due_date)}</Text>
            </View>
          </View>
        </View>

        {/* Items */}
        <View style={{ paddingTop: 40 }}>
          <View style={{ display: "flex", gap: 8, fontSize: 10 }}>
            {/* Divider */}
            <Text style={{ borderTop: "1px", borderColor: "#e2e8f0" }} />
            <View
              style={{ width: "100%", display: "flex", flexDirection: "row", fontWeight: "bold" }}
            >
              <Text style={{ width: "70%" }}>DESCRIPTION</Text>
              <Text style={{ width: "10%", textAlign: "right" }}>QTY</Text>
              <Text style={{ width: "10%", textAlign: "right" }}>RATE</Text>
              <Text style={{ width: "10%", textAlign: "right" }}>AMOUNT</Text>
            </View>
            {/* Divider */}
            <Text style={{ borderTop: "1px", borderColor: "#e2e8f0" }} />
          </View>
          {invoiceData.invoice.items.map((item) => (
            <View
              key={item.id}
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "row",
                paddingTop: 8,
                fontSize: 10,
              }}
              wrap={false}
            >
              <View style={{ width: "70%" }}>
                <Text>{item.details}</Text>
                <Text>{item.period}</Text>
                <Text>{item.project_name}</Text>
                <Text>{item.contract_number}</Text>
                <Text>{item.other_details}</Text>
              </View>
              <Text style={{ width: "10%", textAlign: "right" }}>{item.quantity}</Text>
              <Text style={{ width: "10%", textAlign: "right" }}>{item.rate}</Text>
              <Text style={{ width: "10%", textAlign: "right" }}>{item.amount}</Text>
            </View>
          ))}
        </View>

        <View style={{ paddingTop: 40, paddingBottom: 40 }}>
          {/* Divider */}
          <Text style={{ borderTop: "1px", borderColor: "#e2e8f0" }} />
        </View>
        {/* Payment */}
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
          wrap={false}
        >
          <View style={{ display: "flex", gap: 8, fontSize: 10 }}>
            <Text style={{ fontWeight: "bold" }}>PLEASE DIRECT PAYMENT TO:</Text>
            <View>
              <Text>Account Name: {invoiceData.company.account.name}</Text>
              <Text>Account Type: {invoiceData.company.account.type}</Text>
              <Text>Account Number: {invoiceData.company.account.number}</Text>
            </View>
            <View>
              <Text>Bank Name: {invoiceData.company.bank.name}</Text>
              <Text>Bank Branch: {invoiceData.company.bank.branch}</Text>
              <Text>Swift Code: {invoiceData.company.bank.code}</Text>
            </View>
          </View>
          <View style={{ width: "40%", display: "flex", gap: 20 }}>
            <View style={{ display: "flex", gap: 8 }}>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text>SUBTOTAL</Text>
                <Text>{invoiceData.invoice.subtotal}</Text>
              </View>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text>TAX</Text>
                <Text>{invoiceData.invoice.tax}</Text>
              </View>
            </View>
            <View style={{ display: "flex", gap: 16 }}>
              {/* Divider */}
              <Text style={{ borderTop: "1px", borderColor: "#e2e8f0" }} />
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "semibold" }}>TOTAL DUE</Text>
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                  {invoiceData.invoice.currency} {invoiceData.invoice.amount}
                </Text>
              </View>
              {/* Divider */}
              <Text style={{ borderTop: "2px", borderColor: "black" }} />
            </View>
            <View style={{ textAlign: "right" }}>
              <Text>THANK YOU.</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}
