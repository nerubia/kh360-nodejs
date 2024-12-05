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

import path from "path"

import { InvoiceStatus, type EmailInvoiceContent } from "../types/invoice-type"
import { formatAmount, formatInteger } from "./format-amount"
import { shortenFormatDate } from "./format-date"
import { sortInvoiceDetailsBySequenceNumber } from "./sort"
import { type PaymentAccount, PaymentNetworkOption } from "../types/payment-account-type"

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
  header: {
    background: "#323639",
    display: "flex",
    justifyContent: "flex-end",
    padding: "20px 40px",
  },
  button: {
    color: "#f1f1f1",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 2,
    textTransform: "uppercase",
  },
  statusPaid: {
    color: "green",
  },
  statusCancelled: {
    color: "red",
  },
  statusDraft: {
    color: "gray",
  },
})

export const generateInvoice = async (invoice: EmailInvoiceContent) => {
  const pdfStream = await renderToStream(<InvoicePdf invoice={invoice} />)

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
  invoice: EmailInvoiceContent
}

export const InvoicePdf = ({ invoice }: InvoiceProps) => {
  const getStatusStyle = (status: string | undefined) => {
    switch (status) {
      case "paid":
        return styles.statusPaid
      case "cancelled":
        return styles.statusCancelled
      case "draft":
        return styles.statusDraft
      default:
        return {}
    }
  }

  const getInvoiceStatus = (status: string | undefined) => {
    switch (status) {
      case InvoiceStatus.PAID:
        return InvoiceStatus.PAID
      case InvoiceStatus.CANCELLED:
        return InvoiceStatus.CANCELLED
      case InvoiceStatus.DRAFT:
        return InvoiceStatus.DRAFT
      default:
        return ""
    }
  }

  const getAddress = () => {
    if (invoice?.addresses === undefined) return ""
    if (invoice?.addresses === null) return ""
    const { address1, address2, city, state, postal_code, country } = invoice.addresses

    let finalAddress = ""

    finalAddress = [address1, address2].join(", ")

    let cityStatePostal = ""

    if (city !== null && city.length > 0 && state !== null && postal_code !== null) {
      cityStatePostal = cityStatePostal.concat(
        `${finalAddress.length > 0 ? "\n" : ""}${city}${
          state.length > 0 || postal_code.length > 0 ? ", " : ""
        }`
      )
    }
    if (state !== null && state.length > 0) {
      cityStatePostal = cityStatePostal.concat(`${state} `)
    }
    if (postal_code !== null && postal_code.length > 0) {
      cityStatePostal = cityStatePostal.concat(postal_code)
    }
    if (cityStatePostal.length > 0) {
      finalAddress = finalAddress.concat(`${cityStatePostal}\n`)
    }
    if (country !== null && country.length > 0) {
      finalAddress = finalAddress.concat(country)
    }
    return finalAddress
  }

  const getDiscountAmount = () => {
    const discount = (Number(invoice?.sub_total) * (Number(invoice?.discount_amount) ?? 0)) / 100
    if (discount === 0) return discount
    return formatAmount(discount * -1)
  }

  const getAmountAfterDiscount = () => {
    const discount = (Number(invoice?.sub_total) * (Number(invoice?.discount_amount) ?? 0)) / 100
    return formatAmount(Number(invoice?.sub_total) - discount)
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
              src={invoice?.companies?.shorthand === "NRB" ? nerubiaLogo : ideaRobinLogo}
              style={{
                width: 40,
                height: 40,
              }}
            />
            <View>
              <Text style={{ fontWeight: "bold" }}>{invoice?.companies?.name}</Text>
              <Text style={{ fontSize: 10 }}>{invoice?.companies?.street}</Text>
              <Text style={{ fontSize: 10 }}>{invoice?.companies?.city}</Text>
              <Text style={{ fontSize: 10 }}>
                {invoice?.companies?.country} {invoice?.companies?.zip}
              </Text>
            </View>
          </View>
          <View style={{ display: "flex" }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Invoice {invoice?.invoice_no}</Text>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 10,
              }}
            >
              <Text></Text>
              <Text style={[styles.statusText, getStatusStyle(invoice?.invoice_status)]}>
                {getInvoiceStatus(invoice?.invoice_status)}
              </Text>
            </View>
          </View>
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
            <Text style={{ fontSize: 10, fontWeight: "bold" }}>BILL TO</Text>
            <View>
              {invoice?.clients?.contact_first_name !== null &&
                invoice?.clients?.contact_last_name !== null && (
                  <Text style={{ fontSize: 10 }}>
                    {invoice?.clients?.contact_first_name} {invoice?.clients?.contact_last_name}
                  </Text>
                )}
              <Text style={{ fontSize: 10 }}>{invoice?.clients?.display_name}</Text>
              <View
                style={{
                  width: "200px",
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                }}
              >
                <Text style={{ fontSize: 10 }}>{getAddress()}</Text>
              </View>
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
                width: "100 px",
              }}
            >
              <Text>DATE</Text>
              <Text>{shortenFormatDate(invoice?.invoice_date)}</Text>
            </View>
            <View
              style={{
                backgroundColor: "#172554",
                color: "white",
                display: "flex",
                alignItems: "center",
                paddingHorizontal: 15,
                paddingVertical: 20,
                width: "135px",
              }}
            >
              <Text>PLEASE PAY</Text>
              <Text>
                {invoice?.currencies?.code} {formatAmount(Number(invoice?.invoice_amount))}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: "#e2e8f0",
                display: "flex",
                alignItems: "center",
                padding: 20,
                width: "100 px",
              }}
            >
              <Text>DUE DATE</Text>
              <Text>{shortenFormatDate(invoice?.due_date)}</Text>
            </View>
          </View>
        </View>

        {/* Items */}
        <View style={{ paddingTop: 40 }}>
          <View style={{ display: "flex", gap: 8, fontSize: 10 }}>
            <View
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "row",
                fontWeight: "bold",
                backgroundColor: "#f3f4f6",
              }}
            >
              <Text
                style={{
                  width: "225 px",
                  padding: 8,
                  borderTop: "1px",
                  borderBottom: "1px",
                  borderColor: "#e2e8f0",
                }}
              >
                DESCRIPTION
              </Text>
              <Text
                style={{
                  width: "100 px",
                  textAlign: "center",
                  padding: 8,
                  borderTop: "1px",
                  borderBottom: "1px",
                  borderColor: "#e2e8f0",
                }}
              >
                QTY
              </Text>
              <Text
                style={{
                  width: "135 px",
                  textAlign: "right",
                  padding: 8,
                  borderTop: "1px",
                  borderBottom: "1px",
                  borderColor: "#e2e8f0",
                }}
              >
                RATE
              </Text>
              <Text
                style={{
                  width: "100 px",
                  textAlign: "right",
                  padding: 8,
                  borderTop: "1px",
                  borderBottom: "1px",
                  borderColor: "#e2e8f0",
                }}
              >
                AMOUNT
              </Text>
            </View>
          </View>
          {invoice?.invoice_details.length === 0 && (
            <View>
              <Text style={{ fontSize: 10, textAlign: "center", paddingTop: 8 }}>
                No available items
              </Text>
            </View>
          )}
          {sortInvoiceDetailsBySequenceNumber(invoice?.invoice_details ?? []).map((item, index) => (
            <View
              key={index}
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "row",
                fontSize: 10,
              }}
              wrap={false}
            >
              <View
                style={{
                  width: "225 px",
                  padding: 8,
                  borderBottom: "1px",
                  borderColor: "#e2e8f0",
                }}
              >
                <Text>{item.details}</Text>
              </View>
              <View
                style={{
                  width: "100 px",
                  padding: 8,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderBottom: "1px",
                  borderColor: "#e2e8f0",
                }}
              >
                <Text>{formatInteger(Number(item.quantity))}</Text>
              </View>
              <View
                style={{
                  width: "135 px",
                  padding: 8,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-end",
                  borderBottom: "1px",
                  borderColor: "#e2e8f0",
                }}
              >
                <Text>{formatAmount(Number(item.rate))}</Text>
              </View>
              <View
                style={{
                  width: "100 px",
                  padding: 8,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-end",
                  borderBottom: "1px",
                  borderColor: "#e2e8f0",
                }}
              >
                <Text>{formatAmount(Number(item.total))}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Payment */}
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            paddingTop: 40,
          }}
          wrap={false}
        >
          <View style={{ display: "flex", gap: 8, fontSize: 10 }}>
            <Text style={{ fontWeight: "bold" }}>PLEASE DIRECT PAYMENT TO:</Text>
            <PaymentAccountSection paymentAccount={invoice?.payment_accounts} />
          </View>
          <View style={{ width: "45%", display: "flex" }}>
            {invoice?.tax_types !== undefined &&
              invoice.tax_types !== null &&
              invoice.tax_types.rate?.toString() !== "0" && (
                <>
                  <View style={{ display: "flex" }}>
                    <View
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={{ fontSize: 10 }}>SUBTOTAL</Text>
                      <Text style={{ fontSize: 10 }}>
                        {formatAmount(Number(invoice?.sub_total))}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            {invoice?.discount_toggle === true && (
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontSize: 10 }}>DISCOUNT ({invoice.discount_amount}%)</Text>
                <Text style={{ fontSize: 10 }}>{getDiscountAmount()}</Text>
              </View>
            )}
            {invoice?.tax_types !== undefined &&
              invoice.tax_types !== null &&
              invoice.tax_types.rate?.toString() !== "0" && (
                <>
                  <View style={{ display: "flex" }}>
                    {invoice.discount_toggle === true && (
                      <View
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                          paddingTop: 20,
                        }}
                      >
                        <Text style={{ fontSize: 10 }}>AMOUNT AFTER DISCOUNT</Text>
                        <Text style={{ fontSize: 10 }}>{getAmountAfterDiscount()}</Text>
                      </View>
                    )}
                    <View
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={{ fontSize: 10 }}>TAX</Text>
                      <Text style={{ fontSize: 10 }}>
                        {formatAmount(Number(invoice?.tax_amount))}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ borderTop: "1px", borderColor: "#e2e8f0" }} />
                </>
              )}
            <View style={{ display: "flex", gap: 16 }}>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: "semibold" }}>TOTAL DUE</Text>
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  {invoice?.currencies?.code} {formatAmount(Number(invoice?.invoice_amount))}
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

interface Props {
  paymentAccount?: PaymentAccount | null
}

const PaymentAccountSection = ({ paymentAccount }: Props) => {
  if (paymentAccount?.payment_networks?.name === PaymentNetworkOption.FAST) {
    return (
      <>
        <View>
          {paymentAccount.account_name !== null && paymentAccount.account_name.length > 0 && (
            <Detail label='Account Name' description={paymentAccount.account_name} />
          )}
          {paymentAccount.account_no !== null && paymentAccount.account_no.length > 0 && (
            <Detail label='Account Number' description={paymentAccount.account_no} />
          )}
        </View>
        <View>
          <Detail label='Payment Network' description={paymentAccount.payment_networks.name} />
          {paymentAccount.bank_name !== null && paymentAccount.bank_name.length > 0 && (
            <Detail label='Bank Name' description={paymentAccount.bank_name} />
          )}
          {paymentAccount.bank_code !== undefined &&
            paymentAccount.bank_code !== null &&
            paymentAccount.bank_code.length > 0 && (
              <Detail label='Bank Code' description={paymentAccount.bank_code} />
            )}
          {((paymentAccount.address1 !== undefined &&
            paymentAccount.address1 !== null &&
            paymentAccount.address1.length > 0) ??
            (paymentAccount.address2 !== undefined &&
              paymentAccount.address2 !== null &&
              paymentAccount.address2.length > 0) ??
            paymentAccount.countries ??
            (paymentAccount.postal_code !== null && paymentAccount.postal_code.length > 0)) && (
            <View>
              <Text style={{ fontWeight: "semibold" }}>Bank Address:</Text>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  paddingLeft: "16px",
                }}
              >
                {paymentAccount.address1?.split("").map((txt, i) => {
                  return <Text key={i}>{txt}</Text>
                })}
              </View>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  paddingLeft: "16px",
                }}
              >
                {paymentAccount.address2?.split("").map((txt, i) => {
                  return <Text key={i}>{txt}</Text>
                })}
              </View>
              <View style={{ display: "flex", paddingLeft: "16px" }}>
                <Text>
                  {paymentAccount.countries?.name} {paymentAccount.postal_code}
                </Text>
              </View>
            </View>
          )}
        </View>
      </>
    )
  }

  if (paymentAccount?.payment_networks?.name === PaymentNetworkOption.SWIFT) {
    return (
      <>
        <View>
          {paymentAccount.account_name !== null && paymentAccount.account_name.length > 0 && (
            <Detail label='Account Name' description={paymentAccount.account_name} />
          )}
          {paymentAccount.account_type !== undefined &&
            paymentAccount.account_type !== null &&
            paymentAccount.account_type.length > 0 && (
              <Detail label='Account Type' description={paymentAccount.account_type} />
            )}
          {paymentAccount.account_no !== null && paymentAccount.account_no.length > 0 && (
            <Detail label='Account Number' description={paymentAccount.account_no} />
          )}
        </View>
        <View>
          {paymentAccount.bank_name !== null && paymentAccount.bank_name.length > 0 && (
            <Detail label='Bank Name' description={paymentAccount.bank_name} />
          )}
          {paymentAccount.bank_branch !== null && paymentAccount.bank_branch.length > 0 && (
            <Detail label='Bank Branch' description={paymentAccount.bank_branch ?? ""} />
          )}
          {paymentAccount.swift_code !== undefined &&
            paymentAccount.swift_code !== null &&
            paymentAccount.swift_code.length > 0 && (
              <Detail label='Swift Code' description={paymentAccount.swift_code} />
            )}
        </View>
      </>
    )
  }

  return (
    <>
      <View>
        {paymentAccount?.account_name !== undefined &&
          paymentAccount.account_name !== null &&
          paymentAccount.account_name.length > 0 && (
            <Detail label='Account Name' description={paymentAccount.account_name} />
          )}
        {paymentAccount?.account_type !== undefined &&
          paymentAccount.account_type !== null &&
          paymentAccount.account_type.length > 0 && (
            <Detail label='Account Type' description={paymentAccount.account_type} />
          )}
        {paymentAccount?.account_no !== undefined &&
          paymentAccount.account_no !== null &&
          paymentAccount.account_no.length > 0 && (
            <Detail label='Account Number' description={paymentAccount.account_no} />
          )}
      </View>
      <View>
        {paymentAccount?.bank_name !== undefined &&
          paymentAccount.bank_name !== null &&
          paymentAccount.bank_name.length > 0 && (
            <Detail label='Bank Name' description={paymentAccount.bank_name} />
          )}
        {paymentAccount?.bank_branch !== undefined &&
          paymentAccount.bank_branch !== null &&
          paymentAccount.bank_branch.length > 0 && (
            <Detail label='Bank Branch' description={paymentAccount.bank_branch} />
          )}
      </View>
    </>
  )
}

const Detail = ({ label, description }: { label: string; description: string }) => {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
      }}
    >
      <Text style={{ fontWeight: "semibold" }}>{label}: </Text>
      {description.split("").map((txt, i) => {
        return <Text key={i}>{txt}</Text>
      })}
    </View>
  )
}
