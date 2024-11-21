import { object, string, number, boolean, array } from "yup"

export const createPaymentAccountSchema = object().shape({
  name: string().required("Account name is required"),
  account_name: string().required("Account holder's name is required"),
  account_no: string().required("Account number is required"),
  bank_name: string().required("Bank name is required"),

  currency_id: number().nullable(),
  payment_network_id: number().nullable(),

  account_type: string().nullable(),
  bank_branch: string().nullable(),
  bank_code: string().nullable(),
  swift_code: string().nullable(),

  address1: string().nullable(),
  address2: string().nullable(),
  city: string().nullable(),
  state: string().nullable(),
  country_id: number().nullable(),
  postal_code: string().nullable(),

  is_active: boolean().required(),
})

export const paymentAccountOrderBySchema = array().of(
  object()
    .shape({
      name: string().oneOf(["asc", "desc"]).optional(),
      created_at: string().oneOf(["asc", "desc"]).optional(),
    })
    .test(
      "only-one-field",
      'Object must contain either "name" or "created_at", but not both',
      function (value) {
        const hasName = value?.name !== undefined
        const hasCreatedAt = value?.created_at !== undefined
        return (hasName && !hasCreatedAt) || (!hasName && hasCreatedAt)
          ? true
          : this.createError({
              message: 'Object must contain either "name" or "created_at", but not both',
            })
      }
    )
)

export const paymentAccountSchema = object().shape({
  orderBy: paymentAccountOrderBySchema,
})
