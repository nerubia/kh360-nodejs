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
import { formatDate } from "./format-date"

import path from "path"

import { type InvoicePdf } from "../types/invoice-type"
import { formatAmount } from "./format-amount"

const logo = path.resolve(__dirname, "../../public/assets/nerubia.png")
const openSansRegularPath = path.resolve(
  __dirname,
  "../../public/assets/fonts/OpenSans-Regular.ttf"
)
const openSansMediumPath = path.resolve(__dirname, "../../public/assets/fonts/OpenSans-Medium.ttf")
const openSansSemiBoldPath = path.resolve(
  __dirname,
  "../../public/assets/fonts/OpenSans-SemiBold.ttf"
)
const openSansBoldPath = path.resolve(__dirname, "../../public/assets/fonts/OpenSans-Bold.ttf")
const openSansExtraBoldPath = path.resolve(
  __dirname,
  "../../public/assets/fonts/OpenSans-ExtraBold.ttf"
)

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

export const generateInvoice = async (invoice: InvoicePdf) => {
  const pdfStream = await renderToStream(<MyDocument invoice={invoice} />)

  return await new Promise<Buffer>((resolve, reject) => {
    const buffers: Buffer[] = []

    pdfStream.on("data", (chunk) => buffers.push(chunk))

    pdfStream.on("end", () => {
      const pdfBuffer = Buffer.concat(buffers)
      resolve(pdfBuffer)
    })

    pdfStream.on("error", (err) => {
      reject(err)
    })
  })
}

interface InvoiceProps {
  invoice: InvoicePdf
}

export const MyDocument = ({ invoice }: InvoiceProps) => {
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
              <Text style={{ fontWeight: "bold" }}>{invoice.companies?.name}</Text>
              <Text>{invoice.companies?.street}</Text>
              <Text>{invoice.companies?.city}</Text>
              <Text>
                {invoice.companies?.country} {invoice.companies?.zip}
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>Invoice {invoice.invoice_no}</Text>
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
            <View>
              <Text style={{ fontWeight: "bold" }}>{invoice.clients?.display_name}</Text>
              <Text>{invoice.billing_addresses?.address1}</Text>
              <Text>{invoice.billing_addresses?.address2}</Text>
              <Text>
                {invoice.billing_addresses?.city}, {invoice.billing_addresses?.state}{" "}
                {invoice.billing_addresses?.postal_code}
              </Text>
              <Text>{invoice.billing_addresses?.country}</Text>
            </View>
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              fontSize: 10,
            }}
          >
            <View
              style={{
                backgroundColor: "#e2e8f0",
                display: "flex",
                alignItems: "center",
                padding: 20,
              }}
            >
              <Text>DATE</Text>
              <Text>{formatDate(invoice.invoice_date)}</Text>
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
                {invoice.currencies?.code} {formatAmount(invoice.invoice_amount)}
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
              <Text>{formatDate(invoice.due_date)}</Text>
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
          {invoice.invoice_details.map((item) => (
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
                {item.period_start !== null && item.period_end !== null && (
                  <Text>
                    {formatDate(item.period_start)} - {formatDate(item.period_end)}
                  </Text>
                )}
                <Text>{item.projects?.name}</Text>
                <Text>{item.contracts?.contract_no}</Text>
                <Text>{item.contracts?.description}</Text>
              </View>
              <Text style={{ width: "10%", textAlign: "right" }}>{item.quantity}</Text>
              <Text style={{ width: "10%", textAlign: "right" }}>{item.rate}</Text>
              <Text style={{ width: "10%", textAlign: "right" }}>{formatAmount(item.total)}</Text>
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
              <Text>Account Name: {invoice.payment_accounts?.account_name}</Text>
              <Text>Account Type: {invoice.payment_accounts?.account_type}</Text>
              <Text>Account Number: {invoice.payment_accounts?.account_no}</Text>
            </View>
            <View>
              <Text>Bank Name: {invoice.payment_accounts?.bank_name}</Text>
              <Text>Bank Branch: {invoice.payment_accounts?.bank_branch}</Text>
              <Text>Swift Code: {invoice.payment_accounts?.swift_code}</Text>
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
                <Text>{formatAmount(invoice.sub_total)}</Text>
              </View>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text>TAX</Text>
                <Text>{invoice.tax_types?.rate?.toString()}%</Text>
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
                  {invoice.currencies?.code} {formatAmount(invoice.invoice_amount)}
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
