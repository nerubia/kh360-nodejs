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

import { type EmailPaymentContent } from "../types/payment-type"
import { formatAmount } from "./format-amount"

const nerubiaLogo = path.resolve(__dirname, "../../public/assets/nerubia.png")
const ideaRobinLogo = path.resolve(__dirname, "../../public/assets/idearobin.jpg")

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

export const generatePayment = async (payment: EmailPaymentContent) => {
  const pdfStream = await renderToStream(<MyDocument payment={payment} />)

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

interface Props {
  payment: EmailPaymentContent
}

export const MyDocument = ({ payment }: Props) => {
  const getAddress = () => {
    if (payment?.clients === undefined) return ""

    const address1 = payment.clients?.address1 ?? ""
    const address2 = payment.clients?.address2 ?? ""
    const city = payment.clients?.city ?? ""
    const state = payment.clients?.state ?? ""
    const country = payment.clients?.countries?.name ?? ""
    const postal_code = payment.clients?.postal_code ?? ""

    let finalAddress = ""
    if (address1.length > 0) {
      finalAddress = finalAddress.concat(`${address1}\n`)
    }
    if (address2.length > 0) {
      finalAddress = finalAddress.concat(`${address2}\n`)
    }
    let cityStatePostal = ""
    if (city.length > 0) {
      cityStatePostal = cityStatePostal.concat(
        `${city}${state.length > 0 || postal_code.toString().length > 0 ? ", " : ""}`
      )
    }
    if (state.length > 0) {
      cityStatePostal = cityStatePostal.concat(`${state} `)
    }
    if (postal_code.toString().length > 0) {
      cityStatePostal = cityStatePostal.concat(postal_code.toString())
    }
    if (cityStatePostal.length > 0) {
      finalAddress = finalAddress.concat(`${cityStatePostal}\n`)
    }
    if (country.length > 0) {
      finalAddress = finalAddress.concat(country)
    }
    return finalAddress
  }
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
          <View style={{ display: "flex", flexDirection: "row", gap: "8px" }}>
            <Image
              src={payment.companies?.shorthand === "NRB" ? nerubiaLogo : ideaRobinLogo}
              style={{
                width: 40,
                height: 40,
              }}
            />
            <View>
              <Text style={{ fontWeight: "bold" }}>{payment.companies?.name}</Text>
              <Text>{payment.companies?.street}</Text>
              <Text>{payment.companies?.city}</Text>
              <Text>
                {payment.companies?.country} {payment.companies?.zip}
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>Payment {payment.payment_no}</Text>
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
            <Text style={{ fontSize: 10 }}>RECEIVED FROM</Text>
            <View>
              <Text style={{ fontWeight: "bold" }}>{payment.clients?.name}</Text>
              <Text style={{ fontSize: 10 }}>{getAddress()}</Text>
            </View>
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-end",
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
              <Text>{formatDate(payment.payment_date)}</Text>
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
              <Text style={{ width: "20%" }}>Invoice Number</Text>
              <Text style={{ width: "16%" }}>Invoice Date</Text>
              <Text style={{ width: "16%" }}>Due Date</Text>
              <Text style={{ width: "16%", textAlign: "right" }}>Original Amount</Text>
              <Text style={{ width: "16%", textAlign: "right" }}>Balance</Text>
              <Text style={{ width: "16%", textAlign: "right" }}>Payment</Text>
            </View>
            {/* Divider */}
            <Text style={{ borderTop: "1px", borderColor: "#e2e8f0" }} />
          </View>
          {payment.payment_details?.map((item) => (
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
              <Text style={{ width: "20%" }}>{item.invoices?.invoice_no}</Text>
              <Text style={{ width: "16%" }}>{formatDate(item.invoices?.invoice_date)}</Text>
              <Text style={{ width: "16%" }}>{formatDate(item.invoices?.due_date)}</Text>
              <Text style={{ width: "16%", textAlign: "right" }}>
                {payment.currencies?.code} {formatAmount(item.invoices?.invoice_amount)}
              </Text>
              <Text style={{ width: "16%", textAlign: "right" }}>
                {payment.currencies?.code} {formatAmount(item.open_balance)}
              </Text>
              <Text style={{ width: "16%", textAlign: "right" }}>
                {payment.currencies?.code} {formatAmount(Number(item.payment_amount))}
              </Text>
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
            justifyContent: "flex-end",
          }}
          wrap={false}
        >
          <View style={{ width: "40%", display: "flex", gap: 20 }}>
            <View style={{ display: "flex", gap: 8 }}>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text>Total</Text>
                <Text>
                  {payment.currencies?.code} {formatAmount(Number(payment.payment_amount))}
                </Text>
              </View>
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
